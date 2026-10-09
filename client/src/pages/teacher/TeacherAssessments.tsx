import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Award, Plus, Edit3, Check, AlertCircle } from 'lucide-react';

export const TeacherAssessments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assessment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState<number>(50);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');

  // Enter Marks Modal
  const [marksModalOpen, setMarksModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [studentRows, setStudentRows] = useState<any[]>([]);
  const [marksError, setMarksError] = useState<string | null>(null);
  const [savingMarks, setSavingMarks] = useState(false);

  const loadData = async () => {
    try {
      const [dashRes, assignRes] = await Promise.all([
        api.subjectTeacher.getDashboard(),
        api.subjectTeacher.getAssignments(),
      ]);

      if (dashRes.success) {
        setAssessments(dashRes.data.recentAssessments);
      }
      if (assignRes.success && assignRes.data.length > 0) {
        setAssignments(assignRes.data);
        if (!selectedAssignmentId) setSelectedAssignmentId(assignRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignment = assignments.find((a) => a.id === selectedAssignmentId);
    if (!assignment) return;

    try {
      // Find term for this class
      const res = await api.subjectTeacher.createAssessment({
        name: newName,
        assessmentDate: newDate,
        maximumMarks: Number(newMaxMarks),
        subjectId: assignment.subjectId,
        classId: assignment.classId,
        termId: 'any', // The backend looks up term or defaults
        status: 'PUBLISHED',
      });

      if (res.success) {
        setCreateModalOpen(false);
        setNewName('');
        setNewDate('');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating assessment');
    }
  };

  const openMarksModal = async (assessmentId: string) => {
    setMarksError(null);
    try {
      const res = await api.subjectTeacher.getAssessment(assessmentId);
      if (res.success) {
        setActiveAssessment(res.data.assessment);
        setStudentRows(
          res.data.students.map((st: any) => ({
            ...st,
            marksInput: st.marksObtained !== null ? String(st.marksObtained) : '',
            feedbackInput: st.feedback || '',
          }))
        );
        setMarksModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Error opening assessment grading sheet');
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;
    setMarksError(null);
    setSavingMarks(true);

    const resultsToSave: any[] = [];

    // Client-side validation check
    for (const row of studentRows) {
      if (row.marksInput !== '') {
        const val = Number(row.marksInput);
        if (isNaN(val) || val < 0) {
          setMarksError(`Invalid mark "${row.marksInput}" for ${row.studentName}. Must be >= 0.`);
          setSavingMarks(false);
          return;
        }
        if (val > activeAssessment.maximumMarks) {
          setMarksError(
            `Mark ${val} for ${row.studentName} exceeds maximum allowed (${activeAssessment.maximumMarks}).`
          );
          setSavingMarks(false);
          return;
        }
        resultsToSave.push({
          studentId: row.studentId,
          marksObtained: val,
          feedback: row.feedbackInput.trim() || undefined,
        });
      }
    }

    if (resultsToSave.length === 0) {
      setMarksError('No marks were entered.');
      setSavingMarks(false);
      return;
    }

    try {
      const res = await api.subjectTeacher.enterMarks(activeAssessment.id, resultsToSave);
      if (res.success) {
        setMarksModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setMarksError(err.message || 'Error persisting marks to database.');
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">
            Assessments & Grading Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create tests, record student marks with range validation, and track submission progress
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 text-xs font-medium rounded bg-teal-700 text-white hover:bg-teal-800 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assessment</span>
        </button>
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
            <tr>
              <th className="py-3 px-4">Assessment Name</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Assessment Date</th>
              <th className="py-3 px-4 text-right">Max Marks</th>
              <th className="py-3 px-4 text-center">Graded Count</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  Loading assessments...
                </td>
              </tr>
            ) : assessments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No assessments created yet. Click "Create Assessment" to add one.
                </td>
              </tr>
            ) : (
              assessments.map((ass) => (
                <tr key={ass.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-navy-900">{ass.name}</td>
                  <td className="py-3 px-4 text-slate-600">{ass.subjectName}</td>
                  <td className="py-3 px-4 text-slate-600">{ass.className}</td>
                  <td className="py-3 px-4 text-slate-500">{ass.date}</td>
                  <td className="py-3 px-4 text-right font-medium text-navy-900">{ass.maximumMarks}</td>
                  <td className="py-3 px-4 text-center font-medium text-teal-800">
                    {ass.resultsCount} students
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openMarksModal(ass.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-700 hover:text-white rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Enter / Edit Marks</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Subject Assessment"
        subtitle="Schedule formative or summative assessment for assigned class"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Target Scope</label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.subjectName} — {a.className}-{a.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Assessment Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Unit Test 2 - Quadratic Functions"
              required
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">Maximum Marks</label>
              <input
                type="number"
                min="1"
                max="500"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                required
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
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
              Create Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* Enter / Edit Marks Modal */}
      <Modal
        isOpen={marksModalOpen}
        onClose={() => setMarksModalOpen(false)}
        title={activeAssessment ? `Grading Sheet: ${activeAssessment.name}` : 'Grading Sheet'}
        subtitle={
          activeAssessment
            ? `${activeAssessment.subjectName} • ${activeAssessment.className} • Max Marks: ${activeAssessment.maximumMarks}`
            : ''
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
          {marksError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{marksError}</span>
            </div>
          )}

          <div className="border border-border rounded overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Student Name & ID</th>
                  <th className="py-2.5 px-3 w-28 text-right">Marks (/{activeAssessment?.maximumMarks})</th>
                  <th className="py-2.5 px-3">Diagnostic Feedback Note (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentRows.map((st, idx) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-navy-900">
                      <div>{st.studentName}</div>
                      <div className="text-[10px] text-slate-400">{st.studentNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={activeAssessment?.maximumMarks}
                        value={st.marksInput}
                        onChange={(e) => {
                          const copy = [...studentRows];
                          copy[idx].marksInput = e.target.value;
                          setStudentRows(copy);
                        }}
                        placeholder="—"
                        className="w-20 border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={st.feedbackInput}
                        onChange={(e) => {
                          const copy = [...studentRows];
                          copy[idx].feedbackInput = e.target.value;
                          setStudentRows(copy);
                        }}
                        placeholder="e.g. Good proof structure, practice factoring"
                        className="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[11px] text-slate-400">
              Validated bounds: 0.0 to {activeAssessment?.maximumMarks}. Saving immediately recalculates student risk profiles.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMarksModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingMarks}
                className="px-4 py-1.5 bg-teal-700 text-white rounded hover:bg-teal-800 font-medium disabled:opacity-50"
              >
                {savingMarks ? 'Saving...' : 'Save & Publish Marks'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
