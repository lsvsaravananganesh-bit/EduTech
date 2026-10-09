import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquareQuote, CheckCircle2, Clock } from 'lucide-react';

export const StudentFeedbackPlans: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getDashboard();
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
    return <div className="text-xs text-slate-500 py-12 text-center">Loading feedback and plans...</div>;
  }

  const { recentFeedback = [], activeImprovementPlans = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">
          Teacher Feedback & Academic Improvement Plans
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Formative recommendations and structured action items shared by faculty
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Section */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareQuote className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-semibold text-navy-900">Faculty Evaluations</h3>
          </div>

          {recentFeedback.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No teacher feedback records found.</p>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((fb: any) => (
                <div key={fb.id} className="p-3.5 rounded border border-border bg-slate-50/50 text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-navy-900">{fb.subjectName}</span>
                    <span className="text-[11px] text-slate-500">
                      {fb.teacherName} • {fb.date}
                    </span>
                  </div>
                  {fb.assessmentName && (
                    <span className="inline-block text-[10px] font-medium bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded mb-2">
                      Assessment: {fb.assessmentName}
                    </span>
                  )}
                  <p className="text-slate-700 leading-relaxed italic">"{fb.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Improvement Plans */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-semibold text-navy-900">Structured Academic Milestones</h3>
          </div>

          {activeImprovementPlans.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No active improvement plans assigned.</p>
          ) : (
            <div className="space-y-4">
              {activeImprovementPlans.map((plan: any) => (
                <div key={plan.id} className="p-4 rounded border border-teal-200 bg-teal-50/20 text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-teal-900 text-sm block">{plan.goal}</span>
                      <span className="text-[11px] text-slate-500">
                        {plan.subjectName} • Created by {plan.teacherName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                      Due: {plan.targetDate}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 pl-1 border-t border-teal-100 pt-2">
                    {plan.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-2">
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
