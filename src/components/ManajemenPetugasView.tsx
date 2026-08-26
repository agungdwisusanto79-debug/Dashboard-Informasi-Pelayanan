import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  UserCheck,
  KeyRound,
  Edit,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Copy,
  Eye,
  EyeOff,
  History,
  ShieldAlert,
  Calendar,
  Layers,
  MapPin,
  Check,
  RefreshCw
} from 'lucide-react';
import { User, UserRole, UserStatus, UserAuditLog } from '../types';
import { JAKARTA_SELATAN_OFFICIAL_HIERARCHY } from '../data/regionsData';

interface ManajemenPetugasViewProps {
  user: User;
  token: string;
}

export const ManajemenPetugasView: React.FC<ManajemenPetugasViewProps> = ({ user, token }) => {
  const [officers, setOfficers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Active target officer for actions
  const [selectedOfficer, setSelectedOfficer] = useState<User | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('KELURAHAN');
  const [addDistrict, setAddDistrict] = useState('Jagakarsa');
  const [addVillage, setAddVillage] = useState('Cipedak');
  const [addPassword, setAddPassword] = useState('Dukcapil#2026');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('KELURAHAN');
  const [editDistrict, setEditDistrict] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Action Loading
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Officers List
  const fetchOfficers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Gagal memuat daftar petugas.');
      }
      const data = await res.json();
      setOfficers(data.users || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  // Update village options when district changes in Add Modal
  useEffect(() => {
    if (addRole === 'KELURAHAN') {
      const dist = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === addDistrict);
      if (dist && dist.villages.length > 0) {
        if (!dist.villages.some(v => v.name === addVillage)) {
          setAddVillage(dist.villages[0].name);
        }
      }
    }
  }, [addDistrict, addRole]);

  // Update village options when district changes in Edit Modal
  useEffect(() => {
    if (editRole === 'KELURAHAN' && editDistrict) {
      const dist = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === editDistrict);
      if (dist && dist.villages.length > 0) {
        if (!dist.villages.some(v => v.name === editVillage)) {
          setEditVillage(dist.villages[0].name);
        }
      }
    }
  }, [editDistrict, editRole]);

  // Derived official Kemendagri code preview for Add Form
  const previewAddScopeCode = useMemo(() => {
    if (addRole === 'SUDIN') return '31.74';
    const dist = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === addDistrict);
    if (!dist) return '-';
    if (addRole === 'KECAMATAN') return dist.code;
    const vil = dist.villages.find(v => v.name === addVillage);
    return vil ? vil.code : '-';
  }, [addRole, addDistrict, addVillage]);

  // Derived official Kemendagri code preview for Edit Form
  const previewEditScopeCode = useMemo(() => {
    if (editRole === 'SUDIN') return '31.74';
    const dist = JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === editDistrict);
    if (!dist) return '-';
    if (editRole === 'KECAMATAN') return dist.code;
    const vil = dist.villages.find(v => v.name === editVillage);
    return vil ? vil.code : '-';
  }, [editRole, editDistrict, editVillage]);

  // Filtered Officers
  const filteredOfficers = useMemo(() => {
    return officers.filter(officer => {
      // Role filter
      if (roleFilter !== 'ALL' && officer.role !== roleFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        const officerStatus = officer.status || 'ACTIVE';
        if (officerStatus !== statusFilter) return false;
      }

      // District filter
      if (districtFilter !== 'ALL') {
        if (officer.role === 'KELURAHAN' || officer.role === 'KECAMATAN') {
          if (officer.district !== districtFilter) return false;
        } else if (officer.role === 'SUDIN') {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchName = officer.name.toLowerCase().includes(q);
        const matchUsername = officer.username.toLowerCase().includes(q);
        const matchDistrict = (officer.district || '').toLowerCase().includes(q);
        const matchVillage = (officer.village || '').toLowerCase().includes(q);
        const matchCode = (officer.scopeCode || '').toLowerCase().includes(q);
        return matchName || matchUsername || matchDistrict || matchVillage || matchCode;
      }

      return true;
    });
  }, [officers, roleFilter, statusFilter, districtFilter, searchTerm]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = officers.length;
    const kelurahan = officers.filter(o => o.role === 'KELURAHAN').length;
    const kecamatan = officers.filter(o => o.role === 'KECAMATAN').length;
    const sudin = officers.filter(o => o.role === 'SUDIN').length;
    const active = officers.filter(o => (o.status || 'ACTIVE') === 'ACTIVE').length;
    const inactive = officers.filter(o => o.status === 'INACTIVE').length;
    return { total, kelurahan, kecamatan, sudin, active, inactive };
  }, [officers]);

  // Open Edit Modal
  const handleOpenEdit = (off: User) => {
    setSelectedOfficer(off);
    setEditName(off.name);
    setEditRole(off.role);
    setEditDistrict(off.district || 'Jagakarsa');
    setEditVillage(off.village || 'Cipedak');
    setEditStatus(off.status || 'ACTIVE');
    setIsEditModalOpen(true);
  };

  // Open Reset Password Modal
  const handleOpenReset = (off: User) => {
    setSelectedOfficer(off);
    setTempPasswordResult(null);
    setIsCopied(false);
    setIsResetModalOpen(true);
  };

  // Open Status Toggle Modal
  const handleOpenStatusModal = (off: User) => {
    setSelectedOfficer(off);
    setIsStatusModalOpen(true);
  };

  // Handle Add Officer
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);
    setErrorMsg(null);
    try {
      const payload = {
        name: addName,
        username: addUsername,
        role: addRole,
        district: addRole === 'SUDIN' ? undefined : addDistrict,
        village: addRole === 'KELURAHAN' ? addVillage : undefined,
        password: addPassword
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan akun petugas.');
      }

      setSuccessMsg(`Akun petugas "${addName}" (${addUsername}) berhasil dibuat!`);
      setIsAddModalOpen(false);
      // Reset fields
      setAddName('');
      setAddUsername('');
      setAddRole('KELURAHAN');
      setAddPassword('Dukcapil#2026');
      await fetchOfficers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Handle Edit Officer Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setSubmittingEdit(true);
    setErrorMsg(null);
    try {
      const payload = {
        name: editName,
        role: editRole,
        district: editRole === 'SUDIN' ? undefined : editDistrict,
        village: editRole === 'KELURAHAN' ? editVillage : undefined,
        status: editStatus
      };

      const res = await fetch(`/api/admin/users/${selectedOfficer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui data petugas.');
      }

      setSuccessMsg(`Data petugas "${editName}" berhasil diperbarui!`);
      setIsEditModalOpen(false);
      setSelectedOfficer(null);
      await fetchOfficers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Status Toggle Confirm
  const handleStatusToggleConfirm = async () => {
    if (!selectedOfficer) return;
    setActionLoading(true);
    setErrorMsg(null);
    const targetStatus: UserStatus = (selectedOfficer.status || 'ACTIVE') === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/users/${selectedOfficer.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah status akun.');
      }

      setSuccessMsg(data.message || `Status akun berhasil diubah.`);
      setIsStatusModalOpen(false);
      setSelectedOfficer(null);
      await fetchOfficers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password Confirm
  const handleResetPasswordConfirm = async () => {
    if (!selectedOfficer) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedOfficer.id}/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mereset password.');
      }

      setTempPasswordResult(data.temporaryPassword);
      await fetchOfficers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (tempPasswordResult) {
      navigator.clipboard.writeText(tempPasswordResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-semibold text-rose-800">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Hak Akses Super Admin
            </span>
            <span className="text-xs text-slate-500 font-mono">Kemendagri RI Standard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Manajemen Petugas & Otorisasi Akun
          </h1>
          <p className="text-sm text-slate-600">
            Kelola akun petugas Kelurahan, Kecamatan, dan Sudin serta kontrol keamanan password dan wilayah.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchAuditLogs();
              setIsAuditDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Log Audit Keamanan</span>
          </button>

          <button
            onClick={fetchOfficers}
            disabled={loading}
            title="Muat Ulang Data"
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Petugas Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Petugas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Akun Terdaftar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Petugas Kelurahan</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.kelurahan}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">65 Kelurahan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Petugas Kecamatan</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.kecamatan}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">10 Kecamatan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Petugas Sudin</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.sudin}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Super Admin</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30 shadow-xs">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Status Aktif</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Dapat Login</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/30 shadow-xs">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Status Nonaktif</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{stats.inactive}</p>
          <p className="text-[11px] text-rose-600 mt-0.5 font-medium">Akses Terkunci</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama petugas, username, kelurahan, atau kode wilayah..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-44">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Semua Role</option>
              <option value="KELURAHAN">Role: Kelurahan</option>
              <option value="KECAMATAN">Role: Kecamatan</option>
              <option value="SUDIN">Role: Sudin Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Hanya Aktif</option>
              <option value="INACTIVE">Hanya Nonaktif</option>
            </select>
          </div>

          {/* Kecamatan Filter */}
          <div className="w-full md:w-48">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Semua Kecamatan (10)</option>
              {JAKARTA_SELATAN_OFFICIAL_HIERARCHY.map(d => (
                <option key={d.code} value={d.name}>
                  Kec. {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
          <p>
            Menampilkan <span className="font-bold text-slate-800">{filteredOfficers.length}</span> dari <span className="font-bold text-slate-800">{officers.length}</span> total akun petugas
          </p>
          {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' || districtFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
                setDistrictFilter('ALL');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-[11px]"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 4. Table of Officers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Petugas</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Wilayah Tugas</th>
                <th className="py-3.5 px-4">Kode Wilayah</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Terakhir Login</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Memuat data petugas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data petugas yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter</p>
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((off) => {
                  const isActive = (off.status || 'ACTIVE') === 'ACTIVE';

                  return (
                    <tr key={off.id} className={`hover:bg-slate-50/80 transition ${!isActive ? 'bg-slate-50/40 opacity-75' : ''}`}>
                      {/* Nama */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            off.role === 'SUDIN' ? 'bg-emerald-100 text-emerald-800' :
                            off.role === 'KECAMATAN' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {off.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{off.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {off.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {off.username}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {off.role === 'SUDIN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> SUDIN
                          </span>
                        )}
                        {off.role === 'KECAMATAN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                            <Building2 className="w-3 h-3" /> KECAMATAN
                          </span>
                        )}
                        {off.role === 'KELURAHAN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            <UserCheck className="w-3 h-3" /> KELURAHAN
                          </span>
                        )}
                      </td>

                      {/* Wilayah Tugas */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {off.role === 'SUDIN' && (
                          <span className="font-medium text-slate-900">Kota Adm. Jakarta Selatan (Semua Wilayah)</span>
                        )}
                        {off.role === 'KECAMATAN' && (
                          <div>
                            <span className="font-bold text-slate-900">Kec. {off.district}</span>
                            <p className="text-[10px] text-slate-400">Seluruh Kelurahan di bawah Kec.</p>
                          </div>
                        )}
                        {off.role === 'KELURAHAN' && (
                          <div>
                            <span className="font-bold text-slate-900">Kel. {off.village}</span>
                            <p className="text-[10px] text-slate-500">Kec. {off.district}</p>
                          </div>
                        )}
                      </td>

                      {/* Kode Wilayah Kemendagri */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {off.scopeCode || '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Terakhir Login */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {off.lastLoginAt ? (
                          <span>
                            {new Date(off.lastLoginAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}{' '}
                            <span className="text-[10px] text-slate-400">
                              {new Date(off.lastLoginAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum pernah</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(off)}
                            title="Edit Petugas"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenReset(off)}
                            title="Reset Password"
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleOpenStatusModal(off)}
                            title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            disabled={off.id === 'user-sudin-1'}
                            className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isActive
                                ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: TAMBAH PETUGAS BARU */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Tambah Akun Petugas Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Petugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Kom"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Contoh: kel_cipedak_petugas2"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Gunakan huruf kecil, angka, atau underscore. Harus unik.
                </p>
              </div>

              {/* Role Selection (Strict 3 Roles) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Otorisasi <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRole('KELURAHAN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      addRole === 'KELURAHAN'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Kelurahan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddRole('KECAMATAN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      addRole === 'KECAMATAN'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Kecamatan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddRole('SUDIN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      addRole === 'SUDIN'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sudin Admin</span>
                  </button>
                </div>
              </div>

              {/* Cascading Wilayah Assignment */}
              {addRole !== 'SUDIN' ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kecamatan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={addDistrict}
                      onChange={(e) => setAddDistrict(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {JAKARTA_SELATAN_OFFICIAL_HIERARCHY.map(d => (
                        <option key={d.code} value={d.name}>
                          Kec. {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {addRole === 'KELURAHAN' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Kelurahan di bawah Kec. {addDistrict} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={addVillage}
                        onChange={(e) => setAddVillage(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === addDistrict)?.villages.map(v => (
                          <option key={v.code} value={v.name}>
                            Kel. {v.name} ({v.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Auto-Locked Kemendagri Regional Code Display */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Kode Wilayah Resmi:</span>
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      {previewAddScopeCode}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <span>Scope Wilayah: <strong>Kota Administrasi Jakarta Selatan</strong></span>
                  <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    31.74
                  </span>
                </div>
              )}

              {/* Password Awal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password Awal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Minimal 8 karakter (huruf & angka)"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Petugas akan diminta mengganti password ini setelah login pertama.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submittingAdd}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingAdd ? (
                    <span>Menyimpan Akun...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Akun Petugas</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: EDIT PETUGAS */}
      {/* ======================================================== */}
      {isEditModalOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Edit Data Petugas</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username (Permanen)
                </label>
                <input
                  type="text"
                  value={selectedOfficer.username}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Otorisasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('KELURAHAN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      editRole === 'KELURAHAN'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Kelurahan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('KECAMATAN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      editRole === 'KECAMATAN'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Kecamatan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('SUDIN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      editRole === 'SUDIN'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sudin Admin</span>
                  </button>
                </div>
              </div>

              {editRole !== 'SUDIN' ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kecamatan
                    </label>
                    <select
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {JAKARTA_SELATAN_OFFICIAL_HIERARCHY.map(d => (
                        <option key={d.code} value={d.name}>
                          Kec. {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {editRole === 'KELURAHAN' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Kelurahan di bawah Kec. {editDistrict}
                      </label>
                      <select
                        value={editVillage}
                        onChange={(e) => setEditVillage(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {JAKARTA_SELATAN_OFFICIAL_HIERARCHY.find(d => d.name === editDistrict)?.villages.map(v => (
                          <option key={v.code} value={v.name}>
                            Kel. {v.name} ({v.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Kode Wilayah:</span>
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      {previewEditScopeCode}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Akun
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Aktif (Dapat Login & Akses Sistem)</option>
                  <option value="INACTIVE">Nonaktif (Akses Terkunci)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submittingEdit}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingEdit ? (
                    <span>Menyimpan Perubahan...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: RESET PASSWORD */}
      {/* ======================================================== */}
      {isResetModalOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Reset Password Petugas</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-amber-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!tempPasswordResult ? (
                <>
                  <p className="text-sm text-slate-700">
                    Apakah Anda yakin ingin mereset password akun petugas ini?
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Petugas:</span>
                      <span className="font-bold text-slate-800">{selectedOfficer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Username:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedOfficer.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Role:</span>
                      <span className="font-bold text-slate-800">{selectedOfficer.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wilayah:</span>
                      <span className="font-bold text-slate-800">
                        {selectedOfficer.role === 'SUDIN'
                          ? 'Jakarta Selatan'
                          : selectedOfficer.role === 'KECAMATAN'
                          ? `Kec. ${selectedOfficer.district}`
                          : `Kel. ${selectedOfficer.village}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Password lama tidak akan dapat digunakan lagi. Sesi login aktif akun target akan langsung dihentikan.
                    </span>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPasswordConfirm}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Memproses Reset...' : 'Ya, Reset Password'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-emerald-900 text-sm">
                      Password Berhasil Direset!
                    </p>
                    <p className="text-xs text-emerald-700">
                      Berikut adalah password sementara untuk akun <strong>{selectedOfficer.username}</strong>:
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <span className="font-mono text-lg font-bold tracking-wider text-amber-400">
                      {tempPasswordResult}
                    </span>
                    <button
                      onClick={handleCopyPassword}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center">
                    Catat atau salin password sementara ini sekarang. Berikan kepada petugas dan minta petugas mengganti password saat login.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsResetModalOpen(false)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: KONFIRMASI AKTIFKAN / NONAKTIFKAN */}
      {/* ======================================================== */}
      {isStatusModalOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`px-6 py-4 text-white flex items-center justify-between ${
              (selectedOfficer.status || 'ACTIVE') === 'ACTIVE' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <Power className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">
                  {(selectedOfficer.status || 'ACTIVE') === 'ACTIVE'
                    ? 'Nonaktifkan Akun Petugas'
                    : 'Aktifkan Kembali Akun Petugas'}
                </h3>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                {(selectedOfficer.status || 'ACTIVE') === 'ACTIVE'
                  ? 'Nonaktifkan akun petugas ini? Petugas tidak akan dapat login lagi dan sesi aktif akan diputus, namun seluruh data riwayat laporan tetap tersimpan aman.'
                  : 'Aktifkan kembali akun petugas ini agar dapat login dan mengakses dashboard pelayanan kembali?'}
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Petugas:</span>
                  <span className="font-bold text-slate-800">{selectedOfficer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedOfficer.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role / Wilayah:</span>
                  <span className="font-bold text-slate-800">
                    {selectedOfficer.role} - {selectedOfficer.village || selectedOfficer.district || 'Sudin'}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleStatusToggleConfirm}
                  disabled={actionLoading}
                  className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                    (selectedOfficer.status || 'ACTIVE') === 'ACTIVE'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  }`}
                >
                  {actionLoading
                    ? 'Memproses...'
                    : (selectedOfficer.status || 'ACTIVE') === 'ACTIVE'
                    ? 'Ya, Nonaktifkan'
                    : 'Ya, Aktifkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. DRAWER: LOG AUDIT KEAMANAN */}
      {/* ======================================================== */}
      {isAuditDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Log Audit Manajemen Petugas</h3>
                  <p className="text-xs text-slate-400">Catatan riwayat tindakan administratif & otorisasi</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Audit Logs */}
            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Belum ada aktivitas tercatat pada log audit.</p>
                </div>
              ) : (
                auditLogs.map((log) => {
                  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
                  let label = log.action;

                  if (log.action === 'USER_CREATED') {
                    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    label = 'BUAT PETUGAS';
                  } else if (log.action === 'USER_UPDATED') {
                    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                    label = 'UPDATE PETUGAS';
                  } else if (log.action === 'USER_ACTIVATED') {
                    badgeColor = 'bg-teal-100 text-teal-800 border-teal-200';
                    label = 'AKTIFKAN AKUN';
                  } else if (log.action === 'USER_DEACTIVATED') {
                    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                    label = 'NONAKTIFKAN';
                  } else if (log.action === 'USER_PASSWORD_RESET') {
                    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                    label = 'RESET PASSWORD';
                  } else if (log.action === 'USER_PASSWORD_CHANGED') {
                    badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                    label = 'GANTI PASSWORD';
                  }

                  return (
                    <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${badgeColor}`}>
                          {label}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="font-semibold text-slate-800 text-xs leading-relaxed">
                        {log.details}
                      </p>

                      <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap gap-y-1 items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Pelaku: <strong className="text-slate-700">{log.performedByUsername}</strong></span>
                        <span>Target: <strong className="text-slate-700">{log.targetUsername}</strong> ({log.targetRole})</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Keamanan terjamin: Plaintext password tidak pernah dicatat.</span>
              <button
                onClick={() => setIsAuditDrawerOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
