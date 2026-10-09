import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Users,
  ShieldAlert,
  Calendar,
  Lock,
  Database,
  BarChart3,
  Award,
  ChevronRight,
  HeartHandshake,
  Sun,
  Moon,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleQuickDemoLogin = async (
    role: Role,
    email: string,
    pass = 'SmartBro123!'
  ) => {
    setDemoLoading(role);
    try {
      const authUser = await login({ email, password: pass, role });
      navigate(getDefaultRouteForRole(authUser.role));
    } catch (err) {
      navigate(`/login?role=${role}`);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-pinkpurple-200 dark:selection:bg-pinkpurple-900 transition-colors duration-200">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-lavender-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lavender-500 via-pinkpurple-500 to-seagreen-500 flex items-center justify-center text-white shadow-glow-pinkpurple/30 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-navy-900 dark:text-white tracking-tight">SmartBro</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pinkpurple-700 dark:text-pinkpurple-300 bg-pinkpurple-50 dark:bg-pinkpurple-950/70 px-2 py-0.5 rounded-full border border-pinkpurple-200 dark:border-pinkpurple-800/60">
                  EdTech Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Student Success Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#solutions" className="hover:text-seagreen-600 dark:hover:text-seagreen-400 transition-colors">
              Role Portals
            </a>
            <a href="#early-warning" className="hover:text-seagreen-600 dark:hover:text-seagreen-400 transition-colors">
              Early Warning Engine
            </a>
            <a href="#streak-journey" className="hover:text-pinkpurple-600 dark:hover:text-pinkpurple-400 transition-colors">
              Streak Habit Journey
            </a>
            <a href="#ai-companion" className="hover:text-lavender-600 dark:hover:text-lavender-400 transition-colors">
              SmartBro AI
            </a>
            <a href="#factor-analytics" className="hover:text-skyblue-600 dark:hover:text-skyblue-400 transition-colors">
              Kaggle Intelligence
            </a>
            <a href="#demo-launcher" className="hover:text-seagreen-600 dark:hover:text-seagreen-400 transition-colors">
              Live Demo
            </a>
          </nav>

          {/* User Auth Action CTAs & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Global Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <Link
                to={getDefaultRouteForRole(user.role)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-seagreen-600 hover:bg-seagreen-700 text-white transition-colors shadow-xs"
              >
                <span>Resume Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg text-navy-900 dark:text-slate-200 hover:text-seagreen-700 dark:hover:text-seagreen-400 hover:bg-lavender-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-seagreen-600 hover:bg-seagreen-700 text-white transition-colors shadow-xs"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-white dark:from-[#0B0F19] via-lavender-50/40 dark:via-[#111827] to-[#FAF8FF] dark:to-[#0B0F19] border-b border-lavender-200 dark:border-slate-800">
        {/* Subtle Decorative Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff_1px,transparent_1px),linear-gradient(to_bottom,#f3e8ff_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 cols: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lavender-100 dark:bg-lavender-950/70 border border-lavender-300 dark:border-lavender-800/80 text-lavender-900 dark:text-lavender-300 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-pinkpurple-500" />
                <span>Track 03 • EdTech: Academic Early Warning & Habit Companion</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight leading-[1.15]">
                Empowering Students.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pinkpurple-500 to-seagreen-600 block sm:inline">
                  Supporting Faculty.
                </span>{' '}
                Catching Academic Hurdles Early.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                SmartBro combines explainable early warning indicators with a supportive, shame-free
                study streak journey and grounded AI companion—giving students confidence and faculty decision clarity.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl text-white bg-seagreen-600 hover:bg-seagreen-700 transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Create Student / Faculty Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#demo-launcher"
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl text-navy-900 dark:text-slate-200 bg-white dark:bg-slate-800 border border-lavender-200 dark:border-slate-700 hover:bg-lavender-50 dark:hover:bg-slate-700 transition-all shadow-2xs flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
                  <span>Launch 1-Click Demo Portals</span>
                </a>
              </div>

              {/* Verified Trust Metrics */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
                  <span>Deterministic Multi-Factor Rules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
                  <span>Zero-Hallucination AI Grounding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
                  <span>Light & Dark Mode Accessible</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Live Interactive Visual Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-lavender-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                {/* Simulated Header */}
                <div className="flex items-center justify-between pb-3 border-b border-lavender-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-lavender-500 to-pinkpurple-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      SB
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-900 dark:text-white">Student Standing Snapshot</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Arjun Sharma • Grade 10-A</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                    ✓ On Track
                  </span>
                </div>

                {/* Score & Attendance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-lavender-50/60 dark:bg-slate-800/70 border border-lavender-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                      Cumulative Average
                    </span>
                    <span className="text-xl font-extrabold text-navy-900 dark:text-white mt-0.5 block">78.4%</span>
                    <span className="text-[10px] text-seagreen-600 dark:text-seagreen-400 font-semibold flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3" /> +4.2% trajectory
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-skyblue-50/60 dark:bg-slate-800/70 border border-skyblue-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                      Class Attendance
                    </span>
                    <span className="text-xl font-extrabold text-navy-900 dark:text-white mt-0.5 block">91.2%</span>
                    <span className="text-[10px] text-skyblue-600 dark:text-skyblue-400 font-semibold mt-0.5 block">
                      Above 75% floor
                    </span>
                  </div>
                </div>

                {/* Streak Journey Snippet */}
                <div className="p-3 rounded-xl bg-pinkpurple-50/60 dark:bg-pinkpurple-950/30 border border-pinkpurple-200 dark:border-pinkpurple-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-pinkpurple-500 text-white flex items-center justify-center shadow-xs">
                      <Flame className="w-4 h-4 fill-white text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-900 dark:text-white">5-Day Habit Streak</div>
                      <div className="text-[10px] text-pinkpurple-800 dark:text-pinkpurple-300 font-medium">145 mins logged this week</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pinkpurple-800 dark:text-pinkpurple-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-pinkpurple-200 dark:border-pinkpurple-700">
                    +15 Pts
                  </span>
                </div>

                {/* Grounded AI Snippet */}
                <div className="p-3 rounded-xl bg-seagreen-50/80 dark:bg-seagreen-950/30 border border-seagreen-200 dark:border-seagreen-800/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-seagreen-900 dark:text-seagreen-300 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400" />
                    <span>SmartBro AI Friend</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-seagreen-950 dark:text-slate-200">
                    "Hey bro! You're solid in Science (82%)! For Math, let's do 1 quick 20-min practice on quadratic roots tonight. Small steps win!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ONE-CLICK DEMO LAUNCHER (DIRECT ACCESS) */}
      <section id="demo-launcher" className="py-16 bg-white dark:bg-[#0E1526] border-b border-lavender-200 dark:border-slate-800 scroll-mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-seagreen-700 dark:text-seagreen-300 bg-seagreen-50 dark:bg-seagreen-950/70 px-3 py-1 rounded-full border border-seagreen-200 dark:border-seagreen-800/60">
              Instant Exploration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight mt-3">
              One-Click Interactive Demo Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              No registration required to test. Click any role below to instantly log in with realistic seeded data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Role 1: Student */}
            <div className="bg-[#FAF8FF] dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-seagreen-400 hover:shadow-xs transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-seagreen-100 dark:bg-seagreen-950/80 text-seagreen-800 dark:text-seagreen-300 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-seagreen-700 dark:text-seagreen-400 uppercase tracking-wider">
                  Role: Student
                </div>
                <h3 className="text-base font-bold text-navy-900 dark:text-white mt-1">Student Portal</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Personal academic standing, transparent risk explanation, streak journey milestones, and grounded AI study partner.
                </p>
                <div className="mt-4 pt-3 border-t border-lavender-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  student@smartbro.demo
                </div>
              </div>

              <button
                onClick={() => handleQuickDemoLogin('STUDENT', 'student@smartbro.demo')}
                disabled={demoLoading !== null}
                className="mt-4 w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-seagreen-600 hover:bg-seagreen-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {demoLoading === 'STUDENT' ? (
                  <span>Entering...</span>
                ) : (
                  <>
                    <span>Enter Student Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Role 2: Subject Teacher */}
            <div className="bg-[#FAF8FF] dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-skyblue-400 hover:shadow-xs transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-skyblue-100 dark:bg-skyblue-950/80 text-skyblue-800 dark:text-skyblue-300 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-skyblue-700 dark:text-skyblue-400 uppercase tracking-wider">
                  Role: Subject Faculty
                </div>
                <h3 className="text-base font-bold text-navy-900 dark:text-white mt-1">Subject Teacher</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Class student register, subject pass/fail flags, assessment marks entry, trend trajectories, and constructive feedback.
                </p>
                <div className="mt-4 pt-3 border-t border-lavender-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  subjectteacher@eduwatch.demo
                </div>
              </div>

              <button
                onClick={() =>
                  handleQuickDemoLogin('SUBJECT_TEACHER', 'subjectteacher@eduwatch.demo', 'EduWatchDemo123!')
                }
                disabled={demoLoading !== null}
                className="mt-4 w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-navy-900 dark:bg-slate-800 hover:bg-navy-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {demoLoading === 'SUBJECT_TEACHER' ? (
                  <span>Entering...</span>
                ) : (
                  <>
                    <span>Enter Subject Faculty</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Role 3: Class Teacher */}
            <div className="bg-[#FAF8FF] dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-lavender-400 hover:shadow-xs transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-lavender-100 dark:bg-lavender-950/80 text-lavender-800 dark:text-lavender-300 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-lavender-700 dark:text-lavender-400 uppercase tracking-wider">
                  Role: Class Mentor
                </div>
                <h3 className="text-base font-bold text-navy-900 dark:text-white mt-1">Class Teacher</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Cross-subject analysis heatmap, overall class attendance, multi-subject risk identification, and structured interventions.
                </p>
                <div className="mt-4 pt-3 border-t border-lavender-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  classteacher@eduwatch.demo
                </div>
              </div>

              <button
                onClick={() =>
                  handleQuickDemoLogin('CLASS_TEACHER', 'classteacher@eduwatch.demo', 'EduWatchDemo123!')
                }
                disabled={demoLoading !== null}
                className="mt-4 w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-navy-900 dark:bg-slate-800 hover:bg-navy-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {demoLoading === 'CLASS_TEACHER' ? (
                  <span>Entering...</span>
                ) : (
                  <>
                    <span>Enter Class Mentor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Role 4: Administrator */}
            <div className="bg-[#FAF8FF] dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-pinkpurple-400 hover:shadow-xs transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pinkpurple-100 dark:bg-pinkpurple-950/80 text-pinkpurple-800 dark:text-pinkpurple-300 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-pinkpurple-700 dark:text-pinkpurple-400 uppercase tracking-wider">
                  Role: Administrator
                </div>
                <h3 className="text-base font-bold text-navy-900 dark:text-white mt-1">System Admin</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Configurable early warning thresholds, Kaggle benchmark CSV ingestion, behavioral factor simulator, and data exports.
                </p>
                <div className="mt-4 pt-3 border-t border-lavender-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  admin@smartbro.demo
                </div>
              </div>

              <button
                onClick={() => handleQuickDemoLogin('ADMIN', 'admin@smartbro.demo')}
                disabled={demoLoading !== null}
                className="mt-4 w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-pinkpurple-600 hover:bg-pinkpurple-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {demoLoading === 'ADMIN' ? (
                  <span>Entering...</span>
                ) : (
                  <>
                    <span>Enter Administrator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR SIGNATURE ARCHITECTURAL CAPABILITIES */}
      <section id="early-warning" className="py-16 bg-[#FAF8FF] dark:bg-[#0B0F19] border-b border-lavender-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-pinkpurple-700 dark:text-pinkpurple-300 bg-pinkpurple-50 dark:bg-pinkpurple-950/70 px-3 py-1 rounded-full border border-pinkpurple-200 dark:border-pinkpurple-800/60">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight mt-3">
              Designed for Early Intervention, Not Penalization
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every feature is built around the fundamental philosophy: catch difficulties early and provide realistic next steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-seagreen-50 dark:bg-seagreen-950/70 text-seagreen-700 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800/60 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">Explainable Early Warnings</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                No mystery scores. Multi-factor deterministic rules evaluate passing floors (40%), attendance (75%), and momentum decline drops.
              </p>
            </div>

            {/* Feature 2 */}
            <div id="streak-journey" className="bg-white dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-6 shadow-2xs space-y-3 scroll-mt-20">
              <div className="w-10 h-10 rounded-xl bg-pinkpurple-50 dark:bg-pinkpurple-950/70 text-pinkpurple-600 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800/60 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">Streak Habit Resilience</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Game-like journey map that encourages daily consistency rather than perfection. Missed days never erase earned milestones.
              </p>
            </div>

            {/* Feature 3 */}
            <div id="ai-companion" className="bg-white dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-6 shadow-2xs space-y-3 scroll-mt-20">
              <div className="w-10 h-10 rounded-xl bg-lavender-100 dark:bg-lavender-950/70 text-lavender-700 dark:text-lavender-300 border border-lavender-200 dark:border-lavender-800/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">Grounded SmartBro AI</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tuned directly to enrolled course records. Provides achievable 3-day recovery micro-plans and supportive concept walkthroughs.
              </p>
            </div>

            {/* Feature 4 */}
            <div id="factor-analytics" className="bg-white dark:bg-[#131B2E] rounded-xl border border-lavender-200 dark:border-slate-800 p-6 shadow-2xs space-y-3 scroll-mt-20">
              <div className="w-10 h-10 rounded-xl bg-skyblue-50 dark:bg-skyblue-950/70 text-skyblue-700 dark:text-skyblue-300 border border-skyblue-200 dark:border-skyblue-800/60 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">Kaggle Factor Intelligence</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Live interactive simulator modeling how weekly study hours, sleep duration, attendance, and motivation drive exam success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BRAND PHILOSOPHY CALLOUT */}
      <section className="py-16 bg-[#0B0F19] text-white relative overflow-hidden border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender-950/60 border border-lavender-500/40 text-lavender-300 text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Supportive Academic Philosophy</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            "Why SmartBro Feels Different"
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Traditional campus management systems feel like surveillance tools that cause anxiety.
            SmartBro is engineered as an honest, calm companion that respects students and helps
            faculty step in before a student falls behind.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 text-xs font-bold rounded-xl text-navy-950 bg-seagreen-400 hover:bg-seagreen-300 transition-colors shadow-xs"
            >
              Sign Up as Student or Faculty
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 text-xs font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white dark:bg-[#0F172A] border-t border-lavender-200 dark:border-slate-800 py-10 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-lavender-500 to-pinkpurple-500 text-white flex items-center justify-center font-bold text-[10px]">
              SB
            </div>
            <span className="font-semibold text-navy-900 dark:text-white">SmartBro</span>
            <span>• Student Success Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-seagreen-600 dark:hover:text-seagreen-400 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-seagreen-600 dark:hover:text-seagreen-400 transition-colors">
              Sign Up
            </Link>
            <a href="#demo-launcher" className="hover:text-seagreen-600 dark:hover:text-seagreen-400 transition-colors">
              Demo Portals
            </a>
            <span className="text-slate-400 dark:text-slate-500">Track 03 • EdTech</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
