import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Save,
  RefreshCw,
  Sparkles,
  TrendingDown,
  CalendarCheck,
  Award,
} from 'lucide-react';

export const SystemConfigPage: React.FC = () => {
  const [lowPerf, setLowPerf] = useState(40);
  const [attendanceConcern, setAttendanceConcern] = useState(75);
  const [declineTrend, setDeclineTrend] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getThresholds();
      if (res.success && res.data) {
        setLowPerf(res.data.lowPerformanceThreshold ?? 40);
        setAttendanceConcern(res.data.attendanceConcernThreshold ?? 75);
        setDeclineTrend(res.data.decliningTrendThreshold ?? 10);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching system configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.admin.updateThresholds({
        lowPerformanceThreshold: Number(lowPerf),
        attendanceConcernThreshold: Number(attendanceConcern),
        decliningTrendThreshold: Number(declineTrend),
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Academic risk thresholds successfully updated.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update thresholds');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <span>/</span>
            <span>Risk Thresholds Configuration</span>
          </div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight mt-1 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            Configurable Academic Early Warning Thresholds
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional benchmark boundaries that govern automated risk indicators, teacher registers, and student status.
          </p>
        </div>

        <button
          onClick={loadThresholds}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-border text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reload Defaults</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-slate-500">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Loading configuration parameters...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls (2 cols) */}
          <div className="lg:col-span-2 space-y-5 bg-white rounded-lg border border-border p-6 shadow-2xs">
            {/* 1. Low Performance Threshold */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-semibold text-navy-900">
                    Low Performance Benchmark (Passing Floor)
                  </span>
                </div>
                <span className="text-xs font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-border">
                  {lowPerf}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Any student with cumulative subject marks falling strictly below this threshold is flagged with an immediate academic concern status and recommended for targeted practice.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="25"
                  max="60"
                  step="1"
                  value={lowPerf}
                  onChange={(e) => setLowPerf(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <input
                  type="number"
                  min="25"
                  max="60"
                  value={lowPerf}
                  onChange={(e) => setLowPerf(Number(e.target.value))}
                  className="w-16 text-xs text-center border border-border rounded px-2 py-1 bg-white"
                />
              </div>
            </div>

            {/* 2. Attendance Concern Threshold */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-navy-900">
                    Institutional Attendance Concern Floor
                  </span>
                </div>
                <span className="text-xs font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-border">
                  {attendanceConcern}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Attendance lower than this figure automatically triggers an attendance warning on the student dashboard and alerts the class teacher.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="85"
                  step="1"
                  value={attendanceConcern}
                  onChange={(e) => setAttendanceConcern(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <input
                  type="number"
                  min="50"
                  max="85"
                  value={attendanceConcern}
                  onChange={(e) => setAttendanceConcern(Number(e.target.value))}
                  className="w-16 text-xs text-center border border-border rounded px-2 py-1 bg-white"
                />
              </div>
            </div>

            {/* 3. Declining Momentum Threshold */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-navy-900">
                    Consecutive Assessment Decline Drop
                  </span>
                </div>
                <span className="text-xs font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-border">
                  {declineTrend}% drop
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If a student’s score drops by more than this percentage between consecutive assessments (even if still above the passing grade), an early momentum alert is flagged.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={declineTrend}
                  onChange={(e) => setDeclineTrend(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <input
                  type="number"
                  min="5"
                  max="25"
                  value={declineTrend}
                  onChange={(e) => setDeclineTrend(Number(e.target.value))}
                  className="w-16 text-xs text-center border border-border rounded px-2 py-1 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-2 shadow-xs"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Deploy Thresholds</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Explanation Panel (1 col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-lg bg-white border border-border shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>How Early Warning Works</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                SmartBro uses a deterministic multi-factor decision tree to classify student standing into:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                  <span className="font-semibold text-emerald-800 text-[11px] block">
                    ✓ On Track
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Scores &gt; {lowPerf}%, attendance &gt; {attendanceConcern}%, stable or positive momentum.
                  </span>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-100">
                  <span className="font-semibold text-amber-800 text-[11px] block">
                    ⏳ Needs Attention
                  </span>
                  <span className="text-[10px] text-amber-700">
                    A drop &gt; {declineTrend}% or attendance between {lowPerf}% and {attendanceConcern}%.
                  </span>
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-100">
                  <span className="font-semibold text-rose-800 text-[11px] block">
                    ⚠️ High Priority Support
                  </span>
                  <span className="text-[10px] text-rose-700">
                    Multiple subjects &lt; {lowPerf}% or critical attendance &lt; 60%.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
              <span className="font-semibold block mb-1">Live Computation:</span>
              Threshold updates apply instantly to all student dashboards, teacher registers, and administrative risk distributions upon saving.
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
