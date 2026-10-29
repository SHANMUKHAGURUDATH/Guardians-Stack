import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/crypto';
import {
  Shield,
  HeartPulse,
  FolderLock,
  UserPlus,
  FilePlus,
  CreditCard,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
  Activity,
  FileCheck2,
  Calculator,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    user,
    familyMembers,
    policies,
    documents,
    medicalRecords,
    premiumSchedules,
    payments,
    navigate,
    isDemoMode,
  } = useApp();

  // Calculate statistics from actual records
  const totalPolicies = policies.length;
  const verifiedActivePolicies = policies.filter((p) => p.verificationStatus === 'active_verified').length;

  // Meaningful coverage calculations separated by insurance type
  const lifeCoverageTotal = policies
    .filter((p) => p.category === 'life' || p.category === 'government')
    .reduce((sum, p) => sum + (p.sumAssured || 0), 0);

  const healthCoverageTotal = policies
    .filter((p) => p.category === 'health' || p.category === 'group')
    .reduce((sum, p) => sum + (p.sumAssured || 0), 0);

  const upcomingPremiums = premiumSchedules.filter((s) => s.status === 'upcoming');
  const overduePremiums = premiumSchedules.filter((s) => s.status === 'overdue');
  const paymentsAwaitingReview = payments.filter((p) => p.verificationStatus === 'awaiting_verification');

  // Check incomplete fields across policies (e.g., missing nominee or missing next due date)
  const incompletePolicies = policies.filter(
    (p) => !p.nominees || p.nominees.length === 0 || !p.nextDueDate || !p.gracePeriodDays
  );

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Contextual Header Area & Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0D152A] to-[#0A1F33] p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Family Protection Command Center</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.displayName || 'Family Administrator'}
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {familyMembers.length === 0
              ? 'Your workspace is initialized and ready. Start by adding your family members and importing your insurance or medical records.'
              : `Your vault is protecting ${familyMembers.length} family member${
                  familyMembers.length > 1 ? 's' : ''
                } across ${totalPolicies} insurance ${
                  totalPolicies === 1 ? 'policy' : 'policies'
                } and ${documents.length} verified digital documents.`}
          </p>

          {/* Quick Actions Strip */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('family_members')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-300" />
              <span>Add Family Member</span>
            </button>

            <button
              onClick={() => navigate('add_policy')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-900/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Upload Policy / Doc</span>
            </button>

            <button
              onClick={() => navigate('needs_finder')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-indigo-900/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Life Needs Finder (HLV)</span>
            </button>

            <button
              onClick={() => navigate('add_medical_record')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-300" />
              <span>Add Medical Record</span>
            </button>

            <button
              onClick={() => navigate('record_payment')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
              <span>Record Premium Payment</span>
            </button>

            <button
              onClick={() => navigate('emergency_sos')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Open Emergency SOS</span>
            </button>

            <button
              onClick={() => navigate('ask_ai')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Intelligence</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Central Family Coverage Visualization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Family Protection Portfolio</span>
              <span className="text-xs font-normal text-slate-400">
                (Click any member to open their detailed workspace)
              </span>
            </h2>
          </div>
          <button
            onClick={() => navigate('family_members')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Members</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-[#0B101E]">
            <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No family members added yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Real accounts start completely empty to ensure your family's privacy. Add your first member or launch Demo Mode to explore sample records.
            </p>
            <button
              onClick={() => navigate('family_members')}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-md shadow-teal-900/20 hover:bg-teal-500 transition-all cursor-pointer"
            >
              Add First Family Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {familyMembers.map((member) => {
              const memberPolicies = policies.filter((p) => p.familyMemberId === member.id);
              const memberDocs = documents.filter((d) => d.familyMemberId === member.id);
              const memberMeds = medicalRecords.filter((m) => m.familyMemberId === member.id);
              const memberUpcomingSchedules = premiumSchedules.filter(
                (s) => s.familyMemberId === member.id && s.status === 'upcoming'
              );

              return (
                <div
                  key={member.id}
                  onClick={() => navigate('member_detail', member.id)}
                  className="group relative rounded-2xl p-5 bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Member Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${member.avatarColor} flex items-center justify-center text-white text-base font-extrabold shadow-md group-hover:scale-105 transition-transform`}
                      >
                        {member.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {member.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {member.relationship}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {member.bloodGroup}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Counts Matrix */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-center">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                        <div className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                          {memberPolicies.length}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Policies</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                        <div className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                          {memberDocs.length}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Vault Docs</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                        <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          {memberMeds.length}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Medical</div>
                      </div>
                    </div>

                    {/* Upcoming Obligation Status */}
                    <div className="mt-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Next Premium:</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {memberUpcomingSchedules.length > 0
                            ? memberUpcomingSchedules[0].nextDueDate
                            : 'None due'}
                        </span>
                      </div>

                      {memberUpcomingSchedules.length > 0 && (
                        <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 truncate">
                          ₹{memberUpcomingSchedules[0].amount.toLocaleString('en-IN')} (
                          {memberUpcomingSchedules[0].insurerName})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Action Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                    <span>Open Member Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Dashboard Statistics Computed from Actual Records */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Protection Analytics & Audit Status</span>
          <span className="text-xs font-normal text-slate-400">
            (Strictly computed from actual records)
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Total Policies */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recorded Policies
              </span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalPolicies > 0 ? totalPolicies : 'None added'}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{verifiedActivePolicies} verified active policies</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Life Coverage Total */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Life Insurance Cover
              </span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {lifeCoverageTotal > 0 ? formatCurrency(lifeCoverageTotal, 'INR') : 'Not available'}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Term & Govt life schemes only</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Health Insurance Cover */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Health Floater Cover
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {healthCoverageTotal > 0 ? formatCurrency(healthCoverageTotal, 'INR') : 'Not available'}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Base family hospitalization sum</span>
              </div>
            </div>
          </div>

          {/* Stat 4: Payments Verification Status */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Payment Verification
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {paymentsAwaitingReview.length} Pending
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{upcomingPremiums.length} upcoming premium obligations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Alerts & Disclosures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Incomplete Document Fields Advisory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Document Completeness & Missing Fields</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {incompletePolicies.length} flags
            </span>
          </div>

          {incompletePolicies.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All stored policy records contain complete nominee specifications, premium schedules, and renewal clauses.
            </p>
          ) : (
            <div className="space-y-2">
              {incompletePolicies.slice(0, 3).map((pol) => (
                <div
                  key={pol.id}
                  onClick={() => navigate('policy_detail', pol.id)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {pol.policyName}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {!pol.nominees || pol.nominees.length === 0
                        ? 'Missing documented nominee share details'
                        : 'Missing verified renewal grace period'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cryptographic Vault & Privacy Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-teal-500" />
              <span>Vault Integrity & SHA-256 Assurance</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Zero Tamper
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Every uploaded policy schedule, discharge summary, and payment receipt is cryptographically hashed with SHA-256 upon ingestion. Aadhaar and sensitive identity numbers are masked by default.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">Total Files Hashed:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {documents.length} Documents Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
