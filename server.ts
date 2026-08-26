import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { usersTable, reportsTable, auditLogsTable, hashPassword, DEFAULT_DEMO_PASSWORD_HASH, DBUser } from './server/db';
import { JAKARTA_SELATAN_DISTRICTS, JAKARTA_SELATAN_OFFICIAL_HIERARCHY, NATIONAL_PROVINCES, DKI_JAKARTA_REGENCIES, SERVICE_TYPES, getNationalWilayahCounts } from './src/data/regionsData';
import { ServiceReport, User, UserAuditLog } from './src/types';

const PORT = 3000;

// Simple in-memory session token store
const activeSessions = new Map<string, DBUser>();

// Initialize default active tokens for standard demo accounts so restarts don't invalidate tokens
usersTable.forEach(u => {
  activeSessions.set(`token-${u.id}`, u);
  activeSessions.set(`token-${u.username}`, u);
});

// Middleware to extract authenticated user
function authenticate(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Silakan login terlebih dahulu.' });
  }

  const token = authHeader.substring(7);
  let user = activeSessions.get(token);

  // Fallback: If token format is token-<userId>-<timestamp> or token-<userId>, try to recover user from db
  if (!user && token.startsWith('token-')) {
    const parts = token.split('-');
    const possibleUserId = parts.slice(1, parts.length > 2 ? parts.length - 1 : undefined).join('-');
    const matchedUser = usersTable.find(u => u.id === possibleUserId || token.includes(u.id) || token.includes(u.username));
    if (matchedUser) {
      activeSessions.set(token, matchedUser);
      user = matchedUser;
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Session kadaluarsa atau tidak valid. Silakan login kembali.' });
  }

  // Check if account has been deactivated
  if (user.status === 'INACTIVE') {
    activeSessions.delete(token);
    return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator Sudin.' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // AUTH API
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const inputHash = hashPassword(password);
    const user = usersTable.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && 
           (u.passwordHash === inputHash || u.passwordHash === password)
    );

    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    // Check if account is active
    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator Sudin.' });
    }

    // Update last login timestamp
    user.lastLoginAt = new Date().toISOString();

    // Generate token
    const token = `token-${user.id}-${Date.now()}`;
    activeSessions.set(token, user);

    const safeUser: User = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      province: user.province,
      provinceCode: user.provinceCode,
      regency: user.regency,
      regencyCode: user.regencyCode,
      district: user.district,
      districtCode: user.districtCode,
      village: user.village,
      villageCode: user.villageCode,
      scopeCode: user.scopeCode,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      requirePasswordChange: user.requirePasswordChange
    };

    res.json({
      success: true,
      token,
      user: safeUser,
      message: `Selamat datang, ${user.name}`
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeSessions.delete(token);
    }
    res.json({ success: true, message: 'Berhasil keluar.' });
  });

  app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    const safeUser: User = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      province: user.province,
      provinceCode: user.provinceCode,
      regency: user.regency,
      regencyCode: user.regencyCode,
      district: user.district,
      districtCode: user.districtCode,
      village: user.village,
      villageCode: user.villageCode,
      scopeCode: user.scopeCode,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      requirePasswordChange: user.requirePasswordChange
    };
    res.json({ user: safeUser });
  });

  // Ganti Password Akun Sendiri (Accessible to ALL authenticated roles)
  app.post('/api/auth/change-password', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    const currentToken: string = (req as any).token;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Seluruh field password wajib diisi.' });
    }

    // 1. Verify old password
    const isOldMatch = user.passwordHash === hashPassword(oldPassword) || user.passwordHash === oldPassword;
    if (!isOldMatch) {
      return res.status(400).json({ error: 'Password lama tidak sesuai.' });
    }

    // 2. Validate new password length and characters (min 8 chars, letters and numbers)
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      return res.status(400).json({
        error: 'Password baru minimal 8 karakter dan harus mengandung huruf dan angka.'
      });
    }

    // 3. New password cannot be identical to old password
    if (newPassword === oldPassword) {
      return res.status(400).json({
        error: 'Password baru tidak boleh sama dengan password lama.'
      });
    }

    // 4. Confirm password matches
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Konfirmasi password tidak sama.'
      });
    }

    // 5. Update hashed password securely
    user.passwordHash = hashPassword(newPassword);
    user.requirePasswordChange = false;

    // 6. Invalidate other active sessions of this user
    for (const [t, u] of activeSessions.entries()) {
      if (u.id === user.id && t !== currentToken) {
        activeSessions.delete(t);
      }
    }

    // 7. Record Audit Log (NO plaintext password in log!)
    const targetRegionLabel = user.role === 'SUDIN' 
      ? 'Jakarta Selatan (31.74)' 
      : (user.role === 'KECAMATAN' ? `Kec. ${user.district} (${user.scopeCode})` : `Kel. ${user.village} (${user.scopeCode})`);

    auditLogsTable.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'USER_PASSWORD_CHANGED',
      performedById: user.id,
      performedByUsername: user.username,
      targetUserId: user.id,
      targetUsername: user.username,
      targetRole: user.role,
      targetRegion: targetRegionLabel,
      details: 'Pengguna berhasil mengganti password akun sendiri',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Password berhasil diganti. Silakan gunakan password baru untuk login berikutnya.'
    });
  });

  // ==========================================
  // DASHBOARD STATS API (With Strict RBAC)
  // ==========================================
  app.get('/api/dashboard/stats', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    let { startDate, endDate, district, village } = req.query as { [key: string]: string };

    // Strict Cross-Access Rejection
    if (user.role === 'KELURAHAN') {
      if (district && district !== user.district) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kelurahan hanya dapat mengakses data kelurahannya sendiri.' });
      }
      if (village && village !== user.village) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kelurahan hanya dapat mengakses data kelurahannya sendiri.' });
      }
      district = user.district || '';
      village = user.village || '';
    } else if (user.role === 'KECAMATAN') {
      if (district && district !== user.district) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kecamatan hanya dapat mengakses data kecamatannya sendiri.' });
      }
      if (village) {
        const kec = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
        if (!kec || !kec.villages.includes(village)) {
          return res.status(403).json({ error: 'Akses ditolak: Kelurahan yang diminta tidak berada di bawah kecamatan Anda.' });
        }
      }
      district = user.district || '';
    }

    // Filter reports
    let filtered = reportsTable.filter(r => {
      if (user.role === 'KELURAHAN') {
        if (r.district !== user.district || r.village !== user.village) return false;
      } else if (user.role === 'KECAMATAN') {
        if (r.district !== user.district) return false;
        if (village && r.village !== village) return false;
      } else {
        // SUDIN
        if (district && r.district !== district) return false;
        if (village && r.village !== village) return false;
      }

      if (startDate && r.reportDate < startDate) return false;
      if (endDate && r.reportDate > endDate) return false;

      return true;
    });

    // Total Services
    const totalServices = filtered.reduce((acc, curr) => acc + curr.quantity, 0);

    // Active Districts and Villages count based on role coverage
    let totalDistrictsCount = 10;
    let totalVillagesCount = 65;

    if (user.role === 'KELURAHAN') {
      totalDistrictsCount = 1;
      totalVillagesCount = 1;
    } else if (user.role === 'KECAMATAN') {
      totalDistrictsCount = 1;
      const kec = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
      totalVillagesCount = kec ? kec.villages.length : 1;
    }

    // Service Breakdown & Categories Breakdown
    const categoryTotals: { [cat: string]: number } = {
      'Kependudukan': 0,
      'Pencatatan Sipil': 0,
      'Mutasi Penduduk': 0,
      'Identitas Digital': 0
    };

    const serviceMap = new Map<string, { total: number; category: string }>();
    SERVICE_TYPES.forEach(s => serviceMap.set(s.name, { total: 0, category: s.category }));
    
    filtered.forEach(r => {
      const item = serviceMap.get(r.serviceType);
      if (item) {
        item.total += r.quantity;
        if (categoryTotals[item.category] !== undefined) {
          categoryTotals[item.category] += r.quantity;
        }
      }
    });

    const servicesBreakdown = Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      category: data.category,
      total: data.total,
      percentage: totalServices > 0 ? Number(((data.total / totalServices) * 100).toFixed(1)) : 0
    }));

    const categoryColors: { [cat: string]: string } = {
      'Kependudukan': '#3b82f6',
      'Pencatatan Sipil': '#10b981',
      'Mutasi Penduduk': '#f59e0b',
      'Identitas Digital': '#8b5cf6'
    };

    const categoriesBreakdown = Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: totalServices > 0 ? Number(((total / totalServices) * 100).toFixed(1)) : 0,
      color: categoryColors[category] || '#64748b'
    }));

    const sortedServices = [...servicesBreakdown].sort((a, b) => b.total - a.total);
    const maxService = sortedServices[0] || { name: '-', total: 0, percentage: 0 };
    const minService = [...sortedServices].sort((a, b) => a.total - b.total)[0] || { name: '-', total: 0, percentage: 0 };

    // District & Village Rankings and Breakdowns based on Role
    let rankingDistricts: any[] | undefined = undefined;
    let rankingVillages: any[] = [];
    let maxDistrict: any = undefined;
    let minDistrict: any = undefined;
    let maxVillage: any = undefined;
    let minVillage: any = undefined;

    const districtMap = new Map<string, number>();

    if (user.role === 'KELURAHAN') {
      districtMap.set(user.village || 'Kelurahan', totalServices);
      rankingVillages = [{
        rank: 1,
        name: user.village || 'Kelurahan',
        parentDistrict: user.district || 'Kecamatan',
        total: totalServices,
        percentage: 100
      }];
      maxVillage = { name: user.village || '-', district: user.district, total: totalServices };
      minVillage = { name: user.village || '-', district: user.district, total: totalServices };
    } else if (user.role === 'KECAMATAN') {
      const kec = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
      const vilCounts = new Map<string, number>();
      if (kec) {
        kec.villages.forEach(v => {
          vilCounts.set(v, 0);
          districtMap.set(v, 0);
        });
      }
      filtered.forEach(r => {
        vilCounts.set(r.village, (vilCounts.get(r.village) || 0) + r.quantity);
        districtMap.set(r.village, (districtMap.get(r.village) || 0) + r.quantity);
      });

      const vilList = Array.from(vilCounts.entries()).map(([name, count]) => ({
        name,
        parentDistrict: user.district,
        total: count,
        percentage: totalServices > 0 ? Number(((count / totalServices) * 100).toFixed(1)) : 0
      }));
      vilList.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
      rankingVillages = vilList.map((item, idx) => ({ ...item, rank: idx + 1 }));

      maxVillage = rankingVillages[0] ? { name: rankingVillages[0].name, district: user.district, total: rankingVillages[0].total } : undefined;
      const sortedMinVil = [...rankingVillages].sort((a, b) => a.total - b.total || a.name.localeCompare(b.name));
      minVillage = sortedMinVil[0] ? { name: sortedMinVil[0].name, district: user.district, total: sortedMinVil[0].total } : undefined;
    } else {
      // SUDIN: All 10 Kecamatan & 65 Kelurahan
      const distCounts = new Map<string, number>();
      JAKARTA_SELATAN_DISTRICTS.forEach(d => {
        distCounts.set(d.name, 0);
        districtMap.set(d.name, 0);
      });

      const allVilCounts = new Map<string, { village: string; district: string; count: number }>();
      JAKARTA_SELATAN_DISTRICTS.forEach(d => {
        d.villages.forEach(v => {
          allVilCounts.set(v, { village: v, district: d.name, count: 0 });
        });
      });

      filtered.forEach(r => {
        if (distCounts.has(r.district)) {
          distCounts.set(r.district, (distCounts.get(r.district) || 0) + r.quantity);
          districtMap.set(r.district, (districtMap.get(r.district) || 0) + r.quantity);
        }
        if (allVilCounts.has(r.village)) {
          const item = allVilCounts.get(r.village)!;
          item.count += r.quantity;
        }
      });

      // Rank Districts (1-10)
      const dList = Array.from(distCounts.entries()).map(([name, count]) => ({
        name,
        total: count,
        percentage: totalServices > 0 ? Number(((count / totalServices) * 100).toFixed(1)) : 0
      }));
      dList.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
      rankingDistricts = dList.map((item, idx) => ({ ...item, rank: idx + 1 }));
      maxDistrict = rankingDistricts[0] ? { name: rankingDistricts[0].name, total: rankingDistricts[0].total } : undefined;
      const sortedMinDist = [...rankingDistricts].sort((a, b) => a.total - b.total || a.name.localeCompare(b.name));
      minDistrict = sortedMinDist[0] ? { name: sortedMinDist[0].name, total: sortedMinDist[0].total } : undefined;

      // Rank Villages (1-65)
      const vList = Array.from(allVilCounts.values()).map(item => ({
        name: item.village,
        parentDistrict: item.district,
        total: item.count,
        percentage: totalServices > 0 ? Number(((item.count / totalServices) * 100).toFixed(1)) : 0
      }));
      vList.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
      rankingVillages = vList.map((item, idx) => ({ ...item, rank: idx + 1 }));
      maxVillage = rankingVillages[0] ? { name: rankingVillages[0].name, district: rankingVillages[0].parentDistrict, total: rankingVillages[0].total } : undefined;
      const sortedMinVil = [...rankingVillages].sort((a, b) => a.total - b.total || a.name.localeCompare(b.name));
      minVillage = sortedMinVil[0] ? { name: sortedMinVil[0].name, district: sortedMinVil[0].parentDistrict, total: sortedMinVil[0].total } : undefined;
    }

    const districtsBreakdown = Array.from(districtMap.entries()).map(([district, total]) => ({
      district,
      total,
      percentage: totalServices > 0 ? Number(((total / totalServices) * 100).toFixed(1)) : 0
    }));

    // Service Regional Analysis (For SUDIN & KECAMATAN)
    let regionalServiceAnalysis: any[] | undefined = undefined;
    if (user.role === 'SUDIN') {
      regionalServiceAnalysis = SERVICE_TYPES.map(service => {
        const distCountMap = new Map<string, number>();
        JAKARTA_SELATAN_DISTRICTS.forEach(d => distCountMap.set(d.name, 0));

        const vilCountMap = new Map<string, { village: string; district: string; count: number }>();
        JAKARTA_SELATAN_DISTRICTS.forEach(d => {
          d.villages.forEach(v => {
            vilCountMap.set(v, { village: v, district: d.name, count: 0 });
          });
        });

        let totalServiceCount = 0;
        filtered.forEach(r => {
          if (r.serviceType === service.name) {
            totalServiceCount += r.quantity;
            if (distCountMap.has(r.district)) {
              distCountMap.set(r.district, (distCountMap.get(r.district) || 0) + r.quantity);
            }
            if (vilCountMap.has(r.village)) {
              vilCountMap.get(r.village)!.count += r.quantity;
            }
          }
        });

        const districtList = Array.from(distCountMap.entries()).map(([name, count]) => ({ name, count }));
        districtList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        const maxDist = districtList[0] || { name: '-', count: 0 };
        const minDist = [...districtList].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name))[0] || { name: '-', count: 0 };

        const villageList = Array.from(vilCountMap.values()).map(item => ({
          name: item.village,
          parentDistrict: item.district,
          count: item.count
        }));
        villageList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        const maxVil = villageList[0] || { name: '-', parentDistrict: '', count: 0 };
        const minVil = [...villageList].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name))[0] || { name: '-', parentDistrict: '', count: 0 };

        return {
          serviceName: service.name,
          serviceCategory: service.category,
          totalServiceCount,
          maxDistrict: maxDist,
          minDistrict: minDist,
          maxVillage: maxVil,
          minVillage: minVil
        };
      });
    } else if (user.role === 'KECAMATAN') {
      const kec = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
      const targetVillages = kec ? kec.villages : [];

      regionalServiceAnalysis = SERVICE_TYPES.map(service => {
        const vilCountMap = new Map<string, number>();
        targetVillages.forEach(v => vilCountMap.set(v, 0));

        let totalServiceCount = 0;
        filtered.forEach(r => {
          if (r.serviceType === service.name) {
            totalServiceCount += r.quantity;
            if (vilCountMap.has(r.village)) {
              vilCountMap.set(r.village, (vilCountMap.get(r.village) || 0) + r.quantity);
            }
          }
        });

        const vList = Array.from(vilCountMap.entries()).map(([name, count]) => ({
          name,
          parentDistrict: user.district,
          count
        }));
        vList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        const maxVil = vList[0] || { name: '-', parentDistrict: user.district, count: 0 };
        const minVil = [...vList].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name))[0] || { name: '-', parentDistrict: user.district, count: 0 };

        return {
          serviceName: service.name,
          serviceCategory: service.category,
          totalServiceCount,
          maxVillage: maxVil,
          minVillage: minVil
        };
      });
    }

    // Trend Timeline Series (Grouped by Date)
    const trendMap = new Map<string, { total: number; kependudukan: number; capil: number; mutasi: number; digital: number }>();
    
    filtered.forEach(r => {
      const dateKey = r.reportDate;
      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, { total: 0, kependudukan: 0, capil: 0, mutasi: 0, digital: 0 });
      }
      const pt = trendMap.get(dateKey)!;
      pt.total += r.quantity;
      if (r.category === 'Kependudukan') pt.kependudukan += r.quantity;
      else if (r.category === 'Pencatatan Sipil') pt.capil += r.quantity;
      else if (r.category === 'Mutasi Penduduk') pt.mutasi += r.quantity;
      else if (r.category === 'Identitas Digital') pt.digital += r.quantity;
    });

    const formatShortDate = (dStr: string) => {
      try {
        const parts = dStr.split('-');
        if (parts.length === 3) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const mIdx = parseInt(parts[1], 10) - 1;
          return `${parseInt(parts[2], 10)} ${months[mIdx] || ''}`;
        }
      } catch {}
      return dStr;
    };

    const trendSeries = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({
        date,
        formattedDate: formatShortDate(date),
        total: counts.total,
        kependudukan: counts.kependudukan,
        capil: counts.capil,
        mutasi: counts.mutasi,
        digital: counts.digital
      }));

    // Mutation Dynamics Analysis (Pindah Datang & Pindah Keluar)
    const mutationParams = [
      'Antar Kelurahan dalam 1 Kecamatan',
      'Antar Kecamatan dalam 1 Kota/Kabupaten',
      'Antar Kota/Kabupaten dalam 1 Provinsi',
      'Antar Provinsi'
    ];

    const pdParamMap = new Map<string, number>();
    const pkParamMap = new Map<string, number>();
    mutationParams.forEach(p => {
      pdParamMap.set(p, 0);
      pkParamMap.set(p, 0);
    });

    let totalPindahDatang = 0;
    let totalPindahKeluar = 0;

    filtered.forEach(r => {
      if (r.serviceType === 'Pindah Datang') {
        totalPindahDatang += r.quantity;
        if (r.detailRegion && pdParamMap.has(r.detailRegion)) {
          pdParamMap.set(r.detailRegion, (pdParamMap.get(r.detailRegion) || 0) + r.quantity);
        } else if (r.detailRegion) {
          pdParamMap.set(r.detailRegion, (pdParamMap.get(r.detailRegion) || 0) + r.quantity);
        }
      } else if (r.serviceType === 'Pindah Keluar') {
        totalPindahKeluar += r.quantity;
        if (r.detailRegion && pkParamMap.has(r.detailRegion)) {
          pkParamMap.set(r.detailRegion, (pkParamMap.get(r.detailRegion) || 0) + r.quantity);
        } else if (r.detailRegion) {
          pkParamMap.set(r.detailRegion, (pkParamMap.get(r.detailRegion) || 0) + r.quantity);
        }
      }
    });

    const mutationSummary = {
      totalPindahDatang,
      totalPindahKeluar,
      netMigration: totalPindahDatang - totalPindahKeluar,
      pindahDatangDetails: Array.from(pdParamMap.entries()).map(([param, count]) => ({
        param,
        count,
        percentage: totalPindahDatang > 0 ? Number(((count / totalPindahDatang) * 100).toFixed(1)) : 0
      })),
      pindahKeluarDetails: Array.from(pkParamMap.entries()).map(([param, count]) => ({
        param,
        count,
        percentage: totalPindahKeluar > 0 ? Number(((count / totalPindahKeluar) * 100).toFixed(1)) : 0
      }))
    };

    // Automated Insights Generation (Data-Grounded)
    const insights: any[] = [];

    // Insight 1: Volume Tertinggi
    if (maxService && maxService.total > 0) {
      insights.push({
        id: 'ins-top-service',
        category: 'layanan',
        title: `Pelayanan Terbanyak: ${maxService.name}`,
        description: `Mendominasi sebanyak ${maxService.total.toLocaleString('id-ID')} pelayanan (${maxService.percentage}% dari total pelayanan aktif).`,
        badgeType: 'success'
      });
    }

    // Insight 2: Volume Terendah
    if (minService && minService.total >= 0) {
      insights.push({
        id: 'ins-low-service',
        category: 'layanan',
        title: `Pelayanan Terdikit: ${minService.name}`,
        description: `Tercatat ${minService.total.toLocaleString('id-ID')} pelayanan (${minService.percentage}% dari total). Perlu evaluasi kelancaran atau kebutuhan sosialisasi.`,
        badgeType: 'warning'
      });
    }

    // Insight 3: Wilayah / Performa Komparatif
    if (user.role === 'SUDIN' && maxDistrict && minDistrict) {
      insights.push({
        id: 'ins-district-rank',
        category: 'wilayah',
        title: `Distribusi Kecamatan`,
        description: `Kec. ${maxDistrict.name} memimpin dengan ${maxDistrict.total.toLocaleString('id-ID')} pelayanan, sedangkan Kec. ${minDistrict.name} terendah dengan ${minDistrict.total.toLocaleString('id-ID')} pelayanan.`,
        badgeType: 'primary'
      });
      if (maxVillage) {
        insights.push({
          id: 'ins-village-top',
          category: 'wilayah',
          title: `Kelurahan Teraktif se-Jaksel`,
          description: `Kel. ${maxVillage.name} (${maxVillage.district}) mencatatkan volume tertinggi sebanyak ${maxVillage.total.toLocaleString('id-ID')} pelayanan.`,
          badgeType: 'info'
        });
      }
    } else if (user.role === 'KECAMATAN' && maxVillage && minVillage) {
      insights.push({
        id: 'ins-kec-village',
        category: 'wilayah',
        title: `Sebaran Kelurahan di ${user.district}`,
        description: `Kel. ${maxVillage.name} tertinggi (${maxVillage.total.toLocaleString('id-ID')} pelayanan), dan Kel. ${minVillage.name} terendah (${minVillage.total.toLocaleString('id-ID')} pelayanan).`,
        badgeType: 'primary'
      });
    } else if (user.role === 'KELURAHAN') {
      const topCat = [...categoriesBreakdown].sort((a, b) => b.total - a.total)[0];
      if (topCat && topCat.total > 0) {
        insights.push({
          id: 'ins-kel-cat',
          category: 'layanan',
          title: `Kategori Pelayanan Terbanyak: ${topCat.category}`,
          description: `Kategori ${topCat.category} menyumbang ${topCat.total.toLocaleString('id-ID')} pelayanan (${topCat.percentage}% dari seluruh layanan di Kel. ${user.village}).`,
          badgeType: 'info'
        });
      }
    }

    // Insight 4: Mutasi Penduduk
    const netMig = totalPindahDatang - totalPindahKeluar;
    insights.push({
      id: 'ins-mutation',
      category: 'mutasi',
      title: `Dinamika Migrasi Penduduk`,
      description: `Pindah Datang: ${totalPindahDatang.toLocaleString('id-ID')} jiwa vs Pindah Keluar: ${totalPindahKeluar.toLocaleString('id-ID')} jiwa. Arus migrasi bersih: ${netMig >= 0 ? '+' : ''}${netMig.toLocaleString('id-ID')} jiwa.`,
      badgeType: netMig >= 0 ? 'success' : 'warning'
    });

    // Insight 5: Tren Puncak
    if (trendSeries.length > 0) {
      const peakDay = [...trendSeries].sort((a, b) => b.total - a.total)[0];
      if (peakDay && peakDay.total > 0) {
        insights.push({
          id: 'ins-trend-peak',
          category: 'tren',
          title: `Puncak Pelayanan Harian`,
          description: `Aktivitas tertinggi tercatat pada ${peakDay.formattedDate} (${peakDay.date}) dengan total ${peakDay.total.toLocaleString('id-ID')} pelayanan.`,
          badgeType: 'info'
        });
      }
    }

    // Recent reports (top 8)
    const recentReports = [...filtered]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    res.json({
      totalServices,
      totalDistricts: totalDistrictsCount,
      totalVillages: totalVillagesCount,
      periodLabel: startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua Periode',
      servicesBreakdown,
      categoriesBreakdown,
      districtsBreakdown,
      villagesBreakdown: rankingVillages,
      maxService,
      minService,
      maxDistrict,
      minDistrict,
      maxVillage,
      minVillage,
      rankingDistricts,
      rankingVillages,
      trendSeries,
      mutationSummary,
      insights,
      regionalServiceAnalysis,
      recentReports
    });
  });

  // ==========================================
  // REPORTS SUMMARY API (Diagnostic & Summary)
  // ==========================================
  app.get('/api/reports/summary', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    let { startDate, endDate, district, village } = req.query as { [key: string]: string };

    if (user.role === 'KELURAHAN') {
      district = user.district || '';
      village = user.village || '';
    } else if (user.role === 'KECAMATAN') {
      district = user.district || '';
    }

    const filtered = reportsTable.filter(r => {
      if (user.role === 'KELURAHAN') {
        if (r.district !== user.district || r.village !== user.village) return false;
      } else if (user.role === 'KECAMATAN') {
        if (r.district !== user.district) return false;
        if (village && r.village !== village) return false;
      } else {
        if (district && r.district !== district) return false;
        if (village && r.village !== village) return false;
      }
      if (startDate && r.reportDate < startDate) return false;
      if (endDate && r.reportDate > endDate) return false;
      return true;
    });

    const totalReports = filtered.length;
    const totalServices = filtered.reduce((sum, r) => sum + (r.quantity || 0), 0);
    
    const serviceBreakdown: Record<string, number> = {};
    const districtBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};

    filtered.forEach(r => {
      serviceBreakdown[r.serviceType] = (serviceBreakdown[r.serviceType] || 0) + r.quantity;
      districtBreakdown[r.district] = (districtBreakdown[r.district] || 0) + r.quantity;
      if (r.category) {
        categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + r.quantity;
      }
    });

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        district: user.district || null,
        village: user.village || null
      },
      filter: {
        district: district || 'ALL',
        village: village || 'ALL',
        startDate: startDate || null,
        endDate: endDate || null
      },
      summary: {
        totalReports,
        totalServices,
        serviceBreakdown,
        districtBreakdown,
        categoryBreakdown,
        isEmpty: totalReports === 0
      },
      diagnostic: {
        serverReportsTableCount: reportsTable.length,
        isDummyCleaned: reportsTable.every(r => r.createdByUsername !== 'system_auto'),
        structureValid: true
      }
    });
  });

  // ==========================================
  // DATA LAPORAN API (With Strict RBAC)
  // ==========================================
  app.get('/api/reports', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    let { startDate, endDate, district, village, serviceType, category, search } = req.query as { [key: string]: string };

    // Strict Cross-Access Rejection on GET /api/reports
    if (user.role === 'KELURAHAN') {
      if (district && district !== user.district) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kelurahan hanya dapat mengakses data kelurahannya sendiri.' });
      }
      if (village && village !== user.village) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kelurahan hanya dapat mengakses data kelurahannya sendiri.' });
      }
      district = user.district || '';
      village = user.village || '';
    } else if (user.role === 'KECAMATAN') {
      if (district && district !== user.district) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kecamatan hanya dapat mengakses data kecamatannya sendiri.' });
      }
      if (village) {
        const kec = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
        if (!kec || !kec.villages.includes(village)) {
          return res.status(403).json({ error: 'Akses ditolak: Kelurahan yang diminta tidak berada di bawah kecamatan Anda.' });
        }
      }
      district = user.district || '';
    }

    let results = reportsTable.filter(r => {
      // Strict RBAC
      if (user.role === 'KELURAHAN') {
        if (r.district !== user.district || r.village !== user.village) return false;
      } else if (user.role === 'KECAMATAN') {
        if (r.district !== user.district) return false;
        if (village && r.village !== village) return false;
      } else {
        if (district && r.district !== district) return false;
        if (village && r.village !== village) return false;
      }

      if (startDate && r.reportDate < startDate) return false;
      if (endDate && r.reportDate > endDate) return false;
      if (serviceType && r.serviceType !== serviceType) return false;
      if (category && r.category !== category) return false;

      if (search) {
        const q = search.toLowerCase();
        const matches =
          r.district.toLowerCase().includes(q) ||
          r.village.toLowerCase().includes(q) ||
          r.serviceType.toLowerCase().includes(q) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.detailRegion && r.detailRegion.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });

    // Sort descending by reportDate and createdAt
    results.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      total: results.length,
      reports: results
    });
  });

  // ==========================================
  // INPUT LAPORAN API (With Strict RBAC & Validation)
  // ==========================================
  app.post('/api/reports', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    const { reportDate, province, regency, district, village, items, singleReport } = req.body;

    if (!reportDate) {
      return res.status(400).json({ error: 'Tanggal laporan wajib diisi.' });
    }

    const targetDistrict = district || user.district;
    const targetVillage = village || user.village;

    if (!targetDistrict || !targetVillage) {
      return res.status(400).json({ error: 'Kecamatan dan Kelurahan tujuan laporan wajib ditentukan.' });
    }

    // Role verification
    if (user.role === 'KELURAHAN') {
      if (targetDistrict !== user.district || targetVillage !== user.village) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kelurahan hanya dapat menginput laporan untuk kelurahannya sendiri.' });
      }
    } else if (user.role === 'KECAMATAN') {
      if (targetDistrict !== user.district) {
        return res.status(403).json({ error: 'Akses ditolak: Akun Kecamatan hanya dapat menginput laporan untuk wilayah kecamatannya.' });
      }
      const kec = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
      if (!kec || !kec.villages.includes(targetVillage)) {
        return res.status(403).json({ error: 'Akses ditolak: Kelurahan tujuan tidak berada di bawah wilayah kecamatan Anda.' });
      }
    }

    const createdReports: ServiceReport[] = [];
    const nowIso = new Date().toISOString();

    // Check if submitting batch of 11 services
    if (Array.isArray(items) && items.length > 0) {
      // Validate all items first before inserting any record
      for (const item of items) {
        const qty = Number(item.quantity) || 0;
        if (qty > 0) {
          if (item.serviceType === 'Pindah Datang') {
            if (!item.detailRegion || item.detailRegion === '-' || item.detailRegion.includes('undefined') || item.detailRegion.trim() === '') {
              return res.status(400).json({ error: 'Harap isi parameter Pindah Datang terlebih dahulu.' });
            }
            if (item.demographics) {
              const { gender, shdk } = item.demographics;
              const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
              if (totalGender !== qty) {
                return res.status(400).json({
                  error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
                });
              }
              const totalShdk =
                (Number(shdk?.kepalaKeluarga) || 0) +
                (Number(shdk?.istri) || 0) +
                (Number(shdk?.anak) || 0) +
                (Number(shdk?.orangTua) || 0) +
                (Number(shdk?.familiLain) || 0) +
                (Number(shdk?.lainnya) || 0);
              if (totalShdk !== qty) {
                return res.status(400).json({
                  error: `Komposisi SHDK belum lengkap. Total SHDK harus ${qty}.`
                });
              }
            } else {
              return res.status(400).json({ error: 'Data demografi Pindah Datang wajib diisi.' });
            }
          } else if (item.serviceType === 'Pindah Keluar') {
            if (!item.detailRegion || item.detailRegion === '-' || item.detailRegion.includes('undefined') || item.detailRegion.trim() === '') {
              return res.status(400).json({ error: 'Harap isi parameter Pindah Keluar terlebih dahulu.' });
            }
            if (item.demographics) {
              const { gender, shdk } = item.demographics;
              const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
              if (totalGender !== qty) {
                return res.status(400).json({
                  error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
                });
              }
              const totalShdk =
                (Number(shdk?.kepalaKeluarga) || 0) +
                (Number(shdk?.istri) || 0) +
                (Number(shdk?.anak) || 0) +
                (Number(shdk?.orangTua) || 0) +
                (Number(shdk?.familiLain) || 0) +
                (Number(shdk?.lainnya) || 0);
              if (totalShdk !== qty) {
                return res.status(400).json({
                  error: `Komposisi SHDK belum lengkap. Total SHDK harus ${qty}.`
                });
              }
            } else {
              return res.status(400).json({ error: 'Data demografi Pindah Keluar wajib diisi.' });
            }
          } else if (item.serviceType === 'Akta Kelahiran') {
            if (item.demographics) {
              const { gender } = item.demographics;
              const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
              if (totalGender !== qty) {
                return res.status(400).json({
                  error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
                });
              }
              item.demographics.shdk = {
                kepalaKeluarga: 0,
                istri: 0,
                anak: qty,
                orangTua: 0,
                familiLain: 0,
                lainnya: 0
              };
            } else {
              return res.status(400).json({ error: 'Data demografi Akta Kelahiran wajib diisi.' });
            }
          } else if (item.serviceType === 'Akta Kematian') {
            if (item.demographics) {
              const { gender, shdk } = item.demographics;
              const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
              if (totalGender !== qty) {
                return res.status(400).json({
                  error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
                });
              }
              const totalShdk =
                (Number(shdk?.kepalaKeluarga) || 0) +
                (Number(shdk?.istri) || 0) +
                (Number(shdk?.anak) || 0) +
                (Number(shdk?.orangTua) || 0) +
                (Number(shdk?.familiLain) || 0) +
                (Number(shdk?.lainnya) || 0);
              if (totalShdk !== qty) {
                return res.status(400).json({
                  error: `Komposisi SHDK belum lengkap. Total SHDK harus ${qty}.`
                });
              }
            } else {
              return res.status(400).json({ error: 'Data demografi Akta Kematian wajib diisi.' });
            }
          }
        }
      }

      for (const item of items) {
        const qty = Number(item.quantity) || 0;
        if (qty > 0) {
          const newRep: ServiceReport = {
            id: `rep-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            reportDate,
            province: 'DKI Jakarta',
            regency: 'Kota Administrasi Jakarta Selatan',
            district: targetDistrict,
            village: targetVillage,
            serviceType: item.serviceType,
            category: item.category || 'Pelayanan Reguler',
            detailRegion: item.detailRegion || '-',
            quantity: qty,
            demographics: item.demographics,
            createdById: user.id,
            createdByUsername: user.username,
            createdAt: nowIso
          };
          reportsTable.push(newRep);
          createdReports.push(newRep);
        }
      }
    } else if (singleReport) {
      const qty = Number(singleReport.quantity) || 0;
      if (qty <= 0) {
        return res.status(400).json({ error: 'Jumlah pelayanan harus lebih dari 0.' });
      }

      if (singleReport.serviceType === 'Pindah Datang') {
        if (!singleReport.detailRegion || singleReport.detailRegion === '-' || singleReport.detailRegion.includes('undefined') || singleReport.detailRegion.trim() === '') {
          return res.status(400).json({ error: 'Harap isi parameter Pindah Datang terlebih dahulu.' });
        }
        if (singleReport.demographics) {
          const { gender, shdk } = singleReport.demographics;
          const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
          if (totalGender !== qty) {
            return res.status(400).json({
              error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
            });
          }
          const totalShdk =
            (Number(shdk?.kepalaKeluarga) || 0) +
            (Number(shdk?.istri) || 0) +
            (Number(shdk?.anak) || 0) +
            (Number(shdk?.orangTua) || 0) +
            (Number(shdk?.familiLain) || 0) +
            (Number(shdk?.lainnya) || 0);
          if (totalShdk !== qty) {
            return res.status(400).json({
              error: `Komposisi SHDK belum lengkap. Total SHDK harus ${qty}.`
            });
          }
        } else {
          return res.status(400).json({ error: 'Data demografi Pindah Datang wajib diisi.' });
        }
      } else if (singleReport.serviceType === 'Pindah Keluar') {
        if (!singleReport.detailRegion || singleReport.detailRegion === '-' || singleReport.detailRegion.includes('undefined') || singleReport.detailRegion.trim() === '') {
          return res.status(400).json({ error: 'Harap isi parameter Pindah Keluar terlebih dahulu.' });
        }
        if (singleReport.demographics) {
          const { gender, shdk } = singleReport.demographics;
          const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
          if (totalGender !== qty) {
            return res.status(400).json({
              error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
            });
          }
          const totalShdk =
            (Number(shdk?.kepalaKeluarga) || 0) +
            (Number(shdk?.istri) || 0) +
            (Number(shdk?.anak) || 0) +
            (Number(shdk?.orangTua) || 0) +
            (Number(shdk?.familiLain) || 0) +
            (Number(shdk?.lainnya) || 0);
          if (totalShdk !== qty) {
            return res.status(400).json({
              error: `Komposisi SHDK belum lengkap. Total SHDK harus ${qty}.`
            });
          }
        } else {
          return res.status(400).json({ error: 'Data demografi Pindah Keluar wajib diisi.' });
        }
      } else if (singleReport.serviceType === 'Akta Kelahiran') {
        if (singleReport.demographics) {
          const { gender } = singleReport.demographics;
          const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
          if (totalGender !== qty) {
            return res.status(400).json({
              error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
            });
          }
          singleReport.demographics.shdk = {
            kepalaKeluarga: 0,
            istri: 0,
            anak: qty,
            orangTua: 0,
            familiLain: 0,
            lainnya: 0
          };
        } else {
          return res.status(400).json({ error: 'Data demografi Akta Kelahiran wajib diisi.' });
        }
      } else if (singleReport.serviceType === 'Akta Kematian') {
        if (singleReport.demographics) {
          const { gender, shdk } = singleReport.demographics;
          const totalGender = (Number(gender?.male) || 0) + (Number(gender?.female) || 0);
          if (totalGender !== qty) {
            return res.status(400).json({
              error: `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${qty}.`
            });
          }
          const totalShdk =
            (Number(shdk?.kepalaKeluarga) || 0) +
            (Number(shdk?.istri) || 0) +
            (Number(shdk?.anak) || 0) +
            (Number(shdk?.orangTua) || 0) +
            (Number(shdk?.familiLain) || 0) +
            (Number(shdk?.lainnya) || 0);
          if (totalShdk !== qty) {
            return res.status(400).json({
              error: `Komposisi SHDK belum lengkap. Total SHDK harus ${qty}.`
            });
          }
        } else {
          return res.status(400).json({ error: 'Data demografi Akta Kematian wajib diisi.' });
        }
      }

      const newRep: ServiceReport = {
        id: `rep-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        reportDate,
        province: 'DKI Jakarta',
        regency: 'Kota Administrasi Jakarta Selatan',
        district: targetDistrict,
        village: targetVillage,
        serviceType: singleReport.serviceType,
        category: singleReport.category || 'Pelayanan Reguler',
        detailRegion: singleReport.detailRegion || '-',
        quantity: qty,
        demographics: singleReport.demographics,
        createdById: user.id,
        createdByUsername: user.username,
        createdAt: nowIso
      };
      reportsTable.push(newRep);
      createdReports.push(newRep);
    } else {
      return res.status(400).json({ error: 'Format data laporan tidak valid.' });
    }

    res.status(201).json({
      success: true,
      message: `Laporan berhasil disimpan (${createdReports.length} jenis pelayanan).`,
      savedCount: createdReports.length
    });
  });

  // ==========================================
  // MASTER WILAYAH API (10 Kecamatan, 65 Kelurahan + Aggregated Services)
  // ==========================================
  app.get('/api/regions/jakarta-selatan', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;

    // Filter which districts to show based on role if desired, or show all with indicators
    const data = JAKARTA_SELATAN_DISTRICTS.map(dist => {
      // Calculate total for each village under this district
      let districtTotal = 0;
      const villagesWithTotals = dist.villages.map(vil => {
        // Compute total services logged for this village
        const vilTotal = reportsTable
          .filter(r => r.district === dist.name && r.village === vil)
          .reduce((sum, r) => sum + r.quantity, 0);

        districtTotal += vilTotal;

        return {
          villageName: vil,
          totalServices: vilTotal
        };
      });

      return {
        districtName: dist.name,
        totalVillages: dist.villages.length,
        totalServices: districtTotal,
        villages: villagesWithTotals
      };
    });

    res.json({
      regency: 'Kota Administrasi Jakarta Selatan',
      province: 'DKI Jakarta',
      totalDistricts: JAKARTA_SELATAN_DISTRICTS.length,
      totalVillages: 65,
      districts: data
    });
  });

  // ==========================================
  // CASCADING REGIONS LOOKUP API (National & DKI)
  // ==========================================
  app.get('/api/regions/national-stats', (req: Request, res: Response) => {
    res.json({
      source: 'Keputusan Menteri Dalam Negeri (Kepmendagri) No. 300.2.2-2430 Tahun 2025',
      ...getNationalWilayahCounts()
    });
  });

  app.get('/api/regions/cascading', (req: Request, res: Response) => {
    const { mode, province, regency, district } = req.query as { [key: string]: string };

    // Mode "dalam_dki": only DKI Jakarta administrative cities
    if (mode === 'dalam_dki') {
      if (!regency) {
        return res.json({
          regencies: DKI_JAKARTA_REGENCIES.map(r => r.name)
        });
      }

      const selectedRegency = DKI_JAKARTA_REGENCIES.find(r => r.name === regency);
      if (!selectedRegency) return res.json({ districts: [], villages: [] });

      if (!district) {
        return res.json({
          districts: selectedRegency.districts.map(d => d.name)
        });
      }

      const selectedDistrict = selectedRegency.districts.find(d => d.name === district);
      if (!selectedDistrict) return res.json({ villages: [] });

      return res.json({
        villages: selectedDistrict.villages
      });
    }

    // Mode "luar_dki" or national
    if (!province) {
      return res.json({
        provinces: NATIONAL_PROVINCES.map(p => p.name)
      });
    }

    const selectedProv = NATIONAL_PROVINCES.find(p => p.name === province);
    if (!selectedProv) return res.json({ regencies: [], districts: [], villages: [] });

    if (!regency) {
      return res.json({
        regencies: selectedProv.regencies.map(r => r.name)
      });
    }

    const selectedReg = selectedProv.regencies.find(r => r.name === regency);
    if (!selectedReg) return res.json({ districts: [], villages: [] });

    if (!district) {
      return res.json({
        districts: selectedReg.districts.map(d => d.name)
      });
    }

    const selectedDist = selectedReg.districts.find(d => d.name === district);
    if (!selectedDist) return res.json({ villages: [] });

    return res.json({
      villages: selectedDist.villages
    });
  });

  // ==========================================
  // MANAJEMEN PETUGAS & ADMIN API (SUDIN ONLY)
  // ==========================================
  
  // 1. Get All Officers
  app.get('/api/admin/users', authenticate, (req: Request, res: Response) => {
    const user: DBUser = (req as any).user;
    if (user.role !== 'SUDIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya SUDIN / Super Admin yang dapat mengakses Manajemen Petugas.' });
    }

    const list = usersTable.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      district: u.district || (u.role === 'SUDIN' ? 'Semua Kecamatan' : ''),
      districtCode: u.districtCode,
      village: u.village || (u.role === 'SUDIN' ? 'Semua Kelurahan' : ''),
      villageCode: u.villageCode,
      province: u.province,
      provinceCode: u.provinceCode,
      regency: u.regency,
      regencyCode: u.regencyCode,
      scopeCode: u.scopeCode,
      status: u.status || 'ACTIVE',
      createdAt: u.createdAt || '2026-01-01T00:00:00.000Z',
      lastLoginAt: u.lastLoginAt,
      requirePasswordChange: u.requirePasswordChange || false
    }));

    res.json({ users: list });
  });

  // 2. Add New Officer
  app.post('/api/admin/users', authenticate, (req: Request, res: Response) => {
    const adminUser: DBUser = (req as any).user;
    if (adminUser.role !== 'SUDIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya SUDIN / Super Admin yang dapat menambahkan akun petugas.' });
    }

    const { name, username, role, district, village, password } = req.body;

    // Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({ error: 'Nama lengkap wajib diisi minimal 3 karakter.' });
    }

    // Validate Username
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username wajib diisi minimal 3 karakter.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const isDuplicate = usersTable.some(u => u.username.toLowerCase() === cleanUsername);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Username sudah digunakan.' });
    }

    // Validate Role
    if (!['KELURAHAN', 'KECAMATAN', 'SUDIN'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid. Harus salah satu dari: Kelurahan, Kecamatan, atau Sudin.' });
    }

    // Validate Password
    if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        error: 'Password awal minimal 8 karakter dan harus mengandung huruf dan angka.'
      });
    }

    // Strictly Validate and Bind Scope from Official Master Hierarchy (No forged input)
    let finalDistrict: string | undefined = undefined;
    let finalDistrictCode: string | undefined = undefined;
    let finalVillage: string | undefined = undefined;
    let finalVillageCode: string | undefined = undefined;
    let finalScopeCode: string = '31.74';

    if (role === 'KELURAHAN') {
      if (!district || !village) {
        return res.status(400).json({ error: 'Kecamatan dan Kelurahan wajib dipilih untuk role Kelurahan.' });
      }

      const officialDistrict = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === district);
      if (!officialDistrict) {
        return res.status(400).json({ error: `Kecamatan "${district}" tidak valid di Jakarta Selatan.` });
      }

      const officialVillage = officialDistrict.villages.find(v => v.name === village);
      if (!officialVillage) {
        return res.status(400).json({ error: `Kelurahan "${village}" tidak berada di bawah Kecamatan "${district}".` });
      }

      finalDistrict = officialDistrict.name;
      finalDistrictCode = officialDistrict.code;
      finalVillage = officialVillage.name;
      finalVillageCode = officialVillage.code;
      finalScopeCode = officialVillage.code;
    } else if (role === 'KECAMATAN') {
      if (!district) {
        return res.status(400).json({ error: 'Kecamatan wajib dipilih untuk role Kecamatan.' });
      }

      const officialDistrict = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === district);
      if (!officialDistrict) {
        return res.status(400).json({ error: `Kecamatan "${district}" tidak valid di Jakarta Selatan.` });
      }

      finalDistrict = officialDistrict.name;
      finalDistrictCode = officialDistrict.code;
      finalScopeCode = officialDistrict.code;
    } else if (role === 'SUDIN') {
      finalScopeCode = '31.74';
    }

    const nowIso = new Date().toISOString();
    const newUser: DBUser = {
      id: `user-officer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: cleanUsername,
      passwordHash: hashPassword(password),
      name: name.trim(),
      role,
      province: 'DKI Jakarta',
      provinceCode: '31',
      regency: 'Kota Administrasi Jakarta Selatan',
      regencyCode: '31.74',
      district: finalDistrict,
      districtCode: finalDistrictCode,
      village: finalVillage,
      villageCode: finalVillageCode,
      scopeCode: finalScopeCode,
      status: 'ACTIVE',
      createdAt: nowIso,
      requirePasswordChange: true
    };

    usersTable.push(newUser);

    // Record Audit Log (NO plaintext password in log!)
    const targetRegionLabel = role === 'SUDIN' 
      ? 'Jakarta Selatan (31.74)' 
      : (role === 'KECAMATAN' ? `Kec. ${finalDistrict} (${finalScopeCode})` : `Kel. ${finalVillage} (${finalScopeCode})`);

    auditLogsTable.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'USER_CREATED',
      performedById: adminUser.id,
      performedByUsername: adminUser.username,
      targetUserId: newUser.id,
      targetUsername: newUser.username,
      targetRole: newUser.role,
      targetRegion: targetRegionLabel,
      details: `Pembuatan akun petugas baru: ${newUser.name} (${newUser.username}) dengan role ${newUser.role}`,
      timestamp: nowIso
    });

    const safeUser: User = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      province: newUser.province,
      provinceCode: newUser.provinceCode,
      regency: newUser.regency,
      regencyCode: newUser.regencyCode,
      district: newUser.district,
      districtCode: newUser.districtCode,
      village: newUser.village,
      villageCode: newUser.villageCode,
      scopeCode: newUser.scopeCode,
      status: newUser.status,
      createdAt: newUser.createdAt,
      requirePasswordChange: newUser.requirePasswordChange
    };

    res.status(201).json({
      success: true,
      user: safeUser,
      message: 'Akun petugas baru berhasil dibuat.'
    });
  });

  // 3. Edit Officer Details
  app.put('/api/admin/users/:id', authenticate, (req: Request, res: Response) => {
    const adminUser: DBUser = (req as any).user;
    if (adminUser.role !== 'SUDIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya SUDIN / Super Admin yang dapat mengubah data petugas.' });
    }

    const targetId = req.params.id;
    const targetUser = usersTable.find(u => u.id === targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Akun petugas tidak ditemukan.' });
    }

    const { name, role, district, village, status } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({ error: 'Nama lengkap wajib diisi minimal 3 karakter.' });
    }

    if (role && !['KELURAHAN', 'KECAMATAN', 'SUDIN'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid.' });
    }

    const newRole = role || targetUser.role;

    // Validate Scope & Hierarchy
    let finalDistrict: string | undefined = undefined;
    let finalDistrictCode: string | undefined = undefined;
    let finalVillage: string | undefined = undefined;
    let finalVillageCode: string | undefined = undefined;
    let finalScopeCode: string = '31.74';

    if (newRole === 'KELURAHAN') {
      const distToUse = district || targetUser.district;
      const vilToUse = village || targetUser.village;

      if (!distToUse || !vilToUse) {
        return res.status(400).json({ error: 'Kecamatan dan Kelurahan wajib diisi untuk role Kelurahan.' });
      }

      const officialDistrict = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === distToUse);
      if (!officialDistrict) {
        return res.status(400).json({ error: `Kecamatan "${distToUse}" tidak valid di Jakarta Selatan.` });
      }

      const officialVillage = officialDistrict.villages.find(v => v.name === vilToUse);
      if (!officialVillage) {
        return res.status(400).json({ error: `Kelurahan "${vilToUse}" tidak berada di bawah Kecamatan "${distToUse}".` });
      }

      finalDistrict = officialDistrict.name;
      finalDistrictCode = officialDistrict.code;
      finalVillage = officialVillage.name;
      finalVillageCode = officialVillage.code;
      finalScopeCode = officialVillage.code;
    } else if (newRole === 'KECAMATAN') {
      const distToUse = district || targetUser.district;
      if (!distToUse) {
        return res.status(400).json({ error: 'Kecamatan wajib diisi untuk role Kecamatan.' });
      }

      const officialDistrict = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === distToUse);
      if (!officialDistrict) {
        return res.status(400).json({ error: `Kecamatan "${distToUse}" tidak valid di Jakarta Selatan.` });
      }

      finalDistrict = officialDistrict.name;
      finalDistrictCode = officialDistrict.code;
      finalScopeCode = officialDistrict.code;
    } else if (newRole === 'SUDIN') {
      finalScopeCode = '31.74';
    }

    targetUser.name = name.trim();
    targetUser.role = newRole;
    targetUser.district = finalDistrict;
    targetUser.districtCode = finalDistrictCode;
    targetUser.village = finalVillage;
    targetUser.villageCode = finalVillageCode;
    targetUser.scopeCode = finalScopeCode;

    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      targetUser.status = status;
      if (status === 'INACTIVE') {
        for (const [t, u] of activeSessions.entries()) {
          if (u.id === targetUser.id) activeSessions.delete(t);
        }
      }
    }

    const nowIso = new Date().toISOString();
    const targetRegionLabel = targetUser.role === 'SUDIN' 
      ? 'Jakarta Selatan (31.74)' 
      : (targetUser.role === 'KECAMATAN' ? `Kec. ${targetUser.district} (${targetUser.scopeCode})` : `Kel. ${targetUser.village} (${targetUser.scopeCode})`);

    auditLogsTable.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'USER_UPDATED',
      performedById: adminUser.id,
      performedByUsername: adminUser.username,
      targetUserId: targetUser.id,
      targetUsername: targetUser.username,
      targetRole: targetUser.role,
      targetRegion: targetRegionLabel,
      details: `Pembaruan data akun petugas: ${targetUser.name} (${targetUser.username}), role: ${targetUser.role}, status: ${targetUser.status}`,
      timestamp: nowIso
    });

    const safeUser: User = {
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      role: targetUser.role,
      province: targetUser.province,
      provinceCode: targetUser.provinceCode,
      regency: targetUser.regency,
      regencyCode: targetUser.regencyCode,
      district: targetUser.district,
      districtCode: targetUser.districtCode,
      village: targetUser.village,
      villageCode: targetUser.villageCode,
      scopeCode: targetUser.scopeCode,
      status: targetUser.status,
      createdAt: targetUser.createdAt,
      lastLoginAt: targetUser.lastLoginAt,
      requirePasswordChange: targetUser.requirePasswordChange
    };

    res.json({
      success: true,
      user: safeUser,
      message: 'Data petugas berhasil diperbarui.'
    });
  });

  // 4. Toggle Activate / Deactivate Officer Status
  app.patch('/api/admin/users/:id/status', authenticate, (req: Request, res: Response) => {
    const adminUser: DBUser = (req as any).user;
    if (adminUser.role !== 'SUDIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya SUDIN / Super Admin yang dapat mengubah status akun petugas.' });
    }

    const targetId = req.params.id;
    const targetUser = usersTable.find(u => u.id === targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Akun petugas tidak ditemukan.' });
    }

    const { status } = req.body;
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      return res.status(400).json({ error: 'Status harus bernilai ACTIVE atau INACTIVE.' });
    }

    // Protect primary admin from being deactivated
    if (targetUser.id === 'user-sudin-1' && status === 'INACTIVE') {
      return res.status(400).json({ error: 'Akun Administrator Sudin utama tidak dapat dinonaktifkan.' });
    }

    targetUser.status = status;

    // Invalidate sessions if deactivated
    if (status === 'INACTIVE') {
      for (const [t, u] of activeSessions.entries()) {
        if (u.id === targetUser.id) {
          activeSessions.delete(t);
        }
      }
    }

    const nowIso = new Date().toISOString();
    const actionType = status === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    const targetRegionLabel = targetUser.role === 'SUDIN' 
      ? 'Jakarta Selatan (31.74)' 
      : (targetUser.role === 'KECAMATAN' ? `Kec. ${targetUser.district} (${targetUser.scopeCode})` : `Kel. ${targetUser.village} (${targetUser.scopeCode})`);

    auditLogsTable.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: actionType,
      performedById: adminUser.id,
      performedByUsername: adminUser.username,
      targetUserId: targetUser.id,
      targetUsername: targetUser.username,
      targetRole: targetUser.role,
      targetRegion: targetRegionLabel,
      details: `Status akun petugas ${targetUser.username} diubah menjadi ${status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}`,
      timestamp: nowIso
    });

    res.json({
      success: true,
      status: targetUser.status,
      message: `Akun petugas "${targetUser.name}" berhasil di${status === 'ACTIVE' ? 'aktifkan' : 'nonaktifkan'}.`
    });
  });

  // 5. Reset Password (SUDIN Admin Only)
  app.post('/api/admin/users/:id/reset-password', authenticate, (req: Request, res: Response) => {
    const adminUser: DBUser = (req as any).user;
    if (adminUser.role !== 'SUDIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya SUDIN / Super Admin yang dapat mereset password akun lain.' });
    }

    const targetId = req.params.id;
    const targetUser = usersTable.find(u => u.id === targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Akun petugas tidak ditemukan.' });
    }

    // Generate secure temporary password
    const randomPin = Math.floor(100000 + Math.random() * 900000);
    const temporaryPassword = `Dukcapil#${randomPin}`;

    // Update password hash and flag requirement to change password on next login
    targetUser.passwordHash = hashPassword(temporaryPassword);
    targetUser.requirePasswordChange = true;

    // Invalidate target user's active sessions immediately
    for (const [t, u] of activeSessions.entries()) {
      if (u.id === targetUser.id) {
        activeSessions.delete(t);
      }
    }

    const nowIso = new Date().toISOString();
    const targetRegionLabel = targetUser.role === 'SUDIN' 
      ? 'Jakarta Selatan (31.74)' 
      : (targetUser.role === 'KECAMATAN' ? `Kec. ${targetUser.district} (${targetUser.scopeCode})` : `Kel. ${targetUser.village} (${targetUser.scopeCode})`);

    // Record Audit Log (NO plaintext password in log!)
    auditLogsTable.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'USER_PASSWORD_RESET',
      performedById: adminUser.id,
      performedByUsername: adminUser.username,
      targetUserId: targetUser.id,
      targetUsername: targetUser.username,
      targetRole: targetUser.role,
      targetRegion: targetRegionLabel,
      details: `Reset password akun ${targetUser.username} oleh ${adminUser.name}. Password sementara telah diterbitkan.`,
      timestamp: nowIso
    });

    res.json({
      success: true,
      temporaryPassword,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        role: targetUser.role,
        district: targetUser.district,
        village: targetUser.village,
        scopeCode: targetUser.scopeCode
      },
      message: `Password akun ${targetUser.name} (${targetUser.username}) berhasil direset.`
    });
  });

  // 6. Get Audit Logs (SUDIN Admin Only)
  app.get('/api/admin/audit-logs', authenticate, (req: Request, res: Response) => {
    const adminUser: DBUser = (req as any).user;
    if (adminUser.role !== 'SUDIN') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya SUDIN / Super Admin yang dapat melihat log audit.' });
    }

    res.json({ auditLogs: auditLogsTable.slice(0, 100) });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'DIP Sudin Dukcapil Jaksel API' });
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DIP Dukcapil Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
