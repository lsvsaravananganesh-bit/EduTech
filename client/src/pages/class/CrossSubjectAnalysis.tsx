import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BarChart3, AlertOctagon, TrendingDown, CalendarX, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CrossSubjectAnalysis: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await api.classTeacher.getClasses();
        if (res.success && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    async function loadAnalysis() {
      if (!selectedClassId) return;
      setLoading(true);
      try {
        const res = await api.classTeacher.getSubjectAnalysis(selectedClassId);
        if (res.success) {
          setAnalysisData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [selectedClassId]);

  if (loading && !analysisData) {
    return <div className="text-xs text-slate-500 py-12 text-center">Computing cross-subject matrix...</div>;
  }

  const {
    subjects = [],
    multiSubjectConcernStudents = [],
    attendanceConcernStudents = [],
    decliningStudents = [],
  } = analysisData || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Cross-Subject Diagnostic Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-departmental comparison matrix identifying subject bottlenecks and vulnerable cohorts
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="font-medium text-slate-700">Class Section:</label>
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
      </div>

      {/* 1. Subject Performance Comparative Heatmap Table */}
      <div className="bg-white rounded-lg border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Course Average & Struggling Ratios</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies curriculum modules where class average drops below standard or failure rate is elevated
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-border text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Instructor</th>
                <th className="py-2.5 px-3 text-right">Class Average</th>
                <th className="py-2.5 px-3 text-center">Assessed Students</th>
                <th className="py-2.5 px-3 text-center">Struggling Count (&lt;50%)</th>
                <th className="py-2.5 px-3">Curriculum Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {subjects.map((sub: any) => (
                <tr key={sub.subjectId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-navy-900">{sub.subjectName}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{sub.subjectCode}</td>
                  <td className="py-3 px-3 text-slate-700">{sub.teacherName}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        sub.classAverage !== null && sub.classAverage < 55
                          ? 'bg-rose-100 text-rose-800'
                          : sub.classAverage !== null && sub.classAverage < 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sub.classAverage !== null ? `${sub.classAverage}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600">{sub.totalStudentsAssessed}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-semibold ${
                        sub.strugglingCount > 1
                          ? 'text-rose-700'
                          : sub.strugglingCount === 1
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {sub.strugglingCount} students
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {sub.isStrugglingSubject ? (
                      <span className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Class-wide Bottleneck Flagged
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Healthy Progression
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Cohort Panels: Multi-Subject Struggling, Declining Results, Attendance Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Multi-Subject Cohort */}
        <div className="bg-white rounded-lg border border-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-700 font-semibold">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>Multi-Subject Concern ({multiSubjectConcernStudents.length})</span>
            </div>
            <p className="text-slate-500 mb-3 text-[11px]">
              Students triggering academic risk in two or more subjects simultaneously
            </p>

            {multiSubjectConcernStudents.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">None in this section.</p>
            ) : (
              <div className="space-y-2">
                {multiSubjectConcernStudents.map((st: any) => (
                  <div key={st.studentId} className="p-2.5 rounded bg-rose-50/50 border border-rose-200">
                    <div className="flex justify-between items-baseline">
                      <Link
                        to={`/class/students/${st.studentId}`}
                        className="font-semibold text-navy-900 hover:text-teal-700 hover:underline"
                      >
                        {st.studentName}
                      </Link>
                      <span className="text-[11px] font-bold text-rose-700">
                        {st.overallPercentage !== null ? `${st.overallPercentage}%` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Concern in: {st.concerningSubjects.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 border-t border-border pt-2">
            Requires coordinated Class Teacher intervention across departments.
          </p>
        </div>

        {/* Declining Trends Cohort */}
        <div className="bg-white rounded-lg border border-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span>Declining Trajectory ({decliningStudents.length})</span>
            </div>
            <p className="text-slate-500 mb-3 text-[11px]">
              Scholars whose recent assessment score fell by ≥ 10 percentage points
            </p>

            {decliningStudents.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No sharp declines detected.</p>
            ) : (
              <div className="space-y-2">
                {decliningStudents.map((st: any) => (
                  <div key={st.studentId} className="p-2.5 rounded bg-amber-50/50 border border-amber-200">
                    <div className="flex justify-between items-baseline">
                      <Link
                        to={`/class/students/${st.studentId}`}
                        className="font-semibold text-navy-900 hover:text-teal-700 hover:underline"
                      >
                        {st.studentName}
                      </Link>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                      {st.declines.map((d: any, i: number) => (
                        <div key={i} className="text-rose-700 font-medium">
                          {d.subject}: Δ {d.change}%
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 border-t border-border pt-2">
            Immediate check-in recommended prior to final summative grading.
          </p>
        </div>

        {/* Attendance Concerns Cohort */}
        <div className="bg-white rounded-lg border border-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-semibold">
              <CalendarX className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Attendance Concerns ({attendanceConcernStudents.length})</span>
            </div>
            <p className="text-slate-500 mb-3 text-[11px]">
              Students with cumulative attendance recorded below institution's 75% threshold
            </p>

            {attendanceConcernStudents.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">All students meet 75% attendance.</p>
            ) : (
              <div className="space-y-2">
                {attendanceConcernStudents.map((st: any) => (
                  <div key={st.studentId} className="p-2.5 rounded bg-slate-50 border border-border">
                    <div className="flex justify-between items-baseline">
                      <Link
                        to={`/class/students/${st.studentId}`}
                        className="font-semibold text-navy-900 hover:text-teal-700 hover:underline"
                      >
                        {st.studentName}
                      </Link>
                      <span className="text-[11px] font-bold text-rose-700">
                        {st.attendancePercentage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Threshold deficit: {75 - st.attendancePercentage}% below minimum standard
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 border-t border-border pt-2">
            Schedule parent or student advisory conference to review missed hours.
          </p>
        </div>
      </div>
    </div>
  );
};
