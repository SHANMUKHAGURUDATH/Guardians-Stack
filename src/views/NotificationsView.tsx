import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  FileCheck2,
  Trash2,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigate,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter(
    (n) => filterType === 'all' || (filterType === 'unread' ? !n.read : n.type === filterType)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Notifications & Alerts Center
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System reminders for premium due dates, verification requests, and document cryptographic checks.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 text-xs font-semibold no-scrollbar">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'upcoming_premium', label: 'Upcoming Premiums' },
          { id: 'awaiting_verification', label: 'Payment Verifications' },
          { id: 'document_processed', label: 'Vault Integrity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No notifications to display
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You are completely caught up with all family premium schedules and document verification reviews.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                navigate(item.targetView as any, item.relatedEntity?.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.read
                  ? 'bg-white dark:bg-[#0E1322] border-teal-500/40 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    item.type === 'upcoming_premium'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                      : item.type === 'awaiting_verification'
                      ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600'
                      : 'bg-teal-100 dark:bg-teal-950/60 text-teal-600'
                  }`}
                >
                  {item.type === 'upcoming_premium' ? (
                    <Clock className="w-5 h-5" />
                  ) : item.type === 'awaiting_verification' ? (
                    <FileCheck2 className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(item.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 shrink-0">
                <span>View &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
