import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CalendarCheck,
  Target,
  UserCheck,
  Users,
  Award,
  BarChart3,
  ShieldAlert,
  Flame,
  Sparkles,
  Database,
  Sliders,
  LogOut,
  GraduationCap,
  Volume2,
  Briefcase,
  Mic,
  Code2,
  Globe,
} from 'lucide-react';

import { ThemeToggle } from '../common/ThemeToggle';

interface SidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const studentLinks: NavItem[] = [
    { to: '/student/dashboard', label: 'Student Home', icon: LayoutDashboard },
    { to: '/student/boloclass', label: 'BoloClass AI Classroom', icon: Volume2, badge: '🎙️ Voice', badgeColor: 'bg-pinkpurple-50 dark:bg-pinkpurple-950/80 text-pinkpurple-700 dark:text-pinkpurple-300 border-pinkpurple-200 dark:border-pinkpurple-700/60' },
    { to: '/student/streak', label: 'Streak Journey', icon: Flame, badge: '🔥 Habit', badgeColor: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/60' },
    { to: '/student/companion', label: 'SmartBro AI Friend', icon: Sparkles, badge: 'AI', badgeColor: 'bg-lavender-50 dark:bg-lavender-950/80 text-lavender-700 dark:text-lavender-300 border-lavender-200 dark:border-lavender-700/60' },
    { to: '/student/subjects', label: 'Subject Performance', icon: BookOpen },
    { to: '/student/assessments', label: 'Assessment History', icon: FileText },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/student/plans', label: 'Feedback & Plans', icon: Target },
    { to: '/student/profile', label: 'Student Profile', icon: UserCheck },
  ];

  const subjectTeacherLinks: NavItem[] = [
    { to: '/teacher/dashboard', label: 'Subject Overview', icon: LayoutDashboard },
    { to: '/teacher/register', label: 'Student Register', icon: Users },
    { to: '/teacher/assessments', label: 'Assessments & Marks', icon: Award },
  ];

  const classTeacherLinks: NavItem[] = [
    { to: '/class/dashboard', label: 'Class Overview', icon: LayoutDashboard },
    { to: '/class/register', label: 'Class Register', icon: Users },
    { to: '/class/cross-subject', label: 'Cross-Subject Analysis', icon: BarChart3 },
    { to: '/class/interventions', label: 'Interventions', icon: ShieldAlert },
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin/dashboard', label: 'Admin Intelligence', icon: LayoutDashboard },
    { to: '/admin/datasets', label: 'Datasets & Factor EDA', icon: Database, badge: 'Kaggle', badgeColor: 'bg-seagreen-950/80 text-seagreen-300 border-seagreen-700/60' },
    { to: '/admin/users', label: 'User & Role Management', icon: Users },
    { to: '/admin/config', label: 'Risk Thresholds Config', icon: Sliders },
  ];

  const navLinks =
    user.role === 'STUDENT'
      ? studentLinks
      : user.role === 'ADMIN'
      ? adminLinks
      : user.role === 'CLASS_TEACHER'
      ? classTeacherLinks
      : subjectTeacherLinks;

  const roleTheme = {
    STUDENT: { label: 'Student Portal', tag: 'bg-seagreen-950/80 text-seagreen-300 border-seagreen-700/60' },
    SUBJECT_TEACHER: { label: 'Subject Faculty', tag: 'bg-skyblue-950/80 text-skyblue-300 border-skyblue-700/60' },
    CLASS_TEACHER: { label: 'Class Faculty', tag: 'bg-lavender-950/80 text-lavender-300 border-lavender-700/60' },
    TEACHER: { label: 'Academic Faculty', tag: 'bg-slate-800 text-slate-300 border-slate-700' },
    ADMIN: { label: 'System Admin', tag: 'bg-pinkpurple-950/80 text-pinkpurple-300 border-pinkpurple-700/60' },
  }[user.role] || { label: user.role, tag: 'bg-slate-800 text-slate-300 border-slate-700' };

  return (
    <aside className="w-64 bg-white dark:bg-[#0B0E19] text-slate-700 dark:text-[#F7F7FA] flex flex-col shrink-0 h-screen border-r border-slate-200 dark:border-[#272D40] shadow-sm select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-[#272D40]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender-500 via-pinkpurple-500 to-seagreen-500 flex items-center justify-center text-white shadow-glow-pinkpurple/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-navy-900 dark:text-white tracking-tight">SmartBro</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-pinkpurple-600 dark:text-pinkpurple-300 bg-pinkpurple-50 dark:bg-pinkpurple-950/90 px-1.5 py-0.2 rounded border border-pinkpurple-200 dark:border-pinkpurple-700/70">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-none mt-0.5">
              Student Success Intelligence
            </p>
          </div>
        </div>

        {/* Role Pill */}
        <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#101421] border border-slate-200 dark:border-[#272D40] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Workspace</span>
          <span className={`text-[11px] font-semibold px-2 py-0.2 rounded border ${roleTheme.tag}`}>
            {roleTheme.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          {user.role === 'STUDENT' ? 'Learning Space' : 'Academic Workspace'}
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-seagreen-600 via-seagreen-700 to-teal-800 text-white font-semibold shadow-xs shadow-seagreen-950/60'
                    : 'text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#161B2B] hover:text-navy-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-navy-900 dark:group-hover:text-white transition-colors" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor || 'bg-slate-100 dark:bg-[#161B2B] text-seagreen-600 dark:text-seagreen-300 border-seagreen-200 dark:border-seagreen-800/50'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Theme Toggle Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-[#272D40] bg-slate-50/70 dark:bg-[#06080F]/60">
        <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white dark:bg-[#101421] border border-slate-200 dark:border-[#272D40]/80 shadow-2xs">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-navy-900 dark:text-white truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
