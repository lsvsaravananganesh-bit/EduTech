import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getAttendance();
        if (res.success) {
          setAttendance(res.data);
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
    return <div className="text-xs text-slate-500 py-12 text-center">Loading attendance history...</div>;
  }

  if (!attendance) {
    return <div className="text-xs text-slate-400 py-12 text-center">No attendance data recorded.</div>;
  }

  const { percentage, classesAttended, classesHeld, history } = attendance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Attendance Record & Breakdown</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Calculated from recorded institutional sessions and classroom presence
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-border">
          <span className="text-xs text-slate-500 block">Overall Attendance Rate</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">{percentage}%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Institutional minimum target is 75%
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-border">
          <span className="text-xs text-slate-500 block">Sessions Attended</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">{classesAttended}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Present or excused</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-border">
          <span className="text-xs text-slate-500 block">Total Sessions Held</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">{classesHeld}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Verified timetabled sessions</span>
        </div>
      </div>

      {/* Attendance Session History */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50/50">
          <h3 className="text-sm font-semibold text-navy-900">Session Attendance Log</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Subject / Scope</th>
              <th className="py-3 px-4">Session Type</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.map((row: any) => (
              <tr key={row.sessionId} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-medium text-navy-900">{row.date}</td>
                <td className="py-3 px-4 text-slate-700">{row.subjectName}</td>
                <td className="py-3 px-4 text-slate-500">{row.sessionType}</td>
                <td className="py-3 px-4 text-center">
                  {row.status === 'PRESENT' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Present
                    </span>
                  ) : row.status === 'ABSENT' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3" /> Absent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> {row.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
