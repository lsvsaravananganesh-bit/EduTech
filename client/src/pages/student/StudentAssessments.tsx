import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const StudentAssessments: React.FC = () => {
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getDashboard();
        if (res.success) {
          setTrend(res.data.performanceTrend);
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
    return <div className="text-xs text-slate-500 py-12 text-center">Loading assessment records...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Assessment Record History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of published formative tests, projects, and midterm examinations
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
            <tr>
              <th className="py-3 px-4">Assessment Name</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Evaluation Date</th>
              <th className="py-3 px-4 text-right">Marks Obtained</th>
              <th className="py-3 px-4 text-right">Maximum Marks</th>
              <th className="py-3 px-4 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trend.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-medium text-navy-900">{item.assessmentName}</td>
                <td className="py-3 px-4 text-slate-600">{item.subjectName}</td>
                <td className="py-3 px-4 text-slate-500">{item.date}</td>
                <td className="py-3 px-4 text-right font-medium text-navy-900">{item.marksObtained}</td>
                <td className="py-3 px-4 text-right text-slate-500">{item.maximumMarks}</td>
                <td className="py-3 px-4 text-right font-semibold text-navy-900">{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
