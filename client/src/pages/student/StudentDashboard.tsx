import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StudentDashboardData } from '../../types';
import { AcademicStandingBanner } from '../../components/common/AcademicStandingBanner';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageSquareQuote,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected subject modal state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjectDetail, setSubjectDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load student dashboard.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openSubjectDetail = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setDetailLoading(true);
    try {
      const res = await api.student.getSubjectPerformance(subjectId);
      if (res.success) {
        setSubjectDetail(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading student analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
        {error || 'Unable to load dashboard data.'}
      </div>
    );
  }

  const { studentInfo, academicStanding, subjectSummaries, performanceTrend, recentFeedback, activeImprovementPlans } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Student Portal</span>
          <span>/</span>
          <span>Academic Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
          <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight">
            Academic Progress & Standing
          </h1>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Student: <strong className="text-navy-900 dark:text-slate-200">{studentInfo.fullName}</strong> ({studentInfo.studentNumber}) • {studentInfo.className}-{studentInfo.section}
          </div>
        </div>
      </div>

      {/* SmartBro Friendly Greeting & Quick Companion Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-teal-200/80 dark:border-teal-900/50 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-seagreen-600 via-teal-600 to-sky-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            SB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-navy-900 dark:text-slate-100">
                Hey {studentInfo.fullName.split(' ')[0]}! SmartBro is with you.
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Supportive Friend
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Focus on 1 small win today. Consistent 20-minute daily blocks build unstoppable momentum.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/student/boloclass"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-pinkpurple-50 dark:bg-pinkpurple-950/40 text-pinkpurple-800 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800/60 hover:bg-pinkpurple-100 dark:hover:bg-pinkpurple-900/40 transition-colors shadow-2xs"
          >
            <span>🎙️</span>
            <span>BoloClass AI</span>
          </Link>
          <Link
            to="/student/streak"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Streak Journey</span>
          </Link>
          <Link
            to="/student/companion"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask SmartBro AI</span>
          </Link>
        </div>
      </div>

      {/* Signature Design Feature: Academic Standing ("How am I progressing?") */}
      <AcademicStandingBanner
        role="STUDENT"
        riskLevel={academicStanding.riskLevel}
        primaryMetricLabel="Overall Cumulative Average"
        primaryMetricValue={academicStanding.overallPercentage !== null ? `${academicStanding.overallPercentage}%` : 'N/A'}
        secondaryMetricLabel="Class Attendance"
        secondaryMetricValue={academicStanding.overallAttendancePercentage !== null ? `${academicStanding.overallAttendancePercentage}%` : 'N/A'}
        summaryText={academicStanding.primaryReason}
        recommendations={academicStanding.recommendations}
      />

      {/* 2-Column Section: Subject Performance Table & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Subject Performance Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">Enrolled Subjects Performance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current standing calculated from verified assessments
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {subjectSummaries.length} Subjects Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-y border-border dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-right">Marks / Max</th>
                  <th className="py-2.5 px-3 text-right">Percentage</th>
                  <th className="py-2.5 px-3 text-center">Trend</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                  <th className="py-2.5 px-3">Standing Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                {subjectSummaries.map((subj) => (
                  <tr key={subj.subjectId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-navy-900 dark:text-slate-100">{subj.subjectName}</td>
                    <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                      {subj.marksObtained} / {subj.maximumMarks}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-navy-900 dark:text-slate-100">
                      {subj.percentage !== null ? `${subj.percentage}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {subj.trendChange !== null ? (
                        subj.trendChange > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            <TrendingUp className="w-3 h-3" /> +{subj.trendChange}%
                          </span>
                        ) : subj.trendChange < 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                            <TrendingDown className="w-3 h-3" /> {subj.trendChange}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                            <Minus className="w-3 h-3" /> 0%
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Baseline</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                      {subj.attendancePercentage !== null ? `${subj.attendancePercentage}%` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={subj.riskLevel} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => openSubjectDetail(subj.subjectId)}
                        className="text-seagreen-700 dark:text-seagreen-400 hover:text-seagreen-900 dark:hover:text-seagreen-200 font-semibold inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-seagreen-50 dark:hover:bg-seagreen-950/40 transition-colors"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Performance Trend Chart */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">Assessment Trajectory</h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Over Time</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Marks percentage recorded across all assessments
            </p>

            {performanceTrend.length > 0 ? (
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload as any;
                          return (
                            <div className="bg-navy-900 text-white p-2 rounded text-xs shadow-md border border-navy-700">
                              <p className="font-semibold">{p.assessmentName}</p>
                              <p className="text-[11px] text-teal-300">{p.subjectName}</p>
                              <p className="text-[11px] text-slate-300 mt-1">
                                Score: {p.marksObtained} / {p.maximumMarks} ({p.percentage}%)
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Date: {p.date}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#0D9488"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0D9488' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                No recorded assessment trend points yet.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 text-[11px] text-slate-500">
            Note: Percentages normalized from stored maximum marks. Assessments on different scales are not raw summed.
          </div>
        </div>
      </div>

      {/* Actionable Next Steps: Areas for Improvement, Feedback, & Improvement Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Teacher Feedback */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareQuote className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
            <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">Recent Teacher Feedback</h3>
          </div>

          {recentFeedback.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No shared feedback entries at this time.</p>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((fb) => (
                <div key={fb.id} className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-semibold text-navy-900 dark:text-slate-100">{fb.subjectName}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {fb.teacherName} • {fb.date}
                    </span>
                  </div>
                  {fb.assessmentName && (
                    <span className="inline-block text-[10px] font-semibold bg-seagreen-100/60 dark:bg-seagreen-950/60 text-seagreen-800 dark:text-seagreen-300 px-1.5 py-0.5 rounded mb-1.5 border border-seagreen-200/60 dark:border-seagreen-800/40">
                      Ref: {fb.assessmentName}
                    </span>
                  )}
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{fb.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Improvement Plans & Next Actions */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
            <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">Active Academic Improvement Plans</h3>
          </div>

          {activeImprovementPlans.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No formal improvement plans currently required. Continue regular study routines.
            </div>
          ) : (
            <div className="space-y-4">
              {activeImprovementPlans.map((plan) => (
                <div key={plan.id} className="p-3.5 rounded-lg border border-seagreen-200/80 dark:border-seagreen-900/60 bg-seagreen-50/20 dark:bg-seagreen-950/20 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-seagreen-900 dark:text-seagreen-300">{plan.subjectName} Plan</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-seagreen-100 dark:bg-seagreen-900/60 text-seagreen-800 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800">
                      Target: {plan.targetDate}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mb-2.5">{plan.goal}</p>

                  <div className="space-y-1.5 pl-1">
                    {plan.tasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        {task.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <span className={task.status === 'COMPLETED' ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subject Detail Inspection Modal */}
      <Modal
        isOpen={!!selectedSubjectId}
        onClose={() => {
          setSelectedSubjectId(null);
          setSubjectDetail(null);
        }}
        title={subjectDetail?.subject?.name || 'Subject Performance Detail'}
        subtitle={`Course Code: ${subjectDetail?.subject?.subjectCode || ''}`}
        maxWidth="xl"
      >
        {detailLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading subject record...</div>
        ) : subjectDetail ? (
          <div className="space-y-4 text-xs">
            {/* Risk condition */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-border dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-navy-900 dark:text-slate-100">Current Subject Evaluation</span>
                <RiskBadge level={subjectDetail.riskAnalysis.riskLevel} />
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-1">{subjectDetail.riskAnalysis.reasons[0]}</p>
            </div>

            {/* Assessment History Table */}
            <div>
              <h4 className="font-semibold text-navy-900 dark:text-slate-100 mb-2">Assessment History</h4>
              <div className="border border-border dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Assessment</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Marks / Max</th>
                      <th className="py-2 px-3 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-slate-700">
                    {subjectDetail.assessments.map((a: any) => (
                      <tr key={a.resultId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-navy-900 dark:text-slate-100">{a.assessmentName}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{a.assessmentDate}</td>
                        <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                          {a.marksObtained} / {a.maximumMarks}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-navy-900 dark:text-slate-100">
                          {a.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Teacher Feedbacks */}
            {subjectDetail.feedbacks.length > 0 && (
              <div>
                <h4 className="font-semibold text-navy-900 dark:text-slate-100 mb-2">Subject Teacher Feedback</h4>
                <div className="space-y-2">
                  {subjectDetail.feedbacks.map((fb: any) => (
                    <div key={fb.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-border dark:border-slate-700">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-medium text-navy-900 dark:text-slate-200">{fb.teacherName}</span>
                        <span>{fb.date}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{fb.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
