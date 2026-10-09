import React from 'react';
import { RiskBadge } from './RiskBadge';
import { RiskLevel } from '../../types';
import { Sparkles, Info, ArrowUpRight, ArrowDownRight, Minus, Flame } from 'lucide-react';

interface AcademicStandingBannerProps {
  role: 'STUDENT' | 'SUBJECT_TEACHER' | 'CLASS_TEACHER';
  riskLevel?: RiskLevel;
  primaryMetricLabel?: string;
  primaryMetricValue?: string | number | null;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: string | number | null;
  summaryText: string;
  evidenceText?: string;
  recommendations?: string[];
}

export const AcademicStandingBanner: React.FC<AcademicStandingBannerProps> = ({
  role,
  riskLevel = 'LOW_CONCERN',
  primaryMetricLabel,
  primaryMetricValue,
  secondaryMetricLabel,
  secondaryMetricValue,
  summaryText,
  evidenceText,
  recommendations,
}) => {
  const titles = {
    STUDENT: 'How am I progressing?',
    SUBJECT_TEACHER: 'Which students need attention in my subject?',
    CLASS_TEACHER: 'Which students need coordinated support?',
  };

  const getThemeClasses = () => {
    if (riskLevel === 'HIGH_CONCERN' || riskLevel === 'HIGH_PRIORITY_SUPPORT') {
      return 'border-rose-300/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/80 via-white to-white dark:from-rose-950/20 dark:via-[#111827] dark:to-[#111827]';
    }
    if (riskLevel === 'NEEDS_ATTENTION') {
      return 'border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/80 via-white to-white dark:from-amber-950/20 dark:via-[#111827] dark:to-[#111827]';
    }
    return 'border-seagreen-300/80 dark:border-seagreen-900/60 bg-gradient-to-r from-seagreen-50/70 via-white to-white dark:from-seagreen-950/20 dark:via-[#111827] dark:to-[#111827]';
  };

  return (
    <div className={`rounded-xl border p-5 shadow-xs transition-all ${getThemeClasses()}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-seagreen-800 dark:text-seagreen-300 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-seagreen-500 animate-pulse"></span>
              SmartBro Academic Intelligence
            </span>
          </div>
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mt-1">{titles[role]}</h2>
        </div>

        <div className="flex items-center gap-4">
          {primaryMetricLabel && (
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{primaryMetricLabel}</span>
              <span className="text-xl font-extrabold text-navy-900 dark:text-white">
                {primaryMetricValue !== null && primaryMetricValue !== undefined
                  ? primaryMetricValue
                  : 'N/A'}
              </span>
            </div>
          )}

          {secondaryMetricLabel && (
            <div className="text-right pl-4 border-l border-border dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{secondaryMetricLabel}</span>
              <span className="text-xl font-extrabold text-navy-900 dark:text-white">
                {secondaryMetricValue !== null && secondaryMetricValue !== undefined
                  ? secondaryMetricValue
                  : 'N/A'}
              </span>
            </div>
          )}

          <div className="pl-2">
            <RiskBadge level={riskLevel} size="md" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{summaryText}</p>
          {evidenceText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>Evidence: {evidenceText}</span>
            </p>
          )}
        </div>

        {recommendations && recommendations.length > 0 && (
          <div className="md:w-80 shrink-0 bg-white/90 dark:bg-slate-900/90 border border-seagreen-200/90 dark:border-seagreen-800/80 rounded-lg p-3 text-xs shadow-2xs">
            <span className="font-semibold text-seagreen-950 dark:text-seagreen-300 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400" /> Suggested Action
            </span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
              {recommendations.slice(0, 2).map((rec, i) => (
                <li key={i} className="leading-snug">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
