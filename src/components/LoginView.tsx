import React, { useState } from 'react';
import { 
  Shield, 
  Building2, 
  UserCheck, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { User } from '../types';
import { JAKARTA_SELATAN_OFFICIAL_HIERARCHY } from '../data/regionsData';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: User) => void;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'KELURAHAN' | 'KECAMATAN' | 'SUDIN'>('ALL');

  const handleSubmit = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    const u = customUser || username;
    const p = customPass || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal. Periksa username dan password.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (uname: string, pword: string) => {
    setUsername(uname);
    setPassword(pword);
    handleSubmit(undefined, uname, pword);
  };

  // Build full 76 official regional account list for demonstration and testing
  const allAccounts: Array<{
    username: string;
    name: string;
    role: 'KELURAHAN' | 'KECAMATAN' | 'SUDIN';
    district?: string;
    village?: string;
    code?: string;
  }> = [
    {
      username: 'sudin',
      name: 'Administrator Sudin Dukcapil Jaksel',
      role: 'SUDIN',
      code: '31.74'
    }
  ];

  // 10 Kecamatan
  JAKARTA_SELATAN_OFFICIAL_HIERARCHY.forEach(dist => {
    allAccounts.push({
      username: `kec_${toSlug(dist.name)}`,
      name: `Kecamatan ${dist.name}`,
      role: 'KECAMATAN',
      district: dist.name,
      code: dist.code
    });
  });

  // 65 Kelurahan
  JAKARTA_SELATAN_OFFICIAL_HIERARCHY.forEach(dist => {
    dist.villages.forEach(vil => {
      allAccounts.push({
        username: `kel_${toSlug(vil.name)}`,
        name: `Kelurahan ${vil.name}`,
        role: 'KELURAHAN',
        district: dist.name,
        village: vil.name,
        code: vil.code
      });
    });
  });

  const filteredAccounts = allAccounts.filter(acc => {
    if (selectedRoleFilter !== 'ALL' && acc.role !== selectedRoleFilter) return false;
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      acc.username.toLowerCase().includes(term) ||
      acc.name.toLowerCase().includes(term) ||
      (acc.district && acc.district.toLowerCase().includes(term)) ||
      (acc.village && acc.village.toLowerCase().includes(term)) ||
      (acc.code && acc.code.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* PANEL KIRI: BRANDING & IDENTITAS RESMI GOVTECH                           */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-1/2 xl:w-[48%] bg-gradient-to-br from-slate-950 via-[#0a1533] to-[#041d4f] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
        
        {/* Subtle Decorative Background Geometry & Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Decorative Geometric Rings */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 rounded-full border border-blue-500/10 pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[480px] h-[480px] rounded-full border border-sky-400/5 pointer-events-none" />

        {/* Top Header Section on Left Panel */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold backdrop-blur-sm mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Portal Resmi Pelayanan Kependudukan</span>
          </div>

          {/* Main Identity Branding (Clean Typography without Logo Image) */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                DIP
              </span>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/30">
                v2.5
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-2">
              Dashboard Informasi Pelayanan
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-normal">
            Sistem pelaporan dan monitoring pelayanan kependudukan secara terintegrasi.
          </p>

          {/* Key Value Pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">11 Jenis Pelayanan</div>
                <div className="text-[11px] text-slate-400">Rekapitulasi Dokumen</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">RBAC 3 Tingkat</div>
                <div className="text-[11px] text-slate-400">Kelurahan • Kec • Sudin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Agency Footer on Left Panel */}
        <div className="relative z-10 mt-10 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="font-semibold text-slate-200 text-sm">
            Suku Dinas Kependudukan dan Pencatatan Sipil
          </div>
          <div className="text-slate-300 mt-0.5 font-medium">
            Kota Administrasi Jakarta Selatan
          </div>
          <div className="text-slate-500 text-[11px] mt-1">
            Pemerintah Provinsi DKI Jakarta
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL KANAN: FORM LOGIN BERSIH & MODERN                                   */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 xl:w-[52%] bg-slate-50 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-200/80 my-auto">
          
          {/* Header Login Form */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Silakan masuk untuk melanjutkan
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium text-xs sm:text-sm">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            
            {/* Input Username */}
            <div>
              <label 
                htmlFor="login-username" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username akun"
                  className="block w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-xs"
                />
              </div>
            </div>

            {/* Input Password with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="block w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Wilayah Otomatis Information Note */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium text-[11px] leading-tight text-blue-950">
                <strong className="font-semibold text-blue-900">Wilayah Otomatis:</strong> Hak akses & kode wilayah terkunci otomatis berdasarkan kredensial akun.
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Restricted Access Governance Notice */}
          <div className="mt-5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Akses Terbatas</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
              Sistem ini hanya dapat diakses oleh petugas yang berwenang sesuai wilayah kerjanya.
            </p>
          </div>

          {/* ===================================================================== */}
          {/* AKUN UJI COBA CEPAT (1-KLIK) UNTUK PREVIEW & EVALUASI                 */}
          {/* ===================================================================== */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Uji Coba 1-Klik Berdasarkan Role:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pass: 123456</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Role 1: Kelurahan */}
              <button
                id="demo-kelurahan-btn"
                type="button"
                onClick={() => handleQuickLogin('kel_cilandak_barat', '123456')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-amber-900 transition text-center group cursor-pointer"
                title="Login sebagai Kelurahan Cilandak Barat"
              >
                <UserCheck className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-[11px] font-bold">Kelurahan</span>
                <span className="text-[9px] text-amber-700 truncate max-w-full">Cilandak Barat</span>
              </button>

              {/* Role 2: Kecamatan */}
              <button
                id="demo-kecamatan-btn"
                type="button"
                onClick={() => handleQuickLogin('kec_cilandak', '123456')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-blue-900 transition text-center group cursor-pointer"
                title="Login sebagai Kecamatan Cilandak"
              >
                <Building2 className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold">Kecamatan</span>
                <span className="text-[9px] text-blue-700 truncate max-w-full">Cilandak</span>
              </button>

              {/* Role 3: Sudin */}
              <button
                id="demo-sudin-btn"
                type="button"
                onClick={() => handleQuickLogin('sudin', '123456')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 transition text-center group cursor-pointer"
                title="Login sebagai Sudin Dukcapil Jaksel"
              >
                <Shield className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold">Sudin</span>
                <span className="text-[9px] text-emerald-700 truncate max-w-full">Jaksel Admin</span>
              </button>
            </div>

            {/* Toggle All 76 Accounts Explorer */}
            <div className="mt-3.5 text-center">
              <button
                type="button"
                onClick={() => setShowAllUsersModal(!showAllUsersModal)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <span>Lihat Seluruh 76 Akun Resmi Wilayah (65 Kel + 10 Kec + Sudin)</span>
                {showAllUsersModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expanded 76-Account Drawer */}
            {showAllUsersModal && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Cari kelurahan, kecamatan, atau kode wilayah..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                  {(['ALL', 'KELURAHAN', 'KECAMATAN', 'SUDIN'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRoleFilter(role)}
                      className={`px-2 py-1 rounded-md font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedRoleFilter === role
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {role === 'ALL' ? 'Semua (76)' : role}
                    </button>
                  ))}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredAccounts.map(acc => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleQuickLogin(acc.username, '123456')}
                      className="w-full text-left p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs transition cursor-pointer shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{acc.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          <code>{acc.username}</code> • Kode: {acc.code || '-'}
                        </div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        acc.role === 'SUDIN'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : acc.role === 'KECAMATAN'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
