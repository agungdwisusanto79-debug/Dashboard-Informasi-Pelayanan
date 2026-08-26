import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { JAKARTA_SELATAN_DISTRICTS, NATIONAL_PROVINCES, getNationalWilayahCounts } from '../data/regionsData';
import {
  MapPin,
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  ShieldCheck,
  Globe,
  Users,
  CheckCircle2,
  RefreshCw,
  Database,
  FileCheck2
} from 'lucide-react';

interface MasterWilayahViewProps {
  user: User;
  token: string;
}

interface DistrictDataWithTotals {
  districtName: string;
  totalVillages: number;
  totalServices: number;
  villages: {
    villageName: string;
    totalServices: number;
  }[];
}

export const MasterWilayahView: React.FC<MasterWilayahViewProps> = ({ user, token }) => {
  const [activeSubTab, setActiveSubTab] = useState<'jaksel' | 'nasional' | 'users'>('jaksel');
  const [jakselDistricts, setJakselDistricts] = useState<DistrictDataWithTotals[]>([]);
  const [expandedDistricts, setExpandedDistricts] = useState<{ [key: string]: boolean }>({
    'Cilandak': true,
    'Tebet': true
  });
  const [searchDistrict, setSearchDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // National Explorer States
  const [selectedProv, setSelectedProv] = useState<string>('DKI Jakarta');
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [selectedKec, setSelectedKec] = useState<string>('');

  // Admin users state (for SUDIN)
  const [usersList, setUsersList] = useState<any[]>([]);

  const fetchJakselData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/regions/jakarta-selatan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat master wilayah Jakarta Selatan');
      const data = await res.json();
      setJakselDistricts(data.districts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user.role !== 'SUDIN') return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJakselData();
    if (user.role === 'SUDIN') {
      fetchUsers();
    }
  }, []);

  const toggleDistrict = (name: string) => {
    setExpandedDistricts(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const expandAll = () => {
    const allExp: { [key: string]: boolean } = {};
    JAKARTA_SELATAN_DISTRICTS.forEach(d => { allExp[d.name] = true; });
    setExpandedDistricts(allExp);
  };

  const collapseAll = () => {
    setExpandedDistricts({});
  };

  const filteredDistricts = jakselDistricts.filter(d =>
    d.districtName.toLowerCase().includes(searchDistrict.toLowerCase()) ||
    d.villages.some(v => v.villageName.toLowerCase().includes(searchDistrict.toLowerCase()))
  );

  // Total calculated statistics
  const totalJakselServices = jakselDistricts.reduce((acc, d) => acc + d.totalServices, 0);

  // National Explorer helpers
  const currentProvObj = NATIONAL_PROVINCES.find(p => p.name === selectedProv);
  const currentKabList = currentProvObj ? currentProvObj.regencies : [];
  const currentKabObj = currentKabList.find(k => k.name === selectedKab);
  const currentKecList = currentKabObj ? currentKabObj.districts : [];
  const currentKecObj = currentKecList.find(k => k.name === selectedKec);
  const currentDesaList = currentKecObj ? currentKecObj.villages : [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Master Wilayah Administrasi</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Struktur resmi 10 Kecamatan & 65 Kelurahan Jakarta Selatan serta Master Wilayah Nasional
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('jaksel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'jaksel'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Jakarta Selatan (10 Kec / 65 Kel)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nasional')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'nasional'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Master Nasional (Kemendagri)</span>
          </button>

          {user.role === 'SUDIN' && (
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'users'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelola User</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: JAKARTA SELATAN (10 KECAMATAN -> 65 KELURAHAN -> TOTAL PELAYANAN) */}
      {activeSubTab === 'jaksel' && (
        <div className="space-y-4">
          {/* Summary Card & Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  placeholder="Cari kecamatan / kelurahan..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={expandAll}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Buka Semua
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Total Akumulasi Layanan: </span>
              <span className="text-sm font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {totalJakselServices.toLocaleString('id-ID')} Pelayanan
              </span>
            </div>
          </div>

          {/* Master Wilayah Tree List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                Memuat hierarki master wilayah Jakarta Selatan...
              </div>
            ) : filteredDistricts.length > 0 ? (
              filteredDistricts.map((dist) => {
                const isExpanded = !!expandedDistricts[dist.districtName];
                const isUserDistrict = user.district === dist.districtName;

                return (
                  <div
                    key={dist.districtName}
                    className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                      isUserDistrict
                        ? 'border-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Kecamatan Header (Expandable) */}
                    <div
                      onClick={() => toggleDistrict(dist.districtName)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/90 cursor-pointer flex items-center justify-between transition border-b border-slate-200/60 select-none"
                    >
                      <div className="flex items-center space-x-3">
                        <button className="p-1 rounded-md bg-white border border-slate-200 text-slate-600">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              Kecamatan {dist.districtName}
                            </span>
                            {isUserDistrict && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                Wilayah Anda
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {dist.villages.length} Kelurahan
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 mr-2">Total Pelayanan:</span>
                        <span className="text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {dist.totalServices.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Kelurahan List (Shown if Kecamatan opened) */}
                    {isExpanded && (
                      <div className="p-3 bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                            <tr>
                              <th className="py-2 px-4">Nama Kelurahan</th>
                              <th className="py-2 px-4">Status Wilayah</th>
                              <th className="py-2 px-4 text-right">Total Pelayanan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dist.villages.map((vil, vIdx) => {
                              const isUserVillage = user.village === vil.villageName;
                              return (
                                <tr
                                  key={vil.villageName}
                                  className={`hover:bg-slate-50/80 transition ${
                                    isUserVillage ? 'bg-amber-50/50 font-bold' : ''
                                  }`}
                                >
                                  <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span>{vil.villageName}</span>
                                    {isUserVillage && (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                        Akun Anda
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-4 text-slate-500">
                                    Kelurahan Definitif #{vIdx + 1}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-black text-blue-700 text-sm">
                                    {vil.totalServices.toLocaleString('id-ID')} Pelayanan
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
                Kecamatan atau kelurahan tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MASTER WILAYAH NASIONAL (Cascading Data Explorer) */}
      {activeSubTab === 'nasional' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Database className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Master Wilayah Nasional Indonesia (Kemendagri 2025)</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Resmi Kepmendagri
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Keputusan Menteri Dalam Negeri (Kepmendagri) No. 300.2.2-2430 Tahun 2025 • Pemberian dan Pemutakhiran Kode, Data Wilayah Administrasi Pemerintahan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>38 Provinsi Lengkap</span>
              </span>
            </div>
          </div>

          {/* Official Statistics Direct Count Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Provinsi
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {NATIONAL_PROVINCES.length}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 mt-0.5 block">
                Seluruh Indonesia
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Kab / Kota
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {NATIONAL_PROVINCES.reduce((acc, p) => acc + p.regencies.length, 0).toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">
                Kabupaten & Kota Otonom
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Kecamatan
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {NATIONAL_PROVINCES.reduce((acc, p) => acc + p.regencies.reduce((rSum, r) => rSum + r.districts.length, 0), 0).toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">
                Kecamatan / Distrik
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Desa / Kelurahan
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {NATIONAL_PROVINCES.reduce((acc, p) => acc + p.regencies.reduce((rSum, r) => rSum + r.districts.reduce((dSum, d) => dSum + d.villages.length, 0), 0), 0).toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 block">
                Desa / Kelurahan / Kampung
              </span>
            </div>
          </div>

          {/* Interactive Hierarchy Navigator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Pilih Provinsi */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>1. Pilih Provinsi ({NATIONAL_PROVINCES.length})</span>
                {currentProvObj?.code && (
                  <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                    Kode: {currentProvObj.code}
                  </span>
                )}
              </label>
              <select
                id="select-provinsi-nasional"
                value={selectedProv}
                onChange={(e) => {
                  setSelectedProv(e.target.value);
                  setSelectedKab('');
                  setSelectedKec('');
                }}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {NATIONAL_PROVINCES.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.code ? `[${p.code}] ${p.name}` : p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Pilih Kab/Kota */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>2. Pilih Kab / Kota ({currentKabList.length})</span>
                {currentKabObj?.code && (
                  <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                    Kode: {currentKabObj.code}
                  </span>
                )}
              </label>
              <select
                id="select-kabupaten-nasional"
                value={selectedKab}
                onChange={(e) => {
                  setSelectedKab(e.target.value);
                  setSelectedKec('');
                }}
                disabled={!selectedProv}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">-- Pilih Kab/Kota ({currentKabList.length}) --</option>
                {currentKabList.map(k => (
                  <option key={k.name} value={k.name}>
                    {k.code ? `[${k.code}] ${k.name}` : k.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Pilih Kecamatan */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>3. Pilih Kecamatan ({currentKecList.length})</span>
                {currentKecObj?.code && (
                  <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                    Kode: {currentKecObj.code}
                  </span>
                )}
              </label>
              <select
                id="select-kecamatan-nasional"
                value={selectedKec}
                onChange={(e) => setSelectedKec(e.target.value)}
                disabled={!selectedKab}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">-- Pilih Kecamatan ({currentKecList.length}) --</option>
                {currentKecList.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.code ? `[${c.code}] ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Step 4: Desa / Kelurahan list */}
          {selectedKec && (
            <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 block">
                    Daftar Desa / Kelurahan Resmi di Kecamatan {selectedKec}
                  </span>
                  <span className="text-xs font-medium text-blue-700 mt-0.5 block">
                    Provinsi {selectedProv} → {selectedKab} → Kec. {selectedKec}
                  </span>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold self-start sm:self-auto">
                  {currentDesaList.length} Desa / Kelurahan
                </span>
              </div>

              {currentDesaList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {currentDesaList.map((v, i) => (
                    <div
                      key={`${v}-${i}`}
                      className="p-2.5 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-white/80 rounded-lg text-center">
                  Data desa/kelurahan untuk kecamatan ini siap dimuat.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: USER MANAGEMENT (For SUDIN) */}
      {activeSubTab === 'users' && user.role === 'SUDIN' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Daftar Akun Pengguna & Kewenangan Hak Akses</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan akun demo dan hak akses tingkat Kelurahan, Kecamatan, dan Sudin
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
              {usersList.length} Akun Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Kewenangan Wilayah</th>
                  <th className="py-3 px-4">Kata Sandi Demo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{u.username}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'SUDIN' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'KECAMATAN' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {u.role === 'SUDIN' ? 'Seluruh Jakarta Selatan' :
                       u.role === 'KECAMATAN' ? `Kecamatan ${u.district}` :
                       `Kec. ${u.district} → Kel. ${u.village}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">123456</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
