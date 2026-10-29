import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/crypto';
import {
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  UserCheck,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  ChevronLeft,
  CheckCircle2,
  FolderLock,
  CreditCard,
  Bot,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const PolicyDetailView: React.FC = () => {
  const {
    policies,
    selectedPolicyId,
    familyMembers,
    documents,
    navigate,
    setSelectedDocId,
  } = useApp();

  const [showFullNumber, setShowFullNumber] = useState(false);
  const [activeEvidenceField, setActiveEvidenceField] = useState<string | null>(null);

  const policy =
    policies.find((p) => p.id === selectedPolicyId) || policies[0];

  if (!policy) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0E1322] rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">
          No policy selected
        </h3>
        <button
          onClick={() => navigate('policies')}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
        >
          View All Policies
        </button>
      </div>
    );
  }

  const member = familyMembers.find((m) => m.id === policy.familyMemberId);
  const sourceDoc = documents.find((d) => d.id === policy.sourceDocumentId);

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('policies')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Policies</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('record_payment')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => navigate('ask_ai')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI About Policy</span>
          </button>
        </div>
      </div>

      {/* Main Policy Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              {policy.category} INSURANCE
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {policy.verificationStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Policy Number:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
              {showFullNumber ? policy.policyNumber : policy.maskedNumber}
            </span>
            <button
              onClick={() => setShowFullNumber(!showFullNumber)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              title={showFullNumber ? 'Mask number' : 'Show full number'}
            >
              {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {policy.policyName}
          </h1>
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
            {policy.insurerName}
          </p>
        </div>

        {/* Core Financial Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Sum Assured</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(policy.sumAssured, policy.currency)}
            </div>
            {policy.extractedEvidence?.sumAssured && (
              <span className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1">
                <Sparkles className="w-2.5 h-2.5" /> Page {policy.extractedEvidence.sumAssured.page} verified
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">
              Premium ({policy.premiumFrequency})
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(policy.premiumAmount, policy.currency)}
            </div>
            <span className="text-[10px] text-slate-400">Annualized obligation</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Next Due Date</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {policy.nextDueDate}
            </div>
            <span className="text-[10px] text-slate-400">Grace: {policy.gracePeriodDays} days</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Covered Member</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
              {member?.fullName || policy.insuredMemberName}
            </div>
            <span className="text-[10px] text-slate-400">{member?.relationship || 'Family'}</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Policy Details vs Evidence & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comprehensive Terms & Nominees */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policyholder & Nominees */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-500" />
              <span>Policyholder & Nominee Designations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold uppercase">
                  Primary Policyholder
                </span>
                <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {policy.policyholderName}
                </div>
                <div className="text-slate-500 mt-1">Inception: {policy.policyStartDate}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold uppercase">
                  Insured Member(s)
                </span>
                <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                  {policy.insuredMemberName}
                </div>
                <div className="text-slate-500 mt-1">
                  Maturity: {policy.policyEndDate || 'Lifelong / Subject to renewal'}
                </div>
              </div>
            </div>

            {/* Documented Nominees Table */}
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Documented Nominee Allocations
              </div>
              <div className="space-y-2">
                {policy.nominees.map((nom, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{nom.name}</span>
                      <span className="text-slate-400 text-xs ml-2">({nom.relationship})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-teal-600 dark:text-teal-400">
                        {nom.sharePercentage}% Share
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Waiting Periods, Grace Period & Exclusions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Waiting Periods, Grace Period & Key Exclusions</span>
            </h3>

            {/* Grace Period Card with Evidence Snippet */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyan-800 dark:text-cyan-300">
                  Documented Grace Period
                </span>
                <span className="font-black text-sm text-cyan-700 dark:text-cyan-300">
                  {policy.gracePeriodDays} Days
                </span>
              </div>
              {policy.extractedEvidence?.gracePeriod && (
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 italic">
                  "{policy.extractedEvidence.gracePeriod.evidenceSnippet}" (Page{' '}
                  {policy.extractedEvidence.gracePeriod.page})
                </p>
              )}
            </div>

            {/* Waiting Periods */}
            {policy.waitingPeriodText && (
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Waiting Period Terms:
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {policy.waitingPeriodText}
                </p>
              </div>
            )}

            {/* Key Exclusions */}
            {policy.exclusions && policy.exclusions.length > 0 && (
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Important Exclusions (Non-Covered Events):
                </span>
                <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {policy.exclusions.map((exc, i) => (
                    <li key={i}>{exc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Claims, Emergency Helpdesk & Source Document */}
        <div className="space-y-6">
          {/* Claim Procedure & Contacts */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Claims Helpdesk & Cashless TPA</span>
            </h3>

            <div className="space-y-3 text-xs">
              {policy.claimContact.helplinePhone && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Toll-Free Helpline</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {policy.claimContact.helplinePhone}
                    </div>
                  </div>
                  <a
                    href={`tel:${policy.claimContact.helplinePhone}`}
                    className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    Call
                  </a>
                </div>
              )}

              {policy.claimContact.cashlessTPA && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Cashless TPA Desk</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {policy.claimContact.cashlessTPA}
                  </div>
                </div>
              )}

              {policy.claimContact.email && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Claims Email</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {policy.claimContact.email}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source Document Card with SHA-256 Hash */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-teal-500" />
              <span>Source Document & Integrity</span>
            </h3>

            {sourceDoc ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {sourceDoc.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {sourceDoc.originalFileName}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cryptographic SHA-256 Verified</span>
                  </div>
                  <div className="mt-1 font-mono text-[9px] text-slate-500 truncate">
                    {sourceDoc.sha256Hash}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDocId(sourceDoc.id);
                    navigate('document_detail', sourceDoc.id);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Original Document</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Manual entry record. Attach original policy schedule PDF to enable cryptographic SHA-256 verification.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
