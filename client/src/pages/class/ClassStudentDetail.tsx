import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  ShieldAlert,
  MessageSquareQuote,
  History,
  Calendar,
  Plus,
  Send,
  UserCheck,
} from 'lucide-react';

export const ClassStudentDetail: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intervention Modal
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [concern, setConcern] = useState('');
  const [action, setAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Add Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeInterventionId, setActiveInterventionId] = useState<string>('');
  const [noteText, setNoteText] = useState('');

  const loadData = async () => {
    if (!studentId) return;
    try {
      const res = await api.classTeacher.getStudentDetail(studentId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading student overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !concern.trim() || !action.trim()) return;

    try {
      await api.classTeacher.createIntervention({
        studentId,
        concern,
        action,
        followUpDate: followUpDate || undefined,
      });
      setConcern('');
      setAction('');
      setFollowUpDate('');
      setInterventionModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error recording intervention');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterventionId || !noteText.trim()) return;

    try {
      await api.classTeacher.addInterventionNote(activeInterventionId, noteText);
      setNoteText('');
      setNoteModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error adding follow-up note');
    }
  };

  const handleUpdateStatus = async (interventionId: string, newStatus: string) => {
    try {
      await api.classTeacher.updateIntervention(interventionId, { status: newStatus });
      loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-12 text-center">Loading holistic student overview...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
        {error || 'Unable to view student overview.'}
      </div>
    );
  }

  const { student, overallRisk, feedbacks = [], riskHistory = [], interventions = [] } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/class/register"
          className="text-xs font-medium text-slate-500 hover:text-navy-900 inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Class Register</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-navy-900 tracking-tight">{student.fullName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: {student.studentNumber} • Class: {student.className} - Section {student.section} • AY: {student.academicYear}
            </p>
          </div>

          <button
            onClick={() => setInterventionModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded bg-teal-700 text-white hover:bg-teal-800 inline-flex items-center gap-1.5 shadow-xs"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Initiate Intervention</span>
          </button>
        </div>
      </div>

      {/* Holistic Academic Standing Banner */}
      <div className="bg-white rounded-lg border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Composite Standing Assessment
            </span>
            <RiskBadge level={overallRisk.riskLevel} />
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-4">
            <span>
              Cumulative Grade: <strong className="text-navy-900">{overallRisk.overallPercentage ?? 'N/A'}%</strong>
            </span>
            <span>
              Class Attendance: <strong className="text-navy-900">{overallRisk.overallAttendancePercentage ?? 'N/A'}%</strong>
            </span>
          </div>
        </div>

        <div className="mt-3 text-xs">
          <p className="text-slate-800 font-medium">{overallRisk.primaryReason}</p>
          <p className="text-slate-500 text-[11px] mt-1">Verified Evidence: {overallRisk.evidence}</p>
        </div>
      </div>

      {/* Subject-Wise Performance Table */}
      <div className="bg-white rounded-lg border border-border p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-navy-900 mb-3">Course Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-border text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3 text-right">Marks / Max</th>
                <th className="py-2.5 px-3 text-right">Percentage</th>
                <th className="py-2.5 px-3 text-center">Trend Δ</th>
                <th className="py-2.5 px-3 text-center">Subject Attendance</th>
                <th className="py-2.5 px-3">Subject Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {overallRisk.subjectRisks.map((sub: any) => (
                <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-medium text-navy-900">{sub.subjectName}</td>
                  <td className="py-3 px-3 text-right text-slate-700">
                    {sub.marksObtained} / {sub.maximumMarks}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-navy-900">
                    {sub.percentage !== null ? `${sub.percentage}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sub.trendChange !== null ? (
                      <span
                        className={
                          sub.trendChange < 0
                            ? 'text-rose-700 font-medium'
                            : 'text-emerald-700 font-medium'
                        }
                      >
                        {sub.trendChange > 0 ? `+${sub.trendChange}` : sub.trendChange}%
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700">
                    {sub.attendancePercentage !== null ? `${sub.attendancePercentage}%` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={sub.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Columns: Interventions Log & Shared Faculty Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intervention History */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-navy-900">Academic Interventions & Follow-ups</h3>
            </div>
            <button
              onClick={() => setInterventionModalOpen(true)}
              className="text-xs text-teal-700 font-medium hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>

          {interventions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No interventions recorded for this student.</p>
          ) : (
            <div className="space-y-4">
              {interventions.map((it: any) => (
                <div key={it.id} className="p-3.5 rounded border border-border bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-navy-900 text-xs">{it.concern}</span>
                    <select
                      value={it.status}
                      onChange={(e) => handleUpdateStatus(it.id, e.target.value)}
                      className="border border-slate-300 rounded px-2 py-0.5 text-[10px] bg-white font-medium focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="MONITORING">MONITORING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>

                  <p className="text-slate-700 mb-2">
                    <strong>Prescribed Action:</strong> {it.action}
                  </p>

                  <div className="text-[11px] text-slate-500 mb-2.5 flex items-center justify-between border-t border-border pt-1.5">
                    <span>Initiated by {it.creatorName} • Scope: {it.subjectName}</span>
                    <span>Follow-up: {it.followUpDate || 'TBD'}</span>
                  </div>

                  {/* Notes thread */}
                  {it.notes.length > 0 && (
                    <div className="space-y-1.5 pl-2 border-l-2 border-teal-200 mt-2">
                      {it.notes.map((n: any) => (
                        <div key={n.id} className="text-[11px] text-slate-600">
                          <strong className="text-navy-900">{n.authorName}:</strong> {n.note}{' '}
                          <span className="text-slate-400">({n.date})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2.5 pt-1.5 border-t border-border text-right">
                    <button
                      onClick={() => {
                        setActiveInterventionId(it.id);
                        setNoteModalOpen(true);
                      }}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Follow-Up Note</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shared Faculty Feedback */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareQuote className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-semibold text-navy-900">Shared Faculty Feedback</h3>
          </div>

          {feedbacks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No feedback entries available.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb: any) => (
                <div key={fb.id} className="p-3 rounded border border-border bg-slate-50/50 text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-navy-900">{fb.subjectName}</span>
                    <span className="text-[11px] text-slate-500">
                      {fb.teacherName} • {fb.date}
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
      </div>

      {/* Record Intervention Modal */}
      <Modal
        isOpen={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        title="Initiate Academic Intervention"
        subtitle={`Coordinate targeted support for ${student.fullName}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Identified Academic Concern</label>
            <textarea
              rows={3}
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder="e.g. Sharp decline in mathematics accompanied by attendance deficits..."
              required
              className="w-full border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Prescribed Action Plan</label>
            <textarea
              rows={3}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Schedule meeting with parents, assign peer study group, review homework..."
              required
              className="w-full border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Target Follow-Up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setInterventionModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium"
            >
              Save Intervention
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Follow-Up Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Follow-Up Note"
        subtitle="Log discussion notes, student progress updates, or conference outcomes"
        maxWidth="md"
      >
        <form onSubmit={handleAddNote} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Progress Observation / Note</label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record date, outcome, participant comments, or next steps..."
              required
              className="w-full border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNoteModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium"
            >
              Submit Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
