import React from 'react';
import { MutationSummary } from '../../types';
import { UserCheck, UserMinus, ArrowRightLeft, ShieldCheck, MapPin } from 'lucide-react';

interface MutationAnalyticsSectionProps {
  data: MutationSummary;
  scopeLabel: string;
}

export const MutationAnalyticsSection: React.FC<MutationAnalyticsSectionProps> = ({
  data,
  scopeLabel
}) => {
  const { totalPindahDatang, totalPindahKeluar, netMigration, pindahDatangDetails, pindahKeluarDetails } = data;

  const totalMutasi = totalPindahDatang + totalPindahKeluar;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
                <span>Analisis Mutasi Penduduk (Pindah Datang &amp; Pindah Keluar)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dinamika perpindahan penduduk pada wilayah {scopeLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Net Migration Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            netMigration >= 0
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="text-[11px] font-medium text-slate-500">Migrasi Bersih:</span>
            <span className="font-mono text-sm font-black">
              {netMigration >= 0 ? `+${netMigration.toLocaleString('id-ID')}` : netMigration.toLocaleString('id-ID')} jiwa
            </span>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Pindah Datang */}
        <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Total Pindah Datang</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalPindahDatang.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalMutasi > 0 ? `${((totalPindahDatang / totalMutasi) * 100).toFixed(1)}% dari total mutasi` : '0%'}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            Masuk
          </span>
        </div>

        {/* Card 2: Pindah Keluar */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
              <UserMinus className="w-4 h-4" />
              <span>Total Pindah Keluar</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalPindahKeluar.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalMutasi > 0 ? `${((totalPindahKeluar / totalMutasi) * 100).toFixed(1)}% dari total mutasi` : '0%'}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Keluar
          </span>
        </div>

        {/* Card 3: Total Arus Mutasi */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Total Volume Mutasi</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalMutasi.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Agregat perpindahan kependudukan
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
            Total
          </span>
        </div>
      </div>

      {/* 2-Column Breakdown of 4 Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Detail Pindah Datang */}
        <div className="p-5 rounded-xl border border-teal-100 bg-teal-50/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Rincian Pindah Datang (4 Parameter)</span>
            </h4>
            <span className="text-xs font-mono font-bold text-teal-900">
              {totalPindahDatang.toLocaleString('id-ID')} Jiwa
            </span>
          </div>

          <div className="space-y-3">
            {pindahDatangDetails.map((item) => (
              <div key={item.param} className="space-y-1 bg-white p-3 rounded-lg border border-teal-100/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.param}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{item.count.toLocaleString('id-ID')}</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail Pindah Keluar */}
        <div className="p-5 rounded-xl border border-amber-100 bg-amber-50/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <UserMinus className="w-4 h-4 text-amber-600" />
              <span>Rincian Pindah Keluar (4 Parameter)</span>
            </h4>
            <span className="text-xs font-mono font-bold text-amber-900">
              {totalPindahKeluar.toLocaleString('id-ID')} Jiwa
            </span>
          </div>

          <div className="space-y-3">
            {pindahKeluarDetails.map((item) => (
              <div key={item.param} className="space-y-1 bg-white p-3 rounded-lg border border-amber-100/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.param}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{item.count.toLocaleString('id-ID')}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
