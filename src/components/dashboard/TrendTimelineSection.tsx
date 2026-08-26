import React, { useState } from 'react';
import { TrendDataPoint } from '../../types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Calendar, Layers } from 'lucide-react';

interface TrendTimelineSectionProps {
  data: TrendDataPoint[];
  periodLabel: string;
  scopeLabel: string;
}

import { SharedChartTooltip } from './chartTooltip';

export const TrendTimelineSection: React.FC<TrendTimelineSectionProps> = ({
  data = [],
  periodLabel,
  scopeLabel
}) => {
  const [viewMode, setViewMode] = useState<'total' | 'categories'>('total');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                <span>Tren Pelayanan Berdasarkan Tanggal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fluktuasi volume pelayanan pada kurun waktu {periodLabel} di {scopeLabel}
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('total')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === 'total'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Total Pelayanan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === 'categories'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Per Kategori Layanan
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'total' ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={<SharedChartTooltip showDate />}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Pelayanan"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#totalGrad)"
                />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={<SharedChartTooltip showDate />}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-700 font-semibold">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="kependudukan"
                  name="Kependudukan"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="capil"
                  name="Pencatatan Sipil"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="mutasi"
                  name="Mutasi Penduduk"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="digital"
                  name="Identitas Digital (IKD)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Belum ada data rekaman tanggal pada periode ini.
          </div>
        )}
      </div>
    </div>
  );
};
