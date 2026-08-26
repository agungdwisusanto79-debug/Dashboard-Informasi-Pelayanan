import React, { useState, useEffect } from 'react';
import { User, DashboardStats } from '../types';
import { JAKARTA_SELATAN_DISTRICTS } from '../data/regionsData';
import { RegionalServiceAnalysisTable } from './RegionalServiceAnalysisTable';
import { AutomatedInsightsSection } from './dashboard/AutomatedInsightsSection';
import { MutationAnalyticsSection } from './dashboard/MutationAnalyticsSection';
import { TrendTimelineSection } from './dashboard/TrendTimelineSection';
import { ServiceAnalyticsSection } from './dashboard/ServiceAnalyticsSection';
import { RegionalRankingsSection } from './dashboard/RegionalRankingsSection';
import {
  Building2,
  Calendar,
  Layers,
  Filter,
  RefreshCw,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Award,
  ArrowRightLeft,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  token: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, token }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    user.role === 'KELURAHAN' || user.role === 'KECAMATAN' ? user.district || '' : ''
  );
  const [selectedVillage, setSelectedVillage] = useState<string>(
    user.role === 'KELURAHAN' ? user.village || '' : ''
  );
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedVillage) params.append('village', selectedVillage);

      const today = new Date();
      if (dateFilterMode === 'today') {
        const dStr = today.toISOString().split('T')[0];
        params.append('startDate', dStr);
        params.append('endDate', dStr);
      } else if (dateFilterMode === '7days') {
        const d7 = new Date(today);
        d7.setDate(today.getDate() - 7);
        params.append('startDate', d7.toISOString().split('T')[0]);
        params.append('endDate', today.toISOString().split('T')[0]);
      } else if (dateFilterMode === '30days') {
        const d30 = new Date(today);
        d30.setDate(today.getDate() - 30);
        params.append('startDate', d30.toISOString().split('T')[0]);
        params.append('endDate', today.toISOString().split('T')[0]);
      } else if (customStartDate && customEndDate) {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      }

      const res = await fetch(`/api/dashboard/stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal mengambil data dashboard.');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.warn('Dashboard stats notice:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedDistrict, selectedVillage, dateFilterMode, customStartDate, customEndDate]);

  // District options based on role
  const availableDistricts = user.role === 'SUDIN'
    ? JAKARTA_SELATAN_DISTRICTS
    : JAKARTA_SELATAN_DISTRICTS.filter(d => d.name === user.district);

  // Village options based on selected district and role
  const currentDistrictObj = JAKARTA_SELATAN_DISTRICTS.find(
    d => d.name === (selectedDistrict || user.district)
  );
  const availableVillages = currentDistrictObj
    ? (user.role === 'KELURAHAN'
        ? currentDistrictObj.villages.filter(v => v === user.village)
        : currentDistrictObj.villages)
    : [];

  const getScopeDescription = () => {
    if (user.role === 'KELURAHAN') {
      return `Kelurahan ${user.village}, Kecamatan ${user.district}`;
    }
    if (user.role === 'KECAMATAN') {
      return selectedVillage
        ? `Kelurahan ${selectedVillage} (Kecamatan ${user.district})`
        : `Kecamatan ${user.district} (Seluruh Kelurahan)`;
    }
    return selectedVillage
      ? `Kelurahan ${selectedVillage} (Kec. ${selectedDistrict})`
      : selectedDistrict
      ? `Kecamatan ${selectedDistrict} (Seluruh Kelurahan)`
      : 'Seluruh Wilayah Jakarta Selatan (10 Kecamatan & 65 Kelurahan)';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Role Context Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Informasi Pelayanan
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 flex items-center gap-1.5">
            <span className="font-bold text-slate-900">Scope Wilayah:</span>
            <span className="text-blue-700 font-semibold">{getScopeDescription()}</span>
          </p>
        </div>

        {/* Refresh button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchStats()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Filter & Period Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Quick Period Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Periode:
          </span>
          <button
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateFilterMode === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Waktu
          </button>
          <button
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateFilterMode === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateFilterMode('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateFilterMode === '7days'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setDateFilterMode('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateFilterMode === '30days'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            30 Hari Terakhir
          </button>
        </div>

        {/* Regional Drilldown Selectors (Scoped by RBAC) */}
        <div className="flex items-center space-x-2">
          {/* Kecamatan Filter (SUDIN) */}
          {user.role === 'SUDIN' && (
            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-semibold text-slate-500">Kecamatan:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedVillage('');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Semua Kecamatan (10)</option>
                {JAKARTA_SELATAN_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kelurahan Filter (SUDIN or KECAMATAN) */}
          {(user.role === 'SUDIN' || user.role === 'KECAMATAN') && (
            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-semibold text-slate-500">Kelurahan:</label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                disabled={!selectedDistrict && user.role === 'SUDIN'}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {user.role === 'KECAMATAN'
                    ? 'Semua Kelurahan di Kec. ini'
                    : selectedDistrict
                    ? 'Semua Kelurahan di Kec. ini'
                    : 'Pilih Kecamatan Dulu'}
                </option>
                {availableVillages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Locked Badge for Kelurahan */}
          {user.role === 'KELURAHAN' && (
            <span className="text-xs font-semibold text-slate-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Kel. {user.village} (Kec. {user.district})
            </span>
          )}
        </div>
      </div>

      {/* Role-Adaptive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Pelayanan */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pelayanan</p>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : (stats?.totalServices || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-3 text-emerald-600 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Aktif Terlayani</span>
            <span className="text-slate-400 font-medium ml-1">pelayanan</span>
          </div>
        </div>

        {/* Card 2: Scope Detail or Max Category */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {user.role === 'KELURAHAN' ? 'Pelayanan Terbanyak' : 'Cakupan Wilayah'}
              </p>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                {user.role === 'KELURAHAN' ? <Award className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              </span>
            </div>
            {user.role === 'KELURAHAN' ? (
              <div>
                <p className="text-lg font-black text-slate-900 truncate">
                  {isLoading ? '...' : stats?.maxService?.name || '-'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {(stats?.maxService?.total || 0).toLocaleString('id-ID')} pelayanan ({stats?.maxService?.percentage || 0}%)
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {user.role === 'SUDIN'
                    ? selectedDistrict ? '1 Kec' : '10 Kec'
                    : '1 Kecamatan'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {user.role === 'SUDIN'
                    ? selectedVillage ? '1 Kelurahan' : selectedDistrict ? `${availableVillages.length} Kelurahan` : '65 Kelurahan se-Jaksel'
                    : selectedVillage ? '1 Kelurahan' : `${availableVillages.length} Kelurahan aktif`}
                </p>
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-3">
            {stats?.periodLabel || 'Periode Aktif'}
          </div>
        </div>

        {/* Card 3: Top Performer / Lowest Service */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {user.role === 'KELURAHAN'
                  ? 'Pelayanan Terdikit'
                  : user.role === 'KECAMATAN'
                  ? 'Pelayanan Kelurahan Terbanyak'
                  : selectedDistrict
                  ? 'Pelayanan Kelurahan Terbanyak'
                  : 'Pelayanan Kecamatan Terbanyak'}
              </p>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Award className="w-4 h-4" />
              </span>
            </div>

            {user.role === 'KELURAHAN' ? (
              <div>
                <p className="text-lg font-black text-slate-900 truncate">
                  {isLoading ? '...' : stats?.minService?.name || '-'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {(stats?.minService?.total || 0).toLocaleString('id-ID')} pelayanan ({stats?.minService?.percentage || 0}%)
                </p>
              </div>
            ) : user.role === 'KECAMATAN' || selectedDistrict ? (
              <div>
                <p className="text-lg font-black text-slate-900 truncate">
                  {isLoading ? '...' : stats?.rankingVillages?.[0]?.name ? `Kel. ${stats.rankingVillages[0].name}` : '-'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {(stats?.rankingVillages?.[0]?.total || 0).toLocaleString('id-ID')} pelayanan ({stats?.rankingVillages?.[0]?.percentage || 0}%)
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-black text-slate-900 truncate">
                  {isLoading ? '...' : stats?.rankingDistricts?.[0]?.name ? `Kec. ${stats.rankingDistricts[0].name}` : '-'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {(stats?.rankingDistricts?.[0]?.total || 0).toLocaleString('id-ID')} pelayanan ({stats?.rankingDistricts?.[0]?.percentage || 0}%)
                </p>
              </div>
            )}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-3">
            Performa Terunggul
          </div>
        </div>

        {/* Card 4: Mutasi Bersih / Dynamic Metric */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Migrasi Bersih</p>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <ArrowRightLeft className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {isLoading
                ? '...'
                : stats?.mutationSummary?.netMigration !== undefined
                ? (stats.mutationSummary.netMigration >= 0
                    ? `+${stats.mutationSummary.netMigration.toLocaleString('id-ID')}`
                    : stats.mutationSummary.netMigration.toLocaleString('id-ID'))
                : '0'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Datang: {stats?.mutationSummary?.totalPindahDatang || 0} | Keluar: {stats?.mutationSummary?.totalPindahKeluar || 0}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-3">
            Dinamika penduduk
          </div>
        </div>
      </div>

      {/* Automated Data Insights Section */}
      {stats?.insights && stats.insights.length > 0 && (
        <AutomatedInsightsSection insights={stats.insights} userRole={user.role} />
      )}

      {/* Regional Rankings Section (Kecamatan & Sudin only) */}
      {(user.role === 'SUDIN' || user.role === 'KECAMATAN') && (
        <RegionalRankingsSection
          userRole={user.role}
          districtsRanking={stats?.rankingDistricts || []}
          villagesRanking={stats?.rankingVillages || []}
          scopeDistrict={selectedDistrict || user.district}
          scopeVillage={selectedVillage || user.village}
        />
      )}

      {/* Analisis Layanan per Wilayah (Eksklusif SUDIN & KECAMATAN) */}
      {(user.role === 'SUDIN' || user.role === 'KECAMATAN') && stats?.regionalServiceAnalysis && (
        <RegionalServiceAnalysisTable
          data={stats.regionalServiceAnalysis}
          periodLabel={stats.periodLabel || 'Semua Periode'}
          userRole={user.role}
          scopeDistrict={selectedDistrict || user.district}
        />
      )}

      {/* Service Analytics Section: Bar Chart, Donut Chart, Highlights, 11 Cards */}
      <ServiceAnalyticsSection
        servicesBreakdown={stats?.servicesBreakdown || []}
        categoriesBreakdown={stats?.categoriesBreakdown || []}
        maxService={stats?.maxService || { name: '-', total: 0, percentage: 0 }}
        minService={stats?.minService || { name: '-', total: 0, percentage: 0 }}
        totalServices={stats?.totalServices || 0}
      />

      {/* Trend Timeline Section */}
      {stats?.trendSeries && stats.trendSeries.length > 0 && (
        <TrendTimelineSection
          data={stats.trendSeries}
          periodLabel={stats.periodLabel || 'Semua Periode'}
          scopeLabel={getScopeDescription()}
        />
      )}

      {/* Mutation Analytics Section (Pindah Datang & Pindah Keluar) */}
      {stats?.mutationSummary && (
        <MutationAnalyticsSection
          data={stats.mutationSummary}
          scopeLabel={getScopeDescription()}
        />
      )}

      {/* Section: Laporan Pelayanan Terkini */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Laporan Pelayanan Terkini</h3>
            <p className="text-xs text-slate-500">
              Transaksi input pelayanan terbaru di lingkup {getScopeDescription()}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kecamatan</th>
                <th className="py-3 px-4">Kelurahan</th>
                <th className="py-3 px-4">Jenis Pelayanan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Detail Wilayah</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentReports && stats.recentReports.length > 0 ? (
                stats.recentReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rep.reportDate}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{rep.district}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{rep.village}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                        {rep.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {rep.category || 'Pelayanan Reguler'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-[220px] truncate" title={rep.detailRegion}>
                      {rep.detailRegion || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {rep.quantity}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data laporan yang sesuai filter.
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
