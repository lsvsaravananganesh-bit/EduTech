import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserCheck, BookOpen } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getProfile();
        if (res.success) {
          setProfile(res.data);
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
    return <div className="text-xs text-slate-500 py-12 text-center">Loading student profile...</div>;
  }

  if (!profile) {
    return <div className="text-xs text-slate-400 py-12 text-center">Profile information unavailable.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Student Academic Identity</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified institutional record and registered courses
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-teal-700 text-white flex items-center justify-center text-xl font-bold">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900">{profile.fullName}</h2>
            <p className="text-xs text-slate-500">
              Student ID: {profile.studentNumber} • Institutional Email: {profile.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                Class: {profile.className} - Section {profile.section}
              </span>
              <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                AY: {profile.academicYear}
              </span>
              <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                Status: {profile.enrollmentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Enrolled Subjects & Faculty Assignment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.enrolledSubjects.map((sub: any) => (
              <div key={sub.subjectId} className="p-3.5 rounded border border-border bg-slate-50/50 text-xs">
                <span className="font-semibold text-navy-900 block">{sub.subjectName}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Code: {sub.subjectCode}</span>
                <span className="text-[11px] text-teal-800 font-medium block mt-1">
                  Instructor: {sub.teacherName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
