import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, maskIdentifier } from '../utils/crypto';
import {
  Shield,
  HeartPulse,
  FolderLock,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
  User,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  Printer,
  ChevronLeft,
  FileCheck2,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const MemberDetailWorkspaceView: React.FC = () => {
  const {
    familyMembers,
    selectedMemberId,
    policies,
    documents,
    medicalRecords,
    premiumSchedules,
    payments,
    navigate,
    setSelectedDocId,
    setSelectedPolicyId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'policies' | 'medical' | 'vault' | 'nominees' | 'payments' | 'summary'
  >('policies');

  const member =
    familyMembers.find((m) => m.id === selectedMemberId) || familyMembers[0];

  if (!member) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0E1322] rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">
          No family member selected
        </h3>
        <button
          onClick={() => navigate('family_members')}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
        >
          View Family Members
        </button>
      </div>
    );
  }

  // Filter records belonging to this member
  const memberPolicies = policies.filter(
    (p) =>
      p.familyMemberId === member.id ||
      p.insuredMemberName?.toLowerCase().includes(member.fullName.toLowerCase())
  );
  const memberDocs = documents.filter((d) => d.familyMemberId === member.id);
  const memberMeds = medicalRecords.filter((m) => m.familyMemberId === member.id);
  const memberSchedules = premiumSchedules.filter((s) => s.familyMemberId === member.id);
  const memberPayments = payments.filter((p) => p.familyMemberId === member.id);

  // Allergies & active meds
  const allergies = memberMeds.filter((m) => m.recordType === 'allergy');
  const medications = memberMeds.filter((m) => m.recordType === 'medication');

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('family_members')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Family Members</span>
        </button>
      </div>

      {/* Member Banner Card */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${member.avatarColor} flex items-center justify-center text-white text-2xl font-black shadow-md`}
          >
            {member.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {member.fullName}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                {member.relationship}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Blood Group: <strong className="text-red-500">{member.bloodGroup}</strong>
              </span>
              <span>•</span>
              <span>DOB: {member.dateOfBirth}</span>
              <span>•</span>
              <span>Gender: {member.gender}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Quick Dial */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Primary Emergency Contact
            </div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {member.emergencyContact.name} ({member.emergencyContact.relationship})
            </div>
            <div className="text-slate-500 text-[11px]">
              {member.emergencyContact.phone}
            </div>
          </div>
          <a
            href={`tel:${member.emergencyContact.phone}`}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
            title="Call Emergency Contact"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'policies'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Insurance Policies ({memberPolicies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('medical')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'medical'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Medical Passport ({memberMeds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vault'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Vault Documents ({memberDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nominees')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'nominees'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Nominees</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Premiums & Payments</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'summary'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Transfer Summary</span>
        </button>
      </div>

      {/* Tab 1: Insurance Policies */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {memberPolicies.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322]">
              <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No insurance policies recorded for this member yet.</p>
              <button
                onClick={() => navigate('add_policy')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs"
              >
                Upload Policy for {member.fullName}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberPolicies.map((pol) => (
                <div
                  key={pol.id}
                  onClick={() => {
                    setSelectedPolicyId(pol.id);
                    navigate('policy_detail', pol.id);
                  }}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {pol.category.toUpperCase()} INSURANCE
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {pol.verificationStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {pol.policyName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pol.insurerName}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-400">Sum Assured</div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(pol.sumAssured, pol.currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Annual Premium</div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(pol.premiumAmount, pol.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Policy #: {pol.maskedNumber}</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        Due: {pol.nextDueDate}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    <span>Inspect Policy & Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Medical Passport */}
      {activeTab === 'medical' && (
        <div className="space-y-6">
          {/* Critical Allergy Alert Section */}
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Explicitly Documented Allergies</span>
            </div>
            {allergies.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No known allergies explicitly recorded for this member in uploaded clinical documents.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {allergies.map((all) => (
                  <div
                    key={all.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-500/20 text-xs"
                  >
                    <div className="font-bold text-red-600 dark:text-red-400">
                      {all.title}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{all.description}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-3">
                      <span>Source: {all.clinicianOrFacility || 'Clinical Record'}</span>
                      <span>Recorded: {all.dateRecorded}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Documented Medications */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-500" />
              <span>Current Documented Medications</span>
            </h3>
            {medications.length === 0 ? (
              <p className="text-xs text-slate-500">No regular active medications documented.</p>
            ) : (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white">{med.title}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        Active Prescribed
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{med.description}</p>
                    <div className="mt-2 text-[10px] text-slate-400">
                      Prescribed by {med.details.doctorName || 'Attending Physician'} • Date:{' '}
                      {med.dateRecorded}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Hospital Visits, Lab Reports, Procedures */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Hospital Visits & Clinical Timeline
            </h3>
            <div className="space-y-3">
              {memberMeds
                .filter((m) => m.recordType !== 'allergy' && m.recordType !== 'medication')
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {rec.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{rec.dateRecorded}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{rec.description}</p>
                    {rec.details.dischargeAdvice && (
                      <div className="mt-2 p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 text-[11px] text-teal-800 dark:text-teal-300">
                        <strong>Advice:</strong> {rec.details.dischargeAdvice}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Vault Documents */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {memberDocs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#0E1322] rounded-2xl border border-slate-200 dark:border-slate-800">
              <FolderLock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No documents stored in vault for this member.</p>
              <button
                onClick={() => navigate('document_vault')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs"
              >
                Upload to Vault
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {memberDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    navigate('document_detail', doc.id);
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {doc.subcategory.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        SHA-256 Verified
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {doc.originalFileName}
                    </p>

                    <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-[10px] font-mono text-slate-500 truncate">
                      SHA256: {doc.sha256Hash.slice(0, 24)}...
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    <span>Inspect Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Nominees */}
      {activeTab === 'nominees' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Documented Nominees for {member.fullName}
          </h3>

          <div className="space-y-3">
            {memberPolicies.map((pol) => (
              <div
                key={pol.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white">{pol.policyName}</div>
                <div className="mt-2 space-y-1">
                  {pol.nominees?.map((nom, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {nom.name} ({nom.relationship})
                      </span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {nom.sharePercentage}% Share
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Premiums & Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Upcoming Premium Schedules
            </h3>
            {memberSchedules.length === 0 ? (
              <p className="text-xs text-slate-500">No premium schedules configured.</p>
            ) : (
              <div className="space-y-2">
                {memberSchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{sch.policyName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Due Date: <strong>{sch.nextDueDate}</strong> (Grace: {sch.gracePeriodDays} days)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(sch.amount, sch.currency)}
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                        {sch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Payment Verification History
            </h3>
            {memberPayments.length === 0 ? (
              <p className="text-xs text-slate-500">No payments submitted yet for this member.</p>
            ) : (
              <div className="space-y-2">
                {memberPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{pay.policyName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Date: {pay.paymentDate} • Ref: {pay.transactionRef || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(pay.amountPaid, pay.currency)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pay.verificationStatus === 'verified_by_reviewer'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {pay.verificationStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Hospital Transfer Summary */}
      {activeTab === 'summary' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
                Official Clinical Emergency Compilation
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Hospital-Transfer Medical Summary
              </h2>
              <p className="text-xs text-slate-500">
                Generated {new Date().toLocaleDateString()} for patient transfer or emergency consultation.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold cursor-pointer hover:opacity-90"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs">
            <div>
              <span className="text-slate-400">Patient:</span>
              <div className="font-bold text-slate-900 dark:text-white">{member.fullName}</div>
            </div>
            <div>
              <span className="text-slate-400">Blood Group:</span>
              <div className="font-bold text-red-600 dark:text-red-400">{member.bloodGroup}</div>
            </div>
            <div>
              <span className="text-slate-400">Date of Birth:</span>
              <div className="font-bold text-slate-900 dark:text-white">{member.dateOfBirth}</div>
            </div>
            <div>
              <span className="text-slate-400">Emergency Phone:</span>
              <div className="font-bold text-slate-900 dark:text-white">
                {member.emergencyContact.phone}
              </div>
            </div>
          </div>

          {/* Allergies Notice */}
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-xs">
            <div className="font-bold text-red-600 dark:text-red-400 mb-1">
              Documented Allergies & Contraindications:
            </div>
            {allergies.length === 0 ? (
              <span className="text-slate-600 dark:text-slate-400">No allergies on record.</span>
            ) : (
              allergies.map((a) => (
                <div key={a.id} className="font-semibold text-slate-800 dark:text-slate-200">
                  • {a.title}: {a.description}
                </div>
              ))
            )}
          </div>

          {/* Active Medications */}
          <div className="text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white">
              Active Prescribed Medications:
            </div>
            {medications.length === 0 ? (
              <span className="text-slate-500">None on record.</span>
            ) : (
              medications.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.title}</span> —{' '}
                  <span className="text-slate-600 dark:text-slate-400">{m.description}</span>
                </div>
              ))
            )}
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-500 leading-relaxed border border-slate-200 dark:border-slate-800">
            <strong>Legal & Medical Disclaimer:</strong> This document compiles user-stored records and hospital discharge notes as uploaded to Guardian Stack. It is not an independent clinical diagnosis and must be evaluated by licensed medical personnel before administering treatment.
          </div>
        </div>
      )}
    </div>
  );
};
