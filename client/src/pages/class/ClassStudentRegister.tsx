import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ClassStudentRegisterItem, RiskLevel } from '../../types';
import { Search, ArrowUpDown, ShieldAlert, ArrowRight } from 'lucide-react';

export const ClassStudentRegister: React.FC = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<ClassStudentRegisterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'percentage' | 'attendance' | 'risk'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    loadClasses()
  }, []);

  useEffect(() => {
    async function loadStudents() {
      if (!selectedClassId) return;
      setLoading(true);
      try {
        const res = await api.classTeacher.getClassStudents(selectedClassId);
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
  }, [selectedClassId]);

  const filteredStudents = students
    .filter((st) => {
      const matchSearch =
        st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = riskFilter === 'ALL' || st.riskLevel === riskFilter;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.studentName.localeCompare(b.studentName)
          : b.studentName.localeCompare(a.studentName);
      }
      if (sortBy === 'percentage') {
        const pA = a.overallPercentage ?? -1;
        const pB = b.overallPercentage ?? -1;
        return sortOrder === 'asc' ? pA - pB : pB - pA;
      }
      if (sortBy === 'attendance') {
        const aA = a.overallAttendancePercentage ?? -1;
        const aB = b.overallAttendancePercentage ?? -1;
        return sortOrder === 'asc' ? aA - aB : aB - aA;
      }
      if (sortBy === 'risk') {
        const p: Record<RiskLevel, number> = {
          HIGH_CONCERN: 3,
          HIGH_PRIORITY_SUPPORT: 3,
          NEEDS_ATTENTION: 2,
          LOW_CONCERN: 1,
          ON_TRACK: 1,
        };
        const rA = p[a.riskLevel] || 0;
        const rB = p[b.riskLevel] || 0;
        return sortOrder === 'asc' ? rA - rB : rB - rA;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Class Student Performance Register</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Holistic cross-course tracking, attendance monitoring, and intervention statuses for assigned class
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="font-medium text-slate-700">Assigned Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-medium text-navy-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - Section {c.section} ({c.academicYear})
              </option>
            ))}
          </select>
        </div>

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
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSortBy('percentage');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-navy-900 ml-auto"
                  >
                    <span>Overall Average</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      setSortBy('attendance');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-navy-900 mx-auto"
                  >
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Subject Overview Matrix</th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      setSortBy('risk');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-navy-900"
                  >
                    <span>Standing Flag</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Latest Intervention</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading student register...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-navy-900">
                      <div>{st.studentName}</div>
                      <div className="text-[11px] text-slate-400">{st.studentNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-navy-900">
                      {st.overallPercentage !== null ? `${st.overallPercentage}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 font-medium">
                      {st.overallAttendancePercentage !== null ? (
                        <span
                          className={
                            st.overallAttendancePercentage < 75
                              ? 'text-rose-700 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {st.overallAttendancePercentage}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {st.subjectSummaries?.map((sub: any) => (
                          <span
                            key={sub.subjectId}
                            title={`${sub.subjectName}: ${sub.percentage ?? 'N/A'}%`}
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              sub.riskLevel === 'HIGH_CONCERN'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : sub.riskLevel === 'NEEDS_ATTENTION'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {sub.subjectName.split(' ')[0]}: {sub.percentage ?? '—'}%
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={st.riskLevel} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {st.lastInterventionDate ? (
                        <div>
                          <span className="font-medium text-teal-800 text-[11px] block">
                            {st.latestInterventionStatus}
                          </span>
                          <span className="text-[10px] text-slate-400">{st.lastInterventionDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate(`/class/students/${st.studentId}`)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-700 rounded transition-colors"
                      >
                        Inspect Overview
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
