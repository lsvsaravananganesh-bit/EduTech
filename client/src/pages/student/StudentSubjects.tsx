import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SubjectSummary } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import { BookOpen, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StudentSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjectDetail, setSubjectDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getSubjects();
        if (res.success) {
          setSubjects(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openSubject = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setDetailLoading(true);
    try {
      const res = await api.student.getSubjectPerformance(subjectId);
      if (res.success) {
        setSubjectDetail(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-12 text-center">Loading subjects...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Subject Performance Register</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive review of marks, assessment results, and subject attendance
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
            <tr>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4 text-right">Marks Obtained / Max</th>
              <th className="py-3 px-4 text-right">Cumulative %</th>
              <th className="py-3 px-4 text-center">Assessments</th>
              <th className="py-3 px-4 text-center">Trend Δ</th>
              <th className="py-3 px-4 text-center">Attendance</th>
              <th className="py-3 px-4">Risk Evaluation</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subjects.map((s) => (
              <tr key={s.subjectId} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-medium text-navy-900">{s.subjectName}</td>
                <td className="py-3.5 px-4 text-right text-slate-700">
                  {s.marksObtained} / {s.maximumMarks}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-navy-900">
                  {s.percentage !== null ? `${s.percentage}%` : 'N/A'}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-600">{s.assessmentCount}</td>
                <td className="py-3.5 px-4 text-center">
                  {s.trendChange !== null ? (
                    s.trendChange > 0 ? (
                      <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +{s.trendChange}%
                      </span>
                    ) : s.trendChange < 0 ? (
                      <span className="text-rose-700 font-medium inline-flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" /> {s.trendChange}%
                      </span>
                    ) : (
                      <span className="text-slate-500 inline-flex items-center gap-0.5">
                        <Minus className="w-3 h-3" /> 0%
                      </span>
                    )
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700">
                  {s.attendancePercentage !== null ? `${s.attendancePercentage}%` : '—'}
                </td>
                <td className="py-3.5 px-4">
                  <RiskBadge level={s.riskLevel} />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => openSubject(s.subjectId)}
                    className="px-2.5 py-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedSubjectId}
        onClose={() => {
          setSelectedSubjectId(null);
          setSubjectDetail(null);
        }}
        title={subjectDetail?.subject?.name || 'Subject Record'}
        subtitle="Individual Course Diagnostic Profile"
        maxWidth="xl"
      >
        {detailLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading details...</div>
        ) : subjectDetail ? (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-border rounded">
              <span className="font-semibold text-navy-900 block mb-1">Status Reason</span>
              <p className="text-slate-700">{subjectDetail.riskAnalysis.reasons[0]}</p>
              <p className="text-slate-500 text-[11px] mt-1">{subjectDetail.riskAnalysis.evidence[0]}</p>
            </div>

            <div>
              <h4 className="font-semibold text-navy-900 mb-2">Assessment History</h4>
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
                    <tr>
                      <th className="py-2 px-3">Assessment</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Marks</th>
                      <th className="py-2 px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subjectDetail.assessments.map((a: any) => (
                      <tr key={a.resultId}>
                        <td className="py-2 px-3 font-medium text-navy-900">{a.assessmentName}</td>
                        <td className="py-2 px-3 text-slate-500">{a.assessmentDate}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{a.marksObtained} / {a.maximumMarks}</td>
                        <td className="py-2 px-3 text-right font-semibold text-navy-900">{a.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
