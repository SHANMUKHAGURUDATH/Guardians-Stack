import React from 'react';
import {
  HelpCircle,
  Shield,
  Bot,
  Database,
  Lock,
  Server,
  Compass,
  FileCheck2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Architecture, Setup & Deployment Guide
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Technical Specification
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Complete production blueprint for Guardian Stack: Family Insurance, Medical Records & Digital Document Vault.
        </p>
      </div>

      {/* Section 1: Core Architecture & No-RAG Constitution */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            1. Core Architectural Constitution — Absolute No-RAG Rule
          </h2>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Guardian Stack prohibits Retrieval-Augmented Generation (RAG) using synthetic vector databases and chunk embeddings. Instead, it employs a <strong>Direct Bounded Document Ingestion and Verification Architecture</strong>:
        </p>

        <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <li><strong>Stage A — Cryptographic Ingestion:</strong> Files are validated, stored securely in private object storage, and hashed with SHA-256 for byte-exact tamper detection.</li>
          <li><strong>Stage B — Structured Field Extraction:</strong> Insurer name, sum assured, premium schedules, grace periods, and exclusions are parsed by Gemini 3.8 Flash with page and snippet references.</li>
          <li><strong>Stage C — User Confirmation:</strong> No extracted field is marked verified until explicitly confirmed by the family administrator.</li>
          <li><strong>Stage D — Direct Bounded Querying:</strong> When a user asks a question, the exact authorized document text is supplied directly to the model with strict grounding rules preventing hallucinations.</li>
        </ul>
      </div>

      {/* Section 2: Technology Stack */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Server className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            2. Production Technology Stack
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Frontend Architecture</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              React 19 + TypeScript + Vite + Tailwind CSS with Lucide icons. Responsive design supporting desktop, tablet, and mobile browsers with light/dark theme persistence.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Backend & APIs</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Full-stack Express server (`server.ts`) running Vite middleware in dev and static bundle serving in production. Server-side `@google/genai` calls with zero client API key exposure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">AI Models</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Google Gemini (`gemini-3.8-flash`) via the modern `@google/genai` SDK. Telemetry User-Agent configured as `aistudio-build`.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Cryptographic Integrity</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Web Crypto API standard SHA-256 digest computation for uploaded policies and two-step payment screenshots.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Two-Step Payment Verification Workflow */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            3. Two-Step Payment Verification Discipline
          </h2>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          In Guardian Stack, an insurance premium cannot be marked verified by clicking a button:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white">Step 1 — Submit Evidence</div>
            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
              User uploads screenshot / receipt, enters transaction reference and amount. Advisory OCR checks visible details. Hash is generated and status set to "Awaiting verification".
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white">Step 2 — Authorized Review</div>
            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
              Designated family administrator inspects side-by-side evidence, verifies bank statement, and issues approval or rejection with audit history preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Production Deployment Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>4. Production Deployment Checklist</span>
        </h2>

        <div className="space-y-2 text-slate-700 dark:text-slate-300">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>1. Set Environment Variable: <code>GEMINI_API_KEY</code></span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Available</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>2. Build Production Bundle: <code>npm run build</code></span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Configured</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>3. Start Full-Stack Service: <code>npm run start</code></span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Configured</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>4. Google Maps Platform Geocoding / Places Key (Optional)</span>
            <span className="text-slate-400 font-medium">Automatic Fallback Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
