import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Flame,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface LoginProps {
  defaultTab?: 'signin' | 'signup';
}

export const Login: React.FC<LoginProps> = ({ defaultTab = 'signin' }) => {
  const { login, signup, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from prop or query parameter
  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get('tab') as 'signin' | 'signup') || defaultTab;
  const initialRoleParam = searchParams.get('role') as Role | null;

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Sign In States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(
    initialRoleParam || undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up States
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<Role>('STUDENT');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setActiveTab('signup');
    } else if (searchParams.get('tab') === 'signin') {
      setActiveTab('signin');
    }
  }, [location.search]);

  // Handle Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const authenticatedUser = await login({
        email,
        password,
        role: selectedRole,
      });
      const redirectPath = getDefaultRouteForRole(authenticatedUser.role);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupFullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter your institutional email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newUser = await signup({
        fullName: signupFullName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
      });
      setSuccessMessage('Account created! Entering your workspace...');
      setTimeout(() => {
        const redirectPath = getDefaultRouteForRole(newUser.role);
        navigate(redirectPath);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for demo accounts
  const handleQuickFill = (role: Role, demoEmail: string, demoPass = 'SmartBro123!') => {
    setActiveTab('signin');
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedRole(role);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#0B0F19] flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-pinkpurple-200 dark:selection:bg-pinkpurple-900 transition-colors duration-200">
      {/* Top Header Pill with Return to Home & Theme Toggle */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 px-4 sm:px-0 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-seagreen-700 dark:hover:text-seagreen-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to SmartBro Home</span>
        </Link>

        {/* Top-level Theme Switcher */}
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block group">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender-500 via-pinkpurple-500 to-seagreen-500 flex items-center justify-center text-white shadow-glow-pinkpurple/30 group-hover:scale-105 transition-all mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">SmartBro</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider text-pinkpurple-700 dark:text-pinkpurple-300 bg-pinkpurple-50 dark:bg-pinkpurple-950/70 px-2 py-0.5 rounded-full border border-pinkpurple-200 dark:border-pinkpurple-800/60">
              Intelligence
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Student Success, Early Warning & Academic Habit Platform
          </p>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#111827] py-6 px-6 sm:px-8 rounded-xl border border-lavender-200 dark:border-slate-800 shadow-sm transition-colors">
          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex border-b border-lavender-200 dark:border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                activeTab === 'signin'
                  ? 'border-seagreen-600 text-seagreen-700 dark:text-seagreen-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
                activeTab === 'signup'
                  ? 'border-pinkpurple-600 text-pinkpurple-700 dark:text-pinkpurple-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Create New Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' ? (
            <div>
              {/* Optional Portal Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Portal (Optional)
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(
                    [
                      { role: 'STUDENT', label: '🎓 Student' },
                      { role: 'SUBJECT_TEACHER', label: '📖 Subject Faculty' },
                      { role: 'CLASS_TEACHER', label: '👥 Class Teacher' },
                      { role: 'ADMIN', label: '🛡️ Administrator' },
                    ] as const
                  ).map((tab) => (
                    <button
                      type="button"
                      key={tab.role}
                      onClick={() =>
                        setSelectedRole(selectedRole === tab.role ? undefined : tab.role)
                      }
                      className={`py-1.5 px-2 text-[11px] rounded border transition-colors ${
                        selectedRole === tab.role
                          ? 'border-seagreen-600 bg-seagreen-50 dark:bg-seagreen-950/60 text-seagreen-800 dark:text-seagreen-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@smartbro.demo"
                      required
                      className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-seagreen-600 focus:border-seagreen-600 bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setResetModalOpen(true)}
                      className="text-xs text-seagreen-700 dark:text-seagreen-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="block w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-seagreen-600 focus:border-seagreen-600 bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-seagreen-600 focus:ring-seagreen-600"
                    />
                    <span>Remember on this workstation</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg text-white bg-seagreen-600 hover:bg-seagreen-700 disabled:opacity-50 transition-colors shadow-xs mt-2"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to SmartBro</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Accounts */}
              <div className="mt-5 pt-4 border-t border-lavender-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-seagreen-700 dark:text-seagreen-400" /> Fast 1-Click Demo Credentials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('STUDENT', 'student@smartbro.demo')}
                    className="text-left px-2.5 py-1.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-seagreen-50 dark:hover:bg-seagreen-950/40 border border-slate-200 dark:border-slate-700 hover:border-seagreen-400 transition-colors flex items-center justify-between text-slate-700 dark:text-slate-300"
                  >
                    <div>
                      <strong className="block text-navy-900 dark:text-white">🎓 Student</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">Alex Rivera</span>
                    </div>
                    <span className="text-seagreen-700 dark:text-seagreen-400 font-semibold text-[10px]">Fill ↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('ADMIN', 'admin@smartbro.demo')}
                    className="text-left px-2.5 py-1.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-pinkpurple-50 dark:hover:bg-pinkpurple-950/40 border border-slate-200 dark:border-slate-700 hover:border-pinkpurple-400 transition-colors flex items-center justify-between text-slate-700 dark:text-slate-300"
                  >
                    <div>
                      <strong className="block text-navy-900 dark:text-white">🛡️ Admin</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">System Admin</span>
                    </div>
                    <span className="text-pinkpurple-700 dark:text-pinkpurple-400 font-semibold text-[10px]">Fill ↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickFill('SUBJECT_TEACHER', 'subjectteacher@eduwatch.demo', 'EduWatchDemo123!')
                    }
                    className="text-left px-2.5 py-1.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-skyblue-50 dark:hover:bg-skyblue-950/40 border border-slate-200 dark:border-slate-700 hover:border-skyblue-400 transition-colors flex items-center justify-between text-slate-700 dark:text-slate-300"
                  >
                    <div>
                      <strong className="block text-navy-900 dark:text-white">📖 Subject Faculty</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">Sarah Jenkins</span>
                    </div>
                    <span className="text-skyblue-700 dark:text-skyblue-400 font-semibold text-[10px]">Fill ↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickFill('CLASS_TEACHER', 'classteacher@eduwatch.demo', 'EduWatchDemo123!')
                    }
                    className="text-left px-2.5 py-1.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-lavender-100 dark:hover:bg-lavender-950/40 border border-slate-200 dark:border-slate-700 hover:border-lavender-400 transition-colors flex items-center justify-between text-slate-700 dark:text-slate-300"
                  >
                    <div>
                      <strong className="block text-navy-900 dark:text-white">👥 Class Teacher</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">David Vance</span>
                    </div>
                    <span className="text-lavender-700 dark:text-lavender-400 font-semibold text-[10px]">Fill ↗</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: SIGN UP */
            <div>
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      placeholder="e.g. Priya Patel"
                      required
                      className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-pinkpurple-600 focus:border-pinkpurple-600 bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. priya@campus.edu"
                      required
                      className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-pinkpurple-600 focus:border-pinkpurple-600 bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password (Min. 6 Characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create secure password"
                      required
                      className="block w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-pinkpurple-600 focus:border-pinkpurple-600 bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Your Role in Campus
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'STUDENT', label: '🎓 Student' },
                      { role: 'SUBJECT_TEACHER', label: '📖 Subject Faculty' },
                      { role: 'CLASS_TEACHER', label: '👥 Class Teacher' },
                    ].map((r) => (
                      <button
                        type="button"
                        key={r.role}
                        onClick={() => setSignupRole(r.role as Role)}
                        className={`p-2 text-center text-[11px] rounded border transition-colors ${
                          signupRole === r.role
                            ? 'border-pinkpurple-600 bg-pinkpurple-50 dark:bg-pinkpurple-950/60 text-pinkpurple-800 dark:text-pinkpurple-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Students receive automatic Streak Journey and subject enrollment initialization.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg text-white bg-pinkpurple-600 hover:bg-pinkpurple-700 disabled:opacity-50 transition-colors shadow-xs mt-3"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Create Account & Enter Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-lavender-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <button
                  onClick={() => setActiveTab('signin')}
                  className="font-bold text-pinkpurple-700 dark:text-pinkpurple-400 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 max-w-sm w-full border border-lavender-200 dark:border-slate-700 shadow-lg text-navy-900 dark:text-white">
            <h3 className="text-sm font-semibold">Demo Credential Recovery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              In development & evaluation mode, seeded accounts use:
              <br />
              <code className="block mt-1.5 font-mono font-medium text-seagreen-800 dark:text-seagreen-300 bg-seagreen-50 dark:bg-seagreen-950/60 p-1.5 rounded border border-seagreen-200 dark:border-seagreen-800/60 text-center text-xs">
                SmartBro123!
              </code>
              <code className="block mt-1.5 font-mono font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700 text-center text-xs">
                EduWatchDemo123!
              </code>
            </p>
            <button
              onClick={() => setResetModalOpen(false)}
              className="mt-4 w-full py-2 text-xs font-bold rounded-lg bg-seagreen-600 text-white hover:bg-seagreen-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
