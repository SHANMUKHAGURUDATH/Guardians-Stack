import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Bell,
  Lock,
  Download,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Database,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    language,
    setLanguage,
    familyMembers,
    policies,
    documents,
    medicalRecords,
    payments,
    signOut,
  } = useApp();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserPush, setBrowserPush] = useState(false);
  const [retentionDays, setRetentionDays] = useState('forever');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportAllData = () => {
    const fullBackup = {
      user,
      familyMembers,
      policies,
      documents: documents.map((d) => ({
        ...d,
        dataUrl: undefined, // exclude large base64 from export for cleaner download
      })),
      medicalRecords,
      payments,
      exportedAt: new Date().toISOString(),
      platform: 'Guardian Stack v1.0',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GuardianStack_FullBackup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Complete family workspace JSON archive successfully downloaded.');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to completely erase your Guardian Stack family vault? All stored policies, medical records, and cryptographic hashes will be permanently removed.'
    );
    if (confirmed) {
      localStorage.clear();
      signOut();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Settings & Privacy Controls
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Privacy First
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, theme, regional language preferences, cryptographic backup export, and data retention policies.
        </p>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Profile & Identity Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-teal-500" />
          <span>Family Administrator Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Display Name</label>
            <div className="font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {user?.displayName || 'Family Administrator'}
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Authenticated Email</label>
            <div className="font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {user?.email || 'admin@example.com'}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card: Theme & Language */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-500" />
          <span>Theme & Language Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Theme selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Interface Theme</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Toggle Dark / Light appearance</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Regional Language */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">AI & UI Language</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Answers & documents assistant</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer focus:outline-none"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Channels Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Notification & Scheduled Reminder Channels</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Email Premium Reminders
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Send 30d, 14d, 7d, and due date alerts to {user?.email}
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Browser Push Notifications
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Immediate browser alerts for urgent verification requests and due today obligations
              </div>
            </div>
            <input
              type="checkbox"
              checked={browserPush}
              onChange={(e) => setBrowserPush(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Data Export & Account Destruction Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Data Portability & Account Erasure</span>
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          In compliance with user data control principles, you can export your entire structured family records into an open JSON format at any time, or permanently erase your workspace.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportAllData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Vault Backup (JSON)</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/40 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Permanently Delete Family Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
