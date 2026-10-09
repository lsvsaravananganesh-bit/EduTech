import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AcademicStandingBanner } from '../../components/common/AcademicStandingBanner';
import { Users, BarChart3, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export const ClassDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.classTeacher.getDashboard();
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
    return <div className="text-xs text-slate-500 py-12 text-center">Loading class workspace...</div>;
  }

  const {
    teacherName,
    currentClass,
    enrolledStudentsCount = 0,
    overallClassPerformance = null,
    classAttendance = null,
    studentsNeedingSupportCount = 0,
    pendingInterventionsCount = 0,
  } = data || {};

  const riskLevel =
    studentsNeedingSupportCount > 2
      ? 'HIGH_CONCERN'
      : studentsNeedingSupportCount > 0
      ? 'NEEDS_ATTENTION'
      : 'LOW_CONCERN';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Class Faculty Portal</span>
          <span>/</span>
          <span>Class Overview</span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">
            Class Performance & Coordination
          </h1>
          <span className="text-xs text-slate-500">
            Class Teacher: <strong className="text-navy-900">{teacherName}</strong> • {currentClass?.name} - {currentClass?.section}
          </span>
        </div>
      </div>

      {/* Signature Design Feature: Academic Standing ("Which students need coordinated support?") */}
      <AcademicStandingBanner
        role="CLASS_TEACHER"
        riskLevel={riskLevel}
        primaryMetricLabel="Students Flagged for Support"
        primaryMetricValue={`${studentsNeedingSupportCount} of ${enrolledStudentsCount}`}
        secondaryMetricLabel="Class Attendance"
        secondaryMetricValue={classAttendance !== null ? `${classAttendance}%` : 'N/A'}
        summaryText={
          studentsNeedingSupportCount > 0
            ? `${studentsNeedingSupportCount} students in ${currentClass?.name}-${currentClass?.section} have been flagged by the early warning system due to multi-subject difficulty or low attendance (<75%).`
            : `All ${enrolledStudentsCount} enrolled students maintain satisfactory marks and consistent attendance.`
        }
        recommendations={[
          'Examine the Cross-Subject Analysis heatmap to pinpoint subject-specific bottleneck modules.',
          'Review pending interventions and coordinate follow-up notes with responsible subject instructors.',
        ]}
      />

      {/* Core Class Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-border shadow-xs">
          <span className="text-xs text-slate-500 block">Class Roster</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">{enrolledStudentsCount}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Active enrolled scholars</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-border shadow-xs">
          <span className="text-xs text-slate-500 block">Overall Class Academic Average</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {overallClassPerformance !== null ? `${overallClassPerformance}%` : 'N/A'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all verified assessments</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-border shadow-xs">
          <span className="text-xs text-slate-500 block">Class-Wide Attendance</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">
            {classAttendance !== null ? `${classAttendance}%` : 'N/A'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Present / Held sessions</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-border shadow-xs">
          <span className="text-xs text-slate-500 block">Active Interventions</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {pendingInterventionsCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Open, in progress, or monitoring</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/class/register"
          className="bg-white p-5 rounded-lg border border-border hover:border-teal-300 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-700 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-navy-900">Class Performance Register</h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete student table with multi-subject percentages, risk flags, and intervention actions.
          </p>
          <span className="text-xs font-semibold text-teal-700 mt-3 inline-flex items-center gap-1">
            <span>Open Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/class/cross-subject"
          className="bg-white p-5 rounded-lg border border-border hover:border-teal-300 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-700 group-hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-navy-900">Cross-Subject Diagnostic Matrix</h3>
          <p className="text-xs text-slate-500 mt-1">
            Comparative analysis identifying class-wide bottlenecks and multi-subject struggling students.
          </p>
          <span className="text-xs font-semibold text-teal-700 mt-3 inline-flex items-center gap-1">
            <span>View Heatmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/class/interventions"
          className="bg-white p-5 rounded-lg border border-border hover:border-teal-300 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-700 group-hover:text-white transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-navy-900">Academic Intervention Management</h3>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate support workflows, assign responsible faculty, and log ongoing follow-up notes.
          </p>
          <span className="text-xs font-semibold text-teal-700 mt-3 inline-flex items-center gap-1">
            <span>Manage Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
};
