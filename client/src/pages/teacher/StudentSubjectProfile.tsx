import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
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
  ArrowLeft,
  Plus,
  MessageSquareQuote,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';

export const StudentSubjectProfile: React.FC = () => {
  const { studentId, subjectId } = useParams<{ studentId: string; subjectId: string }>();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackVisibility, setFeedbackVisibility] = useState<'SHARED' | 'TEACHER_ONLY'>('SHARED');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');

  // Add Improvement Plan Modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planGoal, setPlanGoal] = useState('');
  const [planTargetDate, setPlanTargetDate] = useState('');
  const [planTasks, setPlanTasks] = useState<string[]>(['', '']);

  const loadProfile = async () => {
    if (!studentId || !subjectId) return;
    try {
      const res = await api.subjectTeacher.getStudentSubjectProfile(studentId, subjectId);
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [studentId, subjectId]);

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !studentId || !subjectId) return;

    try {
      await api.subjectTeacher.addFeedback(studentId, {
        subjectId,
        feedbackText,
        visibility: feedbackVisibility,
        assessmentId: selectedAssessmentId || undefined,
      });
      setFeedbackText('');
      setFeedbackModalOpen(false);
      loadProfile();
    } catch (err: any) {
      alert(err.message || 'Error saving feedback');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planGoal.trim() || !planTargetDate || !studentId || !subjectId) return;

    const validTasks = planTasks.filter((t) => t.trim().length > 0);
    if (validTasks.length === 0) {
      alert('Please include at least one action item.');
      return;
    }

    try {
      await api.subjectTeacher.createImprovementPlan(studentId, {
        subjectId,
        goal: planGoal,
        targetDate: planTargetDate,
        tasks: validTasks,
      });
      setPlanGoal('');
      setPlanTargetDate('');
      setPlanTasks(['', '']);
      setPlanModalOpen(false);
      loadProfile();
    } catch (err: any) {
      alert(err.message || 'Error saving improvement plan');
    }
  };

  const handleTaskStatusToggle = async (planId: string, taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.subjectTeacher.updateTaskStatus(planId, taskId, newStatus);
      loadProfile();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-12 text-center">Loading student subject profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="p-4 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
        {error || 'Unable to access profile.'}
      </div>
    );
  }

  const { student, subject, riskAnalysis, assessmentHistory = [], attendance, feedbacks = [], improvementPlans = [] } = profile;

  return (
    <div className="space-y-6">
      {/* Back button and breadcrumb */}
      <div>
        <Link
          to={`/teacher/register`}
          className="text-xs font-medium text-slate-500 hover:text-navy-900 inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Register</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-navy-900 tracking-tight">
              {student.fullName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject Profile: <strong className="text-navy-900">{subject.name}</strong> • Student ID: {student.studentNumber} • Class: {student.className}-{student.section}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-teal-700" />
              <span>Record Feedback</span>
            </button>
            <button
              onClick={() => setPlanModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded bg-teal-700 text-white hover:bg-teal-800 inline-flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>New Improvement Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Academic Risk and Intervention Diagnostic Banner */}
      <div className="bg-white rounded-lg border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Diagnostic Risk Evaluation
            </span>
            <RiskBadge level={riskAnalysis.riskLevel} />
          </div>
          <span className="text-xs text-slate-500">
            Cumulative: <strong className="text-navy-900">{riskAnalysis.percentage ?? 'N/A'}%</strong> ({riskAnalysis.marksObtained}/{riskAnalysis.maximumMarks})
          </span>
        </div>

        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-navy-900 block mb-1">Triggered Condition:</span>
            <p className="text-slate-700 leading-relaxed">{riskAnalysis.reasons[0]}</p>
            {riskAnalysis.evidence[0] && (
              <p className="text-slate-500 mt-1 flex items-center gap-1 text-[11px]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Supporting Recorded Data: {riskAnalysis.evidence[0]}</span>
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-semibold text-slate-700 block mb-1">Recommended Pedagogical Action:</span>
            <p className="text-slate-600 leading-relaxed">{riskAnalysis.recommendations[0]}</p>
          </div>
        </div>
      </div>

      {/* 2-Columns: Assessment History Table & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Assessment History Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">Subject Assessment History</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited scores and maximum marks</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {assessmentHistory.length} Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-border text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Assessment</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Marks Obtained</th>
                  <th className="py-2.5 px-3 text-right">Max Marks</th>
                  <th className="py-2.5 px-3 text-right">Percentage</th>
                  <th className="py-2.5 px-3">Teacher Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {assessmentHistory.map((item: any) => (
                  <tr key={item.resultId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-navy-900">{item.name}</td>
                    <td className="py-3 px-3 text-slate-500">{item.date}</td>
                    <td className="py-3 px-3 text-right font-medium text-navy-900">{item.marksObtained}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{item.maximumMarks}</td>
                    <td className="py-3 px-3 text-right font-bold text-navy-900">{item.percentage}%</td>
                    <td className="py-3 px-3 text-slate-600 italic">
                      {item.feedback ? `"${item.feedback}"` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Trend Chart */}
        <div className="bg-white rounded-lg border border-border p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy-900 mb-1">Subject Performance Trajectory</h3>
            <p className="text-xs text-slate-500 mb-4">Normalized score percentage per assessment</p>

            {assessmentHistory.length > 0 ? (
              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessmentHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} unit="%" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload as any;
                          return (
                            <div className="bg-navy-900 text-white p-2 rounded text-xs shadow-md">
                              <p className="font-semibold">{p.name}</p>
                              <p className="text-teal-300">
                                {p.marksObtained} / {p.maximumMarks} ({p.percentage}%)
                              </p>
                              <p className="text-slate-400 text-[10px]">{p.date}</p>
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
                      dot={{ r: 4, fill: '#0D9488' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                No assessments logged.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 text-[11px] text-slate-500">
            Subject Attendance: <strong>{attendance.percentage !== null ? `${attendance.percentage}%` : 'N/A'}</strong> ({attendance.sessionsAttended}/{attendance.totalSessions} sessions attended)
          </div>
        </div>
      </div>

      {/* Teacher Feedback & Improvement Plans Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Log */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-navy-900">Recorded Teacher Feedback</h3>
            </div>
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {feedbacks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No feedback entries recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb: any) => (
                <div key={fb.id} className="p-3 rounded border border-border bg-slate-50/50 text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-navy-900">{fb.author}</span>
                    <span className="text-[11px] text-slate-400">
                      {fb.date} • <strong className="text-slate-600">{fb.visibility}</strong>
                    </span>
                  </div>
                  {fb.assessmentName && (
                    <span className="inline-block text-[10px] font-medium bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded mb-1.5">
                      Assessment: {fb.assessmentName}
                    </span>
                  )}
                  <p className="text-slate-700 italic">"{fb.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Improvement Plans */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-navy-900">Structured Academic Improvement Plans</h3>
            </div>
            <button
              onClick={() => setPlanModalOpen(true)}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          </div>

          {improvementPlans.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active improvement plans assigned.</p>
          ) : (
            <div className="space-y-4">
              {improvementPlans.map((plan: any) => (
                <div key={plan.id} className="p-4 rounded border border-teal-200 bg-teal-50/20 text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-teal-950 text-sm block">{plan.goal}</span>
                      <span className="text-[11px] text-slate-500">
                        Assigned by {plan.author} • Target: {plan.targetDate}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase">
                      {plan.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 pl-1 border-t border-teal-100 pt-2">
                    {plan.tasks.map((task: any) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleTaskStatusToggle(plan.id, task.id, task.status)}
                        className="w-full flex items-center justify-between text-left hover:bg-white/60 p-1 rounded transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          {task.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span
                            className={`text-slate-700 ${
                              task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.description}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Toggle status
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Add Teacher Feedback"
        subtitle={`Record constructive guidance for ${student.fullName} in ${subject.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAddFeedback} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Feedback Visibility</label>
            <select
              value={feedbackVisibility}
              onChange={(e) => setFeedbackVisibility(e.target.value as any)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="SHARED">Shared (Visible to Student & Class Teacher)</option>
              <option value="TEACHER_ONLY">Teacher Only (Internal Pedagogical Note)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Related Assessment (Optional)</label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="">General Subject Feedback</option>
              {assessmentHistory.map((a: any) => (
                <option key={a.assessmentId} value={a.assessmentId}>
                  {a.name} ({a.percentage}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Feedback Comments</label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Provide evidence-based constructive observation and specific practice advice..."
              required
              className="w-full border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium"
            >
              Save Feedback
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Improvement Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Establish Academic Improvement Plan"
        subtitle={`Goal-driven action checklist for ${student.fullName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Academic Goal</label>
            <input
              type="text"
              value={planGoal}
              onChange={(e) => setPlanGoal(e.target.value)}
              placeholder="e.g. Master trigonometric identities and score >= 65% on midterm review"
              required
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Target Evaluation Date</label>
            <input
              type="date"
              value={planTargetDate}
              onChange={(e) => setPlanTargetDate(e.target.value)}
              required
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700">Checklist Action Items</label>
              <button
                type="button"
                onClick={() => setPlanTasks([...planTasks, ''])}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-medium"
              >
                + Add Task
              </button>
            </div>
            <div className="space-y-2">
              {planTasks.map((task, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={task}
                  onChange={(e) => {
                    const copy = [...planTasks];
                    copy[idx] = e.target.value;
                    setPlanTasks(copy);
                  }}
                  placeholder={`Task ${idx + 1}: e.g. Complete 10 practice worksheet problems`}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setPlanModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium"
            >
              Establish Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
