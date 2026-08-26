import React, { useState } from 'react';
import { CategorySummary } from '../../types';
import { SERVICE_TYPES } from '../../data/regionsData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
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
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';

interface ServiceAnalyticsSectionProps {
  servicesBreakdown: { name: string; total: number; percentage: number; category?: string }[];
  categoriesBreakdown: CategorySummary[];
  maxService: { name: string; total: number; percentage: number };
  minService: { name: string; total: number; percentage: number };
  totalServices: number;
}

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
      return <Scissors className="w-4 h-4 text-orange-600" />;
    default:
      return <FileText className="w-4 h-4 text-slate-600" />;
  }
};

const SERVICE_COLORS = [
  '#2563eb', '#3b82f6', '#059669', '#0d9488', '#d97706',
  '#7c3aed', '#0891b2', '#db2777', '#475569', '#e11d48', '#ea580c'
];

import { SharedChartTooltip } from './chartTooltip';

export const ServiceAnalyticsSection: React.FC<ServiceAnalyticsSectionProps> = ({
  servicesBreakdown = [],
  categoriesBreakdown = [],
  maxService,
  minService,
  totalServices
}) => {
  const [donutType, setDonutType] = useState<'categories' | 'services'>('categories');

  return (
    <div className="space-y-6">
      {/* 2-Column Row: Bar Chart of 11 Services & Donut Chart of Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Bar Chart of 11 Services */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Jumlah Pelayanan per Jenis Layanan (11 Dokumen)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan volume pelayanan aktif per layanan
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
              {totalServices.toLocaleString('id-ID')} Pelayanan
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={servicesBreakdown}
                margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9.5, fill: '#64748b' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  content={<SharedChartTooltip />}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.7)', radius: 4 }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} className="cursor-pointer transition-opacity hover:opacity-90">
                  {servicesBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (5 Cols): Donut/Pie Chart Komposisi */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Komposisi Pelayanan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proporsi pembagian kategori &amp; layanan
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
              <button
                type="button"
                onClick={() => setDonutType('categories')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  donutType === 'categories' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Kategori
              </button>
              <button
                type="button"
                onClick={() => setDonutType('services')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  donutType === 'services' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                11 Layanan
              </button>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {totalServices > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<SharedChartTooltip />} />
                  {donutType === 'categories' ? (
                    <Pie
                      data={categoriesBreakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      className="cursor-pointer"
                    >
                      {categoriesBreakdown.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} className="cursor-pointer transition-opacity hover:opacity-85" />
                      ))}
                    </Pie>
                  ) : (
                    <Pie
                      data={servicesBreakdown}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      className="cursor-pointer"
                    >
                      {servicesBreakdown.map((_, index) => (
                        <Cell key={`donut-cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} className="cursor-pointer transition-opacity hover:opacity-85" />
                      ))}
                    </Pie>
                  )}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs">Belum ada data untuk komposisi.</div>
            )}
          </div>

          {/* Legend / Category breakdown list */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            {categoriesBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-700 truncate">{cat.category}</div>
                  <div className="text-[11px] font-mono text-slate-500 font-bold">{cat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights: Pelayanan Terbanyak & Pelayanan Terdikit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Max Service */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                Pelayanan Terbanyak
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-1">{maxService?.name || '-'}</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {maxService?.percentage || 0}% dari seluruh layanan aktif
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-emerald-700 font-mono">
              {(maxService?.total || 0).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400">pelayanan</div>
          </div>
        </div>

        {/* Card Min Service */}
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded">
                Pelayanan Terdikit
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-1">{minService?.name || '-'}</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {minService?.percentage || 0}% dari seluruh layanan aktif
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-rose-700 font-mono">
              {(minService?.total || 0).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400">pelayanan</div>
          </div>
        </div>
      </div>

      {/* 11 Services Grid Cards */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Rincian 11 Jenis Layanan</h3>
            <p className="text-xs text-slate-500">
              Detail pelayanan resmi administrasi kependudukan dan pencatatan sipil
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
            11 Layanan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-4">
          {SERVICE_TYPES.map((service, idx) => {
            const matched = servicesBreakdown.find(s => s.name === service.name);
            const totalCount = matched?.total || 0;
            const pct = matched?.percentage || 0;

            return (
              <div
                key={service.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/60 hover:bg-white transition-all shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    {getServiceIcon(service.name)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-700 truncate">{service.name}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      {totalCount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] font-bold text-blue-600 font-mono">{pct}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(pct, totalCount > 0 ? 3 : 0))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
