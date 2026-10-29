import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  Info,
  ChevronRight,
} from 'lucide-react';

export const FamilyNomineesView: React.FC = () => {
  const {
    policies,
    familyMembers,
    navigate,
    setSelectedPolicyId,
  } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Family Nominees & Beneficiary Designations
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Nominee Register
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verify registered beneficiaries across all family life, health, accidental, and banking policies to prevent claim settlement disputes.
        </p>
      </div>

      {/* Legal & Entitlement Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Legal Notice:</strong> A biological or marital family relationship does not automatically confer nominee rights. In Indian Insurance Law (Insurance Act Section 39), beneficial nominees must be explicitly registered on the insurer's records. Always ensure shares across each policy equal exactly 100%.
        </p>
      </div>

      {/* Policies & Nominee Breakdown List */}
      <div className="space-y-4">
        {policies.map((policy) => {
          const member = familyMembers.find((m) => m.id === policy.familyMemberId);
          const totalShares = (policy.nominees || []).reduce(
            (sum, n) => sum + (n.sharePercentage || 0),
            0
          );
          const isShare100 = totalShares === 100;
          const hasNominees = policy.nominees && policy.nominees.length > 0;

          return (
            <div
              key={policy.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      {policy.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {policy.policyName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Insurer: {policy.insurerName}</span>
                    <span>•</span>
                    <span>Policyholder: {policy.policyholderName}</span>
                    <span>•</span>
                    <span>Covered: {member?.fullName || policy.insuredMemberName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!hasNominees ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      No Nominees Recorded
                    </span>
                  ) : !isShare100 ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Shares Total {totalShares}% (Must Equal 100%)
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      100% Share Verified
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy.id);
                      navigate('policy_detail', policy.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="View Policy"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nominees Grid */}
              {hasNominees ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {policy.nominees.map((nom, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                          {nom.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{nom.name}</div>
                          <div className="text-[11px] text-slate-500">{nom.relationship}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-teal-600 dark:text-teal-400">
                          {nom.sharePercentage}%
                        </div>
                        <span className="text-[9px] uppercase font-bold text-slate-400">Share</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 flex items-center justify-between">
                  <span>No nominee records attached. Upload policy endorsement to update.</span>
                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy.id);
                      navigate('policy_detail', policy.id);
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Update Policy Nominee &rarr;
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
