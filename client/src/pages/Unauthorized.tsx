import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const { user, getDefaultRouteForRole } = useAuth();
  const defaultPath = user ? getDefaultRouteForRole(user.role) : '/login';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-navy-900">Access Restricted</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
        Your authenticated scope ({user?.role || 'Guest'}) does not have authorization to view this
        academic section. Role-based security prevents cross-scope navigation.
      </p>
      <Link
        to={defaultPath}
        className="mt-6 px-4 py-2 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-800 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Authorized Workspace</span>
      </Link>
    </div>
  );
};
