import React from 'react';
import { AutoInsight } from '../../types';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';

interface AutomatedInsightsSectionProps {
  insights: AutoInsight[];
  userRole: string;
}

export const AutomatedInsightsSection: React.FC<AutomatedInsightsSectionProps> = ({
  insights = [],
  userRole
}) => {
  if (!insights || insights.length === 0) return null;

  const getBadgeStyle = (badgeType: string) => {
    switch (badgeType) {
      case 'success':
        return {
          cardBg: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200',
          iconBg: 'bg-emerald-100 text-emerald-700',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          tag: 'text-emerald-700 bg-emerald-100/70 border-emerald-200'
        };
      case 'warning':
        return {
          cardBg: 'bg-amber-50/50 border-amber-100 hover:border-amber-200',
          iconBg: 'bg-amber-100 text-amber-700',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          tag: 'text-amber-700 bg-amber-100/70 border-amber-200'
        };
      case 'primary':
        return {
          cardBg: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
          iconBg: 'bg-blue-100 text-blue-700',
          icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
          tag: 'text-blue-700 bg-blue-100/70 border-blue-200'
        };
      default:
        return {
          cardBg: 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-200',
          iconBg: 'bg-indigo-100 text-indigo-700',
          icon: <Info className="w-4 h-4 text-indigo-600" />,
          tag: 'text-indigo-700 bg-indigo-100/70 border-indigo-200'
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <span>Insight Otomatis Data Pelayanan</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Analisis Aktual
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sintesis temuan penting yang dihitung langsung dari data transaksi aktif di database
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const style = getBadgeStyle(insight.badgeType);
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${style.cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
                      {style.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.tag}`}>
                      {insight.category}
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
