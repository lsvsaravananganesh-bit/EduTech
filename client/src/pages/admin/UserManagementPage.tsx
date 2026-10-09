import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profileDetail: string;
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    setUpdatingId(user.id);
    try {
      const res = await api.admin.toggleUserStatus(user.id, !user.isActive);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
        setNotification(
          `User account "${user.fullName}" is now ${!user.isActive ? 'Active' : 'Deactivated'}.`
        );
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CLASS_TEACHER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SUBJECT_TEACHER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STUDENT':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <span>/</span>
            <span>User & Access Control</span>
          </div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Institutional User & Role Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated accounts, inspect assignments, and toggle active status across Students, Faculty, and Administrators.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-border text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh List</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-border focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded border border-border px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="STUDENT">Students</option>
            <option value="SUBJECT_TEACHER">Subject Teachers</option>
            <option value="CLASS_TEACHER">Class Teachers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-xs text-slate-500">
            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Loading user registry...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No users match the selected query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">User Name</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Assignment / Cohort</th>
                  <th className="py-2.5 px-4">Account Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-navy-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {u.fullName.charAt(0)}
                        </div>
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.profileDetail}</td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingId === u.id}
                        className={`text-[11px] px-2.5 py-1 rounded font-medium border transition-colors ${
                          u.isActive
                            ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {updatingId === u.id
                          ? 'Updating...'
                          : u.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
