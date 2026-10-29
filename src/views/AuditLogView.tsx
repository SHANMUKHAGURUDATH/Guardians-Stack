import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Lock,
  Download,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GuardianStack_AuditLog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Activity & Security Audit Log
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cryptographic ledger tracking authentication, document ingestion hashes, SHA-256 verification checks, and payment reviewer decisions.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Audit Events List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  {log.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : log.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {log.action}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {log.targetEntity}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {log.details}
              </p>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50">
                <span>Actor: <strong className="text-slate-600 dark:text-slate-300">{log.actorEmail}</strong></span>
                <span>Session: {log.ipOrLocation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
