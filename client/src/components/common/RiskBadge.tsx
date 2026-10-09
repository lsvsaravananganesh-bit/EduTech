import React from 'react';
import { RiskLevel } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showIcon = true, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-xs font-bold';

  switch (level) {
    case 'ON_TRACK':
    case 'LOW_CONCERN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 dark:border-emerald-750/70 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-2xs ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400' : 'w-4 h-4 text-emerald-600 dark:text-emerald-400'} />}
          <span>On Track</span>
        </span>
      );
    case 'NEEDS_ATTENTION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 shadow-2xs ${sizeClasses}`}
        >
          {showIcon && <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5 text-amber-600 dark:text-amber-400' : 'w-4 h-4 text-amber-600 dark:text-amber-400'} />}
          <span>Needs Attention</span>
        </span>
      );
    case 'HIGH_PRIORITY_SUPPORT':
    case 'HIGH_CONCERN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-rose-300/80 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 shadow-2xs ${sizeClasses}`}
        >
          {showIcon && <AlertOctagon className={size === 'sm' ? 'w-3.5 h-3.5 text-rose-600 dark:text-rose-400' : 'w-4 h-4 text-rose-600 dark:text-rose-400'} />}
          <span>High Priority Support</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ${sizeClasses}`}
        >
          <span>{String(level).replace(/_/g, ' ')}</span>
        </span>
      );
  }
};
