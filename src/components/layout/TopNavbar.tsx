import React, { useState, useRef, useEffect } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { GuardianShieldLogo } from '../brand/GuardianShieldLogo';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  AlertTriangle,
  LogOut,
  ChevronDown,
  FileCheck2,
  Lock,
  Sparkles,
} from 'lucide-react';

const VIEW_TITLES: Record<AppView, string> = {
  overview: 'Family Protection Overview',
  family_members: 'Family Members',
  member_detail: 'Family Member Workspace',
  policies: 'Insurance Policies',
  policy_detail: 'Policy Details & Evidence',
  add_policy: 'Add Policy & Document Review',
  document_vault: 'Secure Document Vault',
  document_detail: 'Document Inspection & SHA-256',
  medical_passport: 'Medical Passport',
  add_medical_record: 'Add Medical Record',
  coverage_analysis: 'Family Protection Intelligence',
  needs_finder: 'Life Insurance Needs Finder & HLV Advisory',
  nominees: 'Nominees & Beneficiaries',
  calendar: 'Premium Calendar & Reminders',
  payment_history: 'Payment Timeline & Evidence',
  record_payment: 'Record Premium Payment (Step 1)',
  payment_verification: 'Payment Verification Desk (Step 2)',
  ask_ai: 'Ask AI — Direct Document Intelligence',
  emergency_sos: 'Emergency Mode & Hospital Locator',
  notifications: 'Notification Center',
  audit_log: 'Activity & Cryptographic Audit Log',
  settings: 'Settings & Privacy Controls',
  help_support: 'Architecture & Deployment Guide',
  system_tests: 'System & Security Test Suite',
};

export const TopNavbar: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    language,
    setLanguage,
    signOut,
    activeView,
    navigate,
    isDrawerOpen,
    setIsDrawerOpen,
    isDemoMode,
    exitDemoMode,
    notifications,
    markNotificationAsRead,
    payments,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingPaymentsCount = payments.filter((p) => p.verificationStatus === 'awaiting_verification').length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/90 dark:bg-[#0A0E1A]/90 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-colors">
      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900 uppercase tracking-wider">
              Demo Mode
            </span>
            <span>Displaying fictional sample family data (Father, Mother, 2 Sons). Records are strictly isolated.</span>
          </div>
          <button
            onClick={exitDemoMode}
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Exit Demo Mode &rarr;
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: 3-line Hamburger Menu + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('overview')}
            className="text-left cursor-pointer focus:outline-none"
          >
            <GuardianShieldLogo size={32} showTagline={false} />
          </button>

          {/* Contextual Breadcrumb (desktop) */}
          <div className="hidden lg:flex items-center pl-4 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
              Guardian Stack
            </span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {VIEW_TITLES[activeView] || 'Overview'}
            </span>
          </div>
        </div>

        {/* Right Section: Actions, SOS, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Payment Verification Badge (if any pending) */}
          {pendingPaymentsCount > 0 && (
            <button
              onClick={() => navigate('payment_verification')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors cursor-pointer"
              title="Payments awaiting verification review"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{pendingPaymentsCount} Review Pending</span>
            </button>
          )}

          {/* EMERGENCY MODE SOS BUTTON (Prominent) */}
          <button
            onClick={() => navigate('emergency_sos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-900/30 transition-all cursor-pointer animate-pulse"
            aria-label="Open Emergency Mode"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="tracking-wide">SOS EMERGENCY</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0A0E1A]">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('notifications');
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          setIsNotifOpen(false);
                          navigate(notif.targetView as AppView, notif.relatedEntity?.id);
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {user?.displayName ? user.displayName.slice(0, 2) : 'GS'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 text-xs z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.displayName}</p>
                  <p className="text-slate-400 truncate text-[11px]">{user?.email}</p>
                  <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {user?.role === 'family_admin' ? 'Family Administrator' : 'Authorized Member'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('settings');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Security & Sharing</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('system_tests');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    <span>Run System & Security Tests</span>
                  </button>
                </div>

                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500">
                  <span>Language</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
