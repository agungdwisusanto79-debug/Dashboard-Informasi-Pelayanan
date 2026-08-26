import React, { useState } from 'react';
import { ServiceRegionalRank } from '../types';
import {
  Users,
  CreditCard,
  Smile,
  UserCheck,
  UserMinus,
  FileEdit,
  Smartphone,
  Baby,
  FileText,
  HeartHandshake,
  Scissors,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Layers,
  Building2,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface RegionalServiceAnalysisTableProps {
  data?: ServiceRegionalRank[];
  periodLabel: string;
  userRole?: string;
  scopeDistrict?: string;
}

// Icon mapping helper
const getServiceIcon = (name: string) => {
  switch (name) {
    case 'Kartu Keluarga':
      return <Users className="w-4 h-4 text-blue-600" />;
    case 'KTP-el':
      return <CreditCard className="w-4 h-4 text-indigo-600" />;
    case 'KIA':
      return <Smile className="w-4 h-4 text-emerald-600" />;
    case 'Pindah Datang':
      return <UserCheck className="w-4 h-4 text-teal-600" />;
    case 'Pindah Keluar':
      return <UserMinus className="w-4 h-4 text-amber-600" />;
    case 'Perubahan Data':
      return <FileEdit className="w-4 h-4 text-purple-600" />;
    case 'IKD':
      return <Smartphone className="w-4 h-4 text-cyan-600" />;
    case 'Akta Kelahiran':
      return <Baby className="w-4 h-4 text-pink-600" />;
    case 'Akta Kematian':
      return <FileText className="w-4 h-4 text-slate-600" />;
    case 'Akta Perkawinan':
      return <HeartHandshake className="w-4 h-4 text-rose-600" />;
    case 'Akta Perceraian':
      return <Scissors className="w-4 h-4 text-red-600" />;
    default:
      return <FileText className="w-4 h-4 text-slate-600" />;
  }
};

const getCategoryBadgeClass = (category?: string) => {
  switch (category) {
    case 'Kependudukan':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Pencatatan Sipil':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Mutasi Penduduk':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Identitas Digital':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const RegionalServiceAnalysisTable: React.FC<RegionalServiceAnalysisTableProps> = ({
  data = [],
  periodLabel,
  userRole = 'SUDIN',
  scopeDistrict = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const isSudin = userRole === 'SUDIN';
  const categories = ['ALL', 'Kependudukan', 'Pencatatan Sipil', 'Mutasi Penduduk', 'Identitas Digital'];

  const filteredData = data.filter(item => {
    if (categoryFilter !== 'ALL' && item.serviceCategory !== categoryFilter) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.serviceName.toLowerCase().includes(term) ||
      (item.maxDistrict && item.maxDistrict.name.toLowerCase().includes(term)) ||
      (item.minDistrict && item.minDistrict.name.toLowerCase().includes(term)) ||
      item.maxVillage.name.toLowerCase().includes(term) ||
      item.minVillage.name.toLowerCase().includes(term) ||
      (item.serviceCategory && item.serviceCategory.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Header with Title and Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Analisis Layanan per Wilayah</span>
            </h3>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isSudin
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isSudin ? 'Monitoring Wilayah Sudin' : `Scope Kec. ${scopeDistrict}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSudin
              ? 'Pemetaan sebaran volume pelayanan tertinggi (🟢) dan terendah (🔴) pada 10 Kecamatan & 65 Kelurahan se-Jakarta Selatan.'
              : `Perbandingan performa kelurahan tertinggi (🟢) dan terendah (🔴) di wilayah Kecamatan ${scopeDistrict}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Periode Aktif: <strong className="text-slate-900 font-bold">{periodLabel}</strong></span>
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isSudin ? "Cari layanan, kecamatan, atau kelurahan..." : "Cari layanan atau kelurahan..."}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori (11)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 tracking-tight">
            <tr>
              <th className="py-3.5 px-4 min-w-[200px]">Layanan</th>
              <th className="py-3.5 px-3.5 text-right min-w-[100px]">{isSudin ? 'Total Jaksel' : 'Total Kecamatan'}</th>
              {isSudin && (
                <>
                  <th className="py-3.5 px-4 min-w-[170px] bg-emerald-50/50 border-x border-emerald-100/60">
                    <div className="flex items-center gap-1 text-emerald-800 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Pelayanan Kecamatan Terbanyak</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[170px] bg-rose-50/40 border-r border-rose-100/60">
                    <div className="flex items-center gap-1 text-rose-800 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Pelayanan Kecamatan Terdikit</span>
                    </div>
                  </th>
                </>
              )}
              <th className={`py-3.5 px-4 min-w-[190px] bg-emerald-50/50 border-r border-emerald-100/60 ${!isSudin ? 'border-l border-emerald-100/60' : ''}`}>
                <div className="flex items-center gap-1 text-emerald-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Pelayanan Kelurahan Terbanyak</span>
                </div>
              </th>
              <th className="py-3.5 px-4 min-w-[190px] bg-rose-50/40">
                <div className="flex items-center gap-1 text-rose-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Pelayanan Kelurahan Terdikit</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr
                  key={row.serviceName}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* 1. Layanan */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200/80 shrink-0">
                        {getServiceIcon(row.serviceName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 leading-snug">
                          {row.serviceName}
                        </div>
                        {row.serviceCategory && (
                          <span className={`inline-block text-[9.5px] px-1.5 py-0.2 rounded font-semibold border mt-0.5 ${getCategoryBadgeClass(row.serviceCategory)}`}>
                            {row.serviceCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Total */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                    <div className="text-sm">{row.totalServiceCount.toLocaleString('id-ID')}</div>
                    <div className="text-[10px] text-slate-400 font-normal">pelayanan</div>
                  </td>

                  {/* 3. Kecamatan Terbanyak (Sudin only) */}
                  {isSudin && (
                    <>
                      <td className="py-3 px-4 bg-emerald-50/30 border-x border-emerald-100/60">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-800 truncate">
                            Kec. {row.maxDistrict?.name || '-'}
                          </div>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 shrink-0 font-mono">
                            <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                            {(row.maxDistrict?.count || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </td>

                      {/* 4. Kecamatan Terdikit (Sudin only) */}
                      <td className="py-3 px-4 bg-rose-50/20 border-r border-rose-100/60">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-800 truncate">
                            Kec. {row.minDistrict?.name || '-'}
                          </div>
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 font-mono ${
                            (row.minDistrict?.count || 0) === 0
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-rose-100/80 text-rose-800 border border-rose-300/80'
                          }`}>
                            <ArrowDownRight className="w-3 h-3 text-rose-600" />
                            {(row.minDistrict?.count || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </td>
                    </>
                  )}

                  {/* 5. Kelurahan Terbanyak */}
                  <td className={`py-3 px-4 bg-emerald-50/30 border-r border-emerald-100/60 ${!isSudin ? 'border-l border-emerald-100/60' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          Kel. {row.maxVillage.name}
                        </div>
                        {isSudin && row.maxVillage.parentDistrict && (
                          <div className="text-[10px] text-slate-500 truncate">
                            Kec. {row.maxVillage.parentDistrict}
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 shrink-0 font-mono">
                        <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                        {row.maxVillage.count.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </td>

                  {/* 6. Kelurahan Terdikit */}
                  <td className="py-3 px-4 bg-rose-50/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          Kel. {row.minVillage.name}
                        </div>
                        {isSudin && row.minVillage.parentDistrict && (
                          <div className="text-[10px] text-slate-500 truncate">
                            Kec. {row.minVillage.parentDistrict}
                          </div>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 font-mono ${
                        row.minVillage.count === 0
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-rose-100/80 text-rose-800 border border-rose-300/80'
                      }`}>
                        <ArrowDownRight className="w-3 h-3 text-rose-600" />
                        {row.minVillage.count.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSudin ? 6 : 4} className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada data layanan yang sesuai dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <strong className="text-slate-600">Pelayanan Terbanyak</strong>: Volume pelayanan tertinggi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <strong className="text-slate-600">Pelayanan Terdikit</strong>: Volume pelayanan terendah (termasuk 0)
          </span>
        </div>
        <div>
          {isSudin ? (
            <span>Total evaluasi: <strong>10 Kecamatan</strong> &amp; <strong>65 Kelurahan</strong> Jakarta Selatan</span>
          ) : (
            <span>Total evaluasi: Seluruh Kelurahan di wilayah Kec. <strong>{scopeDistrict}</strong></span>
          )}
        </div>
      </div>
    </div>
  );
};
