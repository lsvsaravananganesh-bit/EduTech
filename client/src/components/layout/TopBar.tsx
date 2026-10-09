import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { Bell, Menu, Calendar, Check, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.notifications.getAll();
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        // Silent catch for background notification poll
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-[#0B0E19] border-b border-slate-200 dark:border-[#272D40] flex items-center justify-between px-6 shrink-0 relative z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400" />
          <span className="font-semibold text-navy-900 dark:text-slate-200">AY 2024–2025</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-600 dark:text-slate-400">Term 1 (Fall)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-500 hover:text-navy-900 rounded hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] border border-border dark:border-slate-700 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-border dark:border-slate-700/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-900 dark:text-white">Notifications</span>
                <span className="text-[11px] text-seagreen-600 dark:text-seagreen-400 font-semibold">
                  {unreadCount} new
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/60 dark:divide-slate-700/60">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 dark:text-slate-500 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !n.readAt ? 'bg-seagreen-50/40 dark:bg-seagreen-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-navy-900 dark:text-white">{n.title}</h4>
                        {!n.readAt && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            title="Mark as read"
                            className="text-seagreen-600 dark:text-seagreen-400 hover:text-seagreen-700 p-0.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-normal">{n.message}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Pill */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs border-l border-border dark:border-slate-800 pl-4">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-lavender-500 via-pinkpurple-500 to-skyblue-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="font-semibold text-navy-900 dark:text-slate-200">{user?.fullName}</span>
        </div>
      </div>
    </header>
  );
};
