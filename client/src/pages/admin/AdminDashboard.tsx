import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  Flame,
  ShieldAlert,
  Database,
  Sliders,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalInterventions: number;
  activeStreaks: number;
  riskDistribution: {
    onTrack: number;
    needsAttention: number;
    highPrioritySupport: number;
  };
  interventionsSummary: Array<{
    status: string;
    count: number;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.admin.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load system intelligence.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading administrative intelligence...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
        {error || 'Unable to retrieve administrative metrics.'}
      </div>
    );
  }

  const {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    totalInterventions,
    activeStreaks,
    riskDistribution,
    interventionsSummary,
  } = stats;

  const totalCalculated =
    riskDistribution.onTrack +
    riskDistribution.needsAttention +
    riskDistribution.highPrioritySupport;

  const onTrackPct =
    totalCalculated > 0 ? Math.round((riskDistribution.onTrack / totalCalculated) * 100) : 0;
  const needsAttentionPct =
    totalCalculated > 0 ? Math.round((riskDistribution.needsAttention / totalCalculated) * 100) : 0;
  const highPriorityPct =
    totalCalculated > 0
      ? Math.round((riskDistribution.highPrioritySupport / totalCalculated) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <span>/</span>
            <span>System Intelligence Overview</span>
          </div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight mt-1">
            SmartBro Academic System Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional oversight of student risk cohorts, faculty assignments, dataset validation, and habit engagement.
          </p>
        </div>

        {/* Quick CSV Export Shortcuts */}
        <div className="flex items-center gap-2">
          <a
            href={api.admin.exportStudentsUrl}
            target="_blank"
            rel="noreferrer"
            download="smartbro_students_export.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-navy-900 border border-border hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Students CSV</span>
          </a>
          <a
            href={api.admin.exportInterventionsUrl}
            target="_blank"
            rel="noreferrer"
            download="smartbro_interventions_export.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-navy-900 border border-border hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Interventions CSV</span>
          </a>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-lg border border-border shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Students</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-navy-900">{totalStudents}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active profiles</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Faculty</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-navy-900">{totalTeachers}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned teachers</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Classes</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-navy-900">{totalClasses}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalSubjects} Subjects</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Active Streaks</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-navy-900">{activeStreaks}</div>
          <div className="text-[10px] text-amber-600 mt-0.5 font-medium">Daily study habits</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Support Plans</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-navy-900">{totalInterventions}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total recorded</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">At-Risk Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-700">{highPriorityPct}%</div>
          <div className="text-[10px] text-rose-600 mt-0.5 font-medium">High priority support</div>
        </div>
      </div>

      {/* 2-Column: Risk Cohorts & Interventions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Cohorts Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-border p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-navy-900">
                Institutional Risk Cohort Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated dynamically via early warning rules: score thresholds, attendance, and decline trend
              </p>
            </div>
            <Link
              to="/admin/config"
              className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1"
            >
              Configure Thresholds <Sliders className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${onTrackPct}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`On Track: ${onTrackPct}%`}
            />
            <div
              style={{ width: `${needsAttentionPct}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Needs Attention: ${needsAttentionPct}%`}
            />
            <div
              style={{ width: `${highPriorityPct}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`High Priority Support: ${highPriorityPct}%`}
            />
          </div>

          {/* Cards for each risk category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> On Track
                </span>
                <span className="font-bold">{onTrackPct}%</span>
              </div>
              <div className="text-lg font-bold text-emerald-950">
                {riskDistribution.onTrack}{' '}
                <span className="text-xs font-normal text-emerald-700">students</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Meeting academic standards and attendance thresholds.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Needs Attention
                </span>
                <span className="font-bold">{needsAttentionPct}%</span>
              </div>
              <div className="text-lg font-bold text-amber-950">
                {riskDistribution.needsAttention}{' '}
                <span className="text-xs font-normal text-amber-700">students</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Moderate dips in 1 subject or borderline attendance.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50">
              <div className="flex items-center justify-between text-xs text-rose-800 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> High Priority Support
                </span>
                <span className="font-bold">{highPriorityPct}%</span>
              </div>
              <div className="text-lg font-bold text-rose-950">
                {riskDistribution.highPrioritySupport}{' '}
                <span className="text-xs font-normal text-rose-700">students</span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1">
                Multiple failing grades or significant downward momentum.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Intervention Outcomes & Quick Actions (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-border p-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-navy-900 mb-1">
              Active Interventions
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Support plans instituted by class teachers
            </p>

            <div className="space-y-2">
              {interventionsSummary.length > 0 ? (
                interventionsSummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100"
                  >
                    <span className="font-medium text-slate-700">{item.status.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-navy-900 px-2 py-0.5 bg-white rounded border border-border">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2">
                  No active interventions recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-navy-900 mb-2">
              Administrative Quick Navigation
            </h2>
            <div className="space-y-2 text-xs">
              <Link
                to="/admin/datasets"
                className="flex items-center justify-between p-2.5 rounded border border-border hover:border-teal-400 hover:bg-teal-50/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-navy-900">Dataset Ingestion & Kaggle Exams</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center justify-between p-2.5 rounded border border-border hover:border-teal-400 hover:bg-teal-50/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-navy-900">User Accounts & Roles</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/admin/config"
                className="flex items-center justify-between p-2.5 rounded border border-border hover:border-teal-400 hover:bg-teal-50/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-navy-900">Risk Thresholds Configuration</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
