import React from 'react';

/**
 * Shared formatter function for tooltips that standardizes format:
 * '[Name] - Total Pelayanan: [Count] Pelayanan'
 */
export const formatServiceTooltipText = (name: string, count: number | string): string => {
  const formattedCount = Number(count || 0).toLocaleString('id-ID');
  const cleanName = (name || 'Layanan').trim();
  return `${cleanName} - Total Pelayanan: ${formattedCount} Pelayanan`;
};

/**
 * Reusable Recharts Tooltip Formatter function
 */
export const sharedChartFormatter = (value: any, name: any, entry: any) => {
  const entryName = name || entry?.name || entry?.dataKey || 'Layanan';
  const count = Number(value || 0).toLocaleString('id-ID');
  return [`${count} Pelayanan`, `${entryName} - Total Pelayanan`];
};

interface SharedChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  prefix?: string;
  showPercentage?: boolean;
  showDate?: boolean;
}

/**
 * Unified Shared Custom Tooltip Component for all Recharts charts across the Dashboard
 * Formats every hover as: '[Name] - Total Pelayanan: [Count] Pelayanan'
 */
export const SharedChartTooltip: React.FC<SharedChartTooltipProps> = ({
  active,
  payload,
  label,
  prefix,
  showPercentage = true,
  showDate
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Handle Multi-Series Chart (e.g. Multi-Line Chart)
  if (payload.length > 1) {
    const rawItem = payload[0]?.payload;
    const dateLabel = rawItem?.date || rawItem?.formattedDate || label;

    return (
      <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 backdrop-blur-xs space-y-2 min-w-[240px]">
        {dateLabel && (
          <p className="text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1">
            Tanggal: {dateLabel}
          </p>
        )}
        <div className="space-y-1.5">
          {payload.map((entry: any, idx: number) => {
            const rawName = entry.name || entry.dataKey || `Kategori ${idx + 1}`;
            const countNum = Number(entry.value || 0);
            const countStr = countNum.toLocaleString('id-ID');
            const color = entry.color || entry.stroke || '#38bdf8';

            return (
              <div key={entry.dataKey || idx} className="flex items-center justify-between text-xs gap-3">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                  <span className="font-bold text-sky-300">{rawName}</span>
                </span>
                <span className="text-slate-300 text-xs">
                  - Total Pelayanan: <span className="font-mono font-bold text-white">{countStr}</span> Pelayanan
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Single Item Chart (Bar, Pie, Area)
  const single = payload[0];
  const item = single.payload || {};
  
  let rawName =
    item.name ||
    item.category ||
    item.district ||
    single.name ||
    label ||
    'Pelayanan';

  if (prefix) {
    rawName = `${prefix} ${rawName}`;
  }

  const rawCount = item.total ?? item.value ?? single.value ?? 0;
  const countNum = Number(rawCount);
  const countStr = countNum.toLocaleString('id-ID');
  const dateLabel = showDate ? (item.date || item.formattedDate || label) : null;

  return (
    <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 backdrop-blur-xs">
      {dateLabel && (
        <p className="text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
          Tanggal: {dateLabel}
        </p>
      )}
      <p className="text-xs font-semibold text-slate-100">
        <span className="font-bold text-sky-400">{rawName}</span> - Total Pelayanan: <span className="font-mono font-bold text-white">{countStr}</span> Pelayanan
      </p>
      {showPercentage && item.percentage !== undefined && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-2">
          <span>Porsi: {item.percentage}%</span>
          {item.rank && <span className="text-amber-300 font-semibold">• Peringkat #{item.rank}</span>}
        </p>
      )}
    </div>
  );
};
