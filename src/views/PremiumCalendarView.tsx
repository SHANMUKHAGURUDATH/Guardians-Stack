import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/crypto';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  CreditCard,
  Bell,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const PremiumCalendarView: React.FC = () => {
  const {
    premiumSchedules,
    familyMembers,
    policies,
    navigate,
    setSelectedPolicyId,
  } = useApp();

  const [filterMemberId, setFilterMemberId] = useState('all');

  const filteredSchedules = premiumSchedules.filter(
    (s) => filterMemberId === 'all' || s.familyMemberId === filterMemberId
  );

  // Categorize schedules
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const overdueList = filteredSchedules.filter((s) => s.nextDueDate < todayStr);
  const dueTodayList = filteredSchedules.filter((s) => s.nextDueDate === todayStr);
  const upcomingList = filteredSchedules.filter((s) => s.nextDueDate > todayStr);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Premium Calendar & Scheduled Reminders
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {filteredSchedules.length} Obligations
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated calendar for upcoming family insurance obligations with 30-day, 14-day, 7-day, and due date alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Family Members</option>
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.relationship})
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate('record_payment')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Upcoming In Next 60 Days
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {upcomingList.length} Payments
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Due Today
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {dueTodayList.length} Obligations
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overdue Obligations
            </span>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
              {overdueList.length} Overdue
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueList.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-900 dark:text-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Overdue Payment Notice</div>
            <p className="mt-0.5 text-slate-700 dark:text-slate-300">
              {overdueList.length} policy premium obligation is past its scheduled due date. Verify grace period days to avoid policy lapse or loss of continuity benefits.
            </p>
          </div>
        </div>
      )}

      {/* Timeline Schedule Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Scheduled Premium Timeline</span>
        </h2>

        {filteredSchedules.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No premium schedules recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => {
              const member = familyMembers.find((m) => m.id === schedule.familyMemberId);
              const isOverdue = schedule.nextDueDate < todayStr;
              const isToday = schedule.nextDueDate === todayStr;

              return (
                <div
                  key={schedule.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                        isOverdue
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-500/30'
                          : isToday
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold">
                        {new Date(schedule.nextDueDate).toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="text-base font-black">
                        {new Date(schedule.nextDueDate).getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {schedule.policyName}
                        </h3>
                        {isOverdue && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                            Overdue
                          </span>
                        )}
                        {isToday && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            Due Today
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Insurer: {schedule.insurerName}</span>
                        <span>•</span>
                        <span>Member: <strong>{member?.fullName}</strong></span>
                        <span>•</span>
                        <span>Frequency: {schedule.frequency}</span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Bell className="w-3 h-3 text-teal-500" />
                        <span>
                          Configured Reminders: 30d, 14d, 7d, 3d, & on due date (Grace: {schedule.gracePeriodDays} days)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(schedule.amount, schedule.currency)}
                      </div>
                      <span className="text-[10px] text-slate-400">Scheduled Premium</span>
                    </div>

                    <button
                      onClick={() => navigate('record_payment')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Submit Payment Proof</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
