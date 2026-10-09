import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AcademicStandingBanner } from '../../components/common/AcademicStandingBanner';
import { BookOpen, Users, Award, AlertTriangle, ArrowRight, Plus } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.subjectTeacher.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-500 py-12 text-center">Loading subject teacher workspace...</div>;
  }

  const { teacherName, assignments = [], totalStudents = 0, needingAttentionCount = 0, recentAssessments = [] } = data || {};

  const attentionRatio = totalStudents > 0 ? Math.round((needingAttentionCount / totalStudents) * 100) : 0;
  const overallRisk = needingAttentionCount > 2 ? 'HIGH_CONCERN' : needingAttentionCount > 0 ? 'NEEDS_ATTENTION' : 'LOW_CONCERN';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Subject Faculty Portal</span>
          <span>/</span>
          <span>Subject Overview</span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Subject Teacher Workspace</h1>
          <span className="text-xs text-slate-500">Faculty: <strong className="text-navy-900">{teacherName}</strong></span>
        </div>
      </div>

      {/* Signature Design Feature: Academic Standing ("Which students need attention in my subject?") */}
      <AcademicStandingBanner
        role="SUBJECT_TEACHER"
        riskLevel={overallRisk}
        primaryMetricLabel="Students Needing Attention"
        primaryMetricValue={`${needingAttentionCount} of ${totalStudents}`}
        secondaryMetricLabel="Subject Risk Ratio"
        secondaryMetricValue={`${attentionRatio}%`}
        summaryText={
          needingAttentionCount > 0
            ? `${needingAttentionCount} student(s) in your assigned courses currently trigger academic early warning flags due to assessment scores below 40% or declining trends.`
            : 'All enrolled students currently meet the minimum 40% performance threshold and demonstrate stable trend trajectory.'
        }
        recommendations={[
          'Inspect the Student Register to review diagnostic quiz breakdowns and individual scores.',
          'Schedule targeted clinic reviews for students displaying downward consecutive trends.',
        ]}
      />

      {/* Assigned Classes and Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a: any) => (
          <div key={a.id} className="bg-white p-5 rounded-lg border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {a.subjectName}
                </span>
                <span className="text-xs text-slate-500">{a.academicYear}</span>
              </div>
              <h3 className="text-base font-bold text-navy-900 mt-1">{a.className} - Section {a.section}</h3>
              <p className="text-xs text-slate-500 mt-1">Authorized subject grading & performance scope</p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
              <Link
                to={`/teacher/register?classId=${a.classId}&subjectId=${a.subjectId}`}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                <span>View Students</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={`/teacher/assessments`}
                className="text-xs text-slate-500 hover:text-navy-900"
              >
                Assessments
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Recent Assessments & Grading Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tests and assignments published across assigned classes</p>
          </div>
          <Link
            to="/teacher/assessments"
            className="text-xs font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
          >
            <span>Manage All Assessments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-border text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-3">Assessment Name</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Scheduled Date</th>
                <th className="py-2.5 px-3 text-right">Max Marks</th>
                <th className="py-2.5 px-3 text-center">Marks Entered</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentAssessments.map((ass: any) => (
                <tr key={ass.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-medium text-navy-900">{ass.name}</td>
                  <td className="py-3 px-3 text-slate-600">{ass.subjectName}</td>
                  <td className="py-3 px-3 text-slate-600">{ass.className}</td>
                  <td className="py-3 px-3 text-slate-500">{ass.date}</td>
                  <td className="py-3 px-3 text-right font-medium text-navy-900">{ass.maximumMarks}</td>
                  <td className="py-3 px-3 text-center text-teal-700 font-medium">{ass.resultsCount} students</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {ass.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
