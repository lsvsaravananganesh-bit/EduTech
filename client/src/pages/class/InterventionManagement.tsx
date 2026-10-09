import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { ShieldAlert, Plus, MessageSquare, Calendar, CheckCircle2, Clock, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InterventionManagement: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Intervention Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [concern, setConcern] = useState('');
  const [action, setAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Add Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeInterventionId, setActiveInterventionId] = useState<string>('');
  const [noteText, setNoteText] = useState('');

  const loadData = async () => {
    try {
      const clsRes = await api.classTeacher.getClasses();
      if (clsRes.success && clsRes.data.length > 0) {
        setClasses(clsRes.data);
        const activeCls = selectedClassId || clsRes.data[0].id;
        if (!selectedClassId) setSelectedClassId(activeCls);

        const [itRes, stuRes] = await Promise.all([
          api.classTeacher.getInterventions({ classId: activeCls }),
          api.classTeacher.getClassStudents(activeCls),
        ]);

        if (itRes.success) setInterventions(itRes.data);
        if (stuRes.success) {
          setClassStudents(stuRes.data);
          if (stuRes.data.length > 0 && !selectedStudentId) {
            setSelectedStudentId(stuRes.data[0].studentId);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !concern.trim() || !action.trim()) return;

    try {
      await api.classTeacher.createIntervention({
        studentId: selectedStudentId,
        concern,
        action,
        followUpDate: followUpDate || undefined,
      });
      setCreateModalOpen(false);
      setConcern('');
      setAction('');
      setFollowUpDate('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error recording intervention');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.classTeacher.updateIntervention(id, { status: newStatus });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterventionId || !noteText.trim()) return;

    try {
      await api.classTeacher.addInterventionNote(activeInterventionId, noteText);
      setNoteModalOpen(false);
      setNoteText('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error submitting note');
    }
  };

  const filteredInterventions = interventions.filter((it) => {
    const matchesStatus = statusFilter === 'ALL' || it.status === statusFilter;
    const matchesSearch =
      it.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.concern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Academic Intervention Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate student support, assign faculty follow-ups, and audit pedagogical outcomes
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 text-xs font-medium rounded bg-teal-700 text-white hover:bg-teal-800 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Academic Intervention</span>
        </button>
      </div>

      {/* Filter and Class bar */}
      <div className="bg-white p-4 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="font-medium text-slate-700">Assigned Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-medium text-navy-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - Section {c.section}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or concern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 w-48 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN Only</option>
            <option value="IN_PROGRESS">IN_PROGRESS Only</option>
            <option value="MONITORING">MONITORING Only</option>
            <option value="RESOLVED">RESOLVED Only</option>
          </select>
        </div>
      </div>

      {/* Interventions Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-xs text-slate-400 py-12 text-center bg-white rounded-lg border border-border">
            Loading interventions...
          </div>
        ) : filteredInterventions.length === 0 ? (
          <div className="text-xs text-slate-500 py-12 text-center bg-white rounded-lg border border-border">
            No active interventions matching current criteria.
          </div>
        ) : (
          filteredInterventions.map((it) => (
            <div key={it.id} className="bg-white p-5 rounded-lg border border-border shadow-xs text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/class/students/${it.studentId}`}
                      className="font-bold text-sm text-navy-900 hover:text-teal-700 hover:underline"
                    >
                      {it.studentName}
                    </Link>
                    <span className="text-[11px] text-slate-400">({it.studentNumber})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      Scope: {it.subjectName}
                    </span>
                  </div>
                  <h4 className="font-semibold text-navy-900 mt-1">{it.concern}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Status:</span>
                    <select
                      value={it.status}
                      onChange={(e) => handleUpdateStatus(it.id, e.target.value)}
                      className={`text-xs font-bold border rounded px-2 py-0.5 mt-0.5 focus:ring-1 focus:ring-teal-600 ${
                        it.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : it.status === 'OPEN'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="MONITORING">MONITORING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Prescribed Action:</span>
                  <p className="text-slate-600 leading-relaxed">{it.action}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-border text-[11px]">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Follow-Up Notes ({it.notesCount}):
                  </span>
                  {it.latestNote ? (
                    <p className="text-slate-600 italic">Latest: "{it.latestNote}"</p>
                  ) : (
                    <p className="text-slate-400 italic">No notes logged yet.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-slate-400">
                <span>
                  Initiated by {it.creatorName} on {it.createdAt} • Target Follow-Up: {it.followUpDate || 'TBD'}
                </span>
                <button
                  onClick={() => {
                    setActiveInterventionId(it.id);
                    setNoteModalOpen(true);
                  }}
                  className="font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Follow-Up Note</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Intervention Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record New Academic Intervention"
        subtitle="Coordinate student recovery with assigned class and subject teachers"
        maxWidth="md"
      >
        <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {classStudents.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  {st.studentName} ({st.studentNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Academic Concern</label>
            <textarea
              rows={3}
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder="e.g. Student shows consistent diagnostic deficits in Science lab reports and Math assessments..."
              required
              className="w-full border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Intervention Action</label>
            <textarea
              rows={3}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Host joint conference with subject teachers, establish bi-weekly check-in..."
              required
              className="w-full border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Follow-Up Target Date</label>
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
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium"
            >
              Record Intervention
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Follow-Up Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Record Follow-Up Note"
        subtitle="Log observational update, meeting minutes, or status change"
        maxWidth="md"
      >
        <form onSubmit={handleAddNote} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Follow-Up Note</label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record update on student performance, conference discussions, or milestone completion..."
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
