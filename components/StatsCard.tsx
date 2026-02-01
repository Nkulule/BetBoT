
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, trend, trendUp }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              <i className={`fas fa-caret-${trendUp ? 'up' : 'down'}`}></i>
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <i className={`fas ${icon} text-lg ${color.replace('bg-', 'text-')}`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
