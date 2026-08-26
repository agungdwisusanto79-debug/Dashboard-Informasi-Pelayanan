import React, { useState } from 'react';
import { RankedRegion } from '../../types';
import {
  Building2,
  MapPin,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RegionalRankingsSectionProps {
  userRole: 'SUDIN' | 'KECAMATAN' | 'KELURAHAN';
  districtsRanking?: RankedRegion[];
  villagesRanking?: RankedRegion[];
  scopeDistrict?: string;
  scopeVillage?: string;
}

import { SharedChartTooltip } from './chartTooltip';

export const RegionalRankingsSection: React.FC<RegionalRankingsSectionProps> = ({
  userRole,
  districtsRanking = [],
  villagesRanking = [],
  scopeDistrict,
  scopeVillage
}) => {
  const [villageSearch, setVillageSearch] = useState('');
  const [villageDistrictFilter, setVillageDistrictFilter] = useState('');

  // Filtered villages
  const filteredVillages = villagesRanking.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(villageSearch.toLowerCase()) ||
      (v.parentDistrict && v.parentDistrict.toLowerCase().includes(villageSearch.toLowerCase()));
    const matchDistrict = !villageDistrictFilter || v.parentDistrict === villageDistrictFilter;
    return matchSearch && matchDistrict;
  });

  // Extract unique parent districts for filter
  const uniqueDistricts = Array.from(new Set(villagesRanking.map(v => v.parentDistrict).filter(Boolean)));

  if (userRole === 'KELURAHAN') {
    return null; // Kelurahan only sees own stats
  }

  return (
    <div className="space-y-6">
      {/* SUDIN ONLY: Ranking 10 Kecamatan */}
      {userRole === 'SUDIN' && districtsRanking.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Pelayanan per Kecamatan
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Peringkat dan distribusi total pelayanan 10 kecamatan se-Jakarta Selatan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                10 Kecamatan Terdaftar
              </span>
            </div>
          </div>

          {/* Top & Bottom Kecamatan Highlights */}
          {districtsRanking.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">#1</div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-800">Pelayanan Kecamatan Terbanyak</div>
                    <div className="text-xs font-bold text-slate-900">Kec. {districtsRanking[0].name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-700 font-mono">
                    {districtsRanking[0].total.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">{districtsRanking[0].percentage}%</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs">
                    #{districtsRanking.length}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-rose-800">Pelayanan Kecamatan Terdikit</div>
                    <div className="text-xs font-bold text-slate-900">
                      Kec. {districtsRanking[districtsRanking.length - 1].name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-rose-700 font-mono">
                    {districtsRanking[districtsRanking.length - 1].total.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {districtsRanking[districtsRanking.length - 1].percentage}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bar Chart 10 Kecamatan */}
          <div className="h-60 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districtsRanking}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  content={<SharedChartTooltip prefix="Kecamatan" />}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.7)', radius: 4 }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} className="cursor-pointer transition-opacity hover:opacity-90">
                  {districtsRanking.map((_, index) => (
                    <Cell
                      key={`dist-cell-${index}`}
                      fill={index === 0 ? '#10b981' : index === districtsRanking.length - 1 ? '#f43f5e' : '#2563eb'}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table List of 10 Districts */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                  <th className="py-2.5 px-4">Nama Kecamatan</th>
                  <th className="py-2.5 px-4">Distribusi Visual</th>
                  <th className="py-2.5 px-4 text-right">Total Pelayanan</th>
                  <th className="py-2.5 px-4 text-right">Porsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtsRanking.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-[11px] ${
                        d.rank === 1
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : d.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : d.rank === 3
                          ? 'bg-amber-50 text-amber-800'
                          : 'text-slate-500'
                      }`}>
                        {d.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      Kecamatan {d.name}
                    </td>
                    <td className="py-2.5 px-4 w-48">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            d.rank === 1 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.max(d.percentage, d.total > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-black font-mono text-slate-900">
                      {d.total.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-blue-600 font-mono">
                      {d.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUDIN & KECAMATAN: Ranking Kelurahan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {userRole === 'SUDIN'
                  ? 'Pelayanan per Kelurahan (65 Kelurahan se-Jakarta Selatan)'
                  : `Pelayanan per Kelurahan (Wilayah Kec. ${scopeDistrict})`}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Urutan performa pelayanan per kelurahan berdasarkan jumlah pelayanan yang dilakukan
            </p>
          </div>

          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
            {villagesRanking.length} Kelurahan
          </span>
        </div>

        {/* Top & Bottom Kelurahan in Scope Highlights */}
        {villagesRanking.length >= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">#1</div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Pelayanan Kelurahan Terbanyak</div>
                  <div className="text-xs font-bold text-slate-900">
                    Kel. {villagesRanking[0].name}
                    {villagesRanking[0].parentDistrict && (
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        (Kec. {villagesRanking[0].parentDistrict})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-emerald-700 font-mono">
                  {villagesRanking[0].total.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">{villagesRanking[0].percentage}%</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs">
                  #{villagesRanking.length}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-800">Pelayanan Kelurahan Terdikit</div>
                  <div className="text-xs font-bold text-slate-900">
                    Kel. {villagesRanking[villagesRanking.length - 1].name}
                    {villagesRanking[villagesRanking.length - 1].parentDistrict && (
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        (Kec. {villagesRanking[villagesRanking.length - 1].parentDistrict})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-rose-700 font-mono">
                  {villagesRanking[villagesRanking.length - 1].total.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {villagesRanking[villagesRanking.length - 1].percentage}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters for Village Table */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kelurahan..."
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {userRole === 'SUDIN' && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={villageDistrictFilter}
                onChange={(e) => setVillageDistrictFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kecamatan</option>
                {uniqueDistricts.map((d) => (
                  <option key={d as string} value={d as string}>
                    {d as string}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Table of Villages */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                <th className="py-2.5 px-4">Nama Kelurahan</th>
                {userRole === 'SUDIN' && <th className="py-2.5 px-4">Kecamatan</th>}
                <th className="py-2.5 px-4">Distribusi</th>
                <th className="py-2.5 px-4 text-right">Total Pelayanan</th>
                <th className="py-2.5 px-4 text-right">Porsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVillages.length > 0 ? (
                filteredVillages.map((v) => (
                  <tr key={`${v.parentDistrict}-${v.name}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-[11px] ${
                        v.rank === 1
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : v.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : v.rank === 3
                          ? 'bg-amber-50 text-amber-800'
                          : 'text-slate-500'
                      }`}>
                        {v.rank}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-900">
                      Kelurahan {v.name}
                    </td>
                    {userRole === 'SUDIN' && (
                      <td className="py-2 px-4 text-slate-500 font-medium">
                        Kec. {v.parentDistrict || '-'}
                      </td>
                    )}
                    <td className="py-2 px-4 w-40">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(v.percentage, v.total > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right font-black font-mono text-slate-900">
                      {v.total.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-indigo-600 font-mono">
                      {v.percentage}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === 'SUDIN' ? 6 : 5} className="py-6 text-center text-slate-400 text-xs">
                    Tidak ada kelurahan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
