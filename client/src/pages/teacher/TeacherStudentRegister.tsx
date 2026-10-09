import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { RiskLevel, TeacherStudentRegisterItem } from '../../types';
import { Search, Filter, TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';

export const TeacherStudentRegister: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [students, setStudents] = useState<TeacherStudentRegisterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'percentage' | 'risk'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await api.subjectTeacher.getAssignments();
        if (res.success && res.data.length > 0) {
          setAssignments(res.data);

          // Check if searchParams contain classId and subjectId
          const classId = searchParams.get('classId');
          const subjectId = searchParams.get('subjectId');
          const found = res.data.find(
            (a: any) => a.classId === classId && a.subjectId === subjectId
          );

          if (found) {
            setSelectedAssignmentId(found.id);
          } else {
            setSelectedAssignmentId(res.data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  useEffect(() => {
    async function loadStudents() {
      if (!activeAssignment) return;
      setLoading(true);
      try {
        const res = await api.subjectTeacher.getStudents(
          activeAssignment.classId,
          activeAssignment.subjectId
        );
        if (res.success) {
          setStudents(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [selectedAssignmentId, activeAssignment]);

  const handleAssignmentChange = (id: string) => {
    setSelectedAssignmentId(id);
    const assign = assignments.find((a) => a.id === id);
    if (assign) {
      setSearchParams({ classId: assign.classId, subjectId: assign.subjectId });
    }
  };

  // Filter & sort
  const filteredStudents = students
    .filter((st) => {
      const matchesSearch =
        st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || st.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.studentName.localeCompare(b.studentName)
          : b.studentName.localeCompare(a.studentName);
      }
      if (sortBy === 'percentage') {
        const pA = a.cumulativePercentage ?? -1;
        const pB = b.cumulativePercentage ?? -1;
        return sortOrder === 'asc' ? pA - pB : pB - pA;
      }
      if (sortBy === 'risk') {
        const priority: Record<RiskLevel, number> = {
          HIGH_CONCERN: 3,
          HIGH_PRIORITY_SUPPORT: 3,
          NEEDS_ATTENTION: 2,
          LOW_CONCERN: 1,
          ON_TRACK: 1,
        };
        const rA = priority[a.riskLevel] || 0;
        const rB = priority[b.riskLevel] || 0;
        return sortOrder === 'asc' ? rA - rB : rB - rA;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Student Performance Register</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic roster and risk classifications for authorized class and subject sections
        </p>
      </div>

      {/* Control Bar: Class/Subject Selector, Search, Risk Filter */}
      <div className="bg-white p-4 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Assignment Scope Selector */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-slate-700 whitespace-nowrap">Assigned Scope:</label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => handleAssignmentChange(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium text-navy-900"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.subjectName} — {a.className}-{a.section}
              </option>
            ))}
          </select>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 w-48 text-xs"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH_CONCERN">High Concern Only</option>
            <option value="NEEDS_ATTENTION">Needs Attention Only</option>
            <option value="LOW_CONCERN">Low Concern Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-navy-900"
                  >
                    <span>Student Name & ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Latest Mark</th>
                <th className="py-3 px-4 text-right">Latest %</th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSortBy('percentage');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-navy-900 ml-auto"
                  >
                    <span>Cumulative %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">Trend Δ</th>
                <th className="py-3 px-4 text-center">Assessments</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      setSortBy('risk');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-navy-900"
                  >
                    <span>Early Warning Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading student registers...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-navy-900">
                      <div>{st.studentName}</div>
                      <div className="text-[11px] text-slate-400">{st.studentNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700">
                      {st.latestMarks !== null ? `${st.latestMarks} / ${st.latestMaxMarks}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-navy-900">
                      {st.latestPercentage !== null ? `${st.latestPercentage}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-navy-900">
                      {st.cumulativePercentage !== null ? `${st.cumulativePercentage}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {st.trendChange !== null ? (
                        st.trendChange > 0 ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +{st.trendChange}%
                          </span>
                        ) : st.trendChange < 0 ? (
                          <span className="text-rose-700 font-medium inline-flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> {st.trendChange}%
                          </span>
                        ) : (
                          <span className="text-slate-500 inline-flex items-center gap-0.5">
                            <Minus className="w-3 h-3" /> 0%
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px]">Baseline</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">{st.assessmentCount}</td>
                    <td className="py-3.5 px-4 text-center text-slate-700">
                      {st.attendancePercentage !== null ? `${st.attendancePercentage}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={st.riskLevel} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/students/${st.studentId}/subjects/${activeAssignment?.subjectId}`
                          )
                        }
                        className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-700 rounded transition-colors"
                      >
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
