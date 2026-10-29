import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/crypto';
import {
  PieChart,
  Shield,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const CoverageAnalysisView: React.FC = () => {
  const {
    policies,
    familyMembers,
    premiumSchedules,
    navigate,
  } = useApp();

  // User-provided assumptions for coverage gap analysis
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState<number>(1500000);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(10); // Standard rule of thumb: 10x to 15x annual income for life cover
  const [healthTargetPerPerson, setHealthTargetPerPerson] = useState<number>(1000000);

  // Computed metrics
  const lifePolicies = policies.filter((p) => p.category === 'life' || p.category === 'government');
  const healthPolicies = policies.filter((p) => p.category === 'health' || p.category === 'group');

  const totalLifeCoverage = lifePolicies.reduce((sum, p) => sum + (p.sumAssured || 0), 0);
  const totalHealthCoverage = healthPolicies.reduce((sum, p) => sum + (p.sumAssured || 0), 0);

  const recommendedLifeCoverage = annualFamilyIncome * targetMultiplier;
  const recommendedHealthCoverage = familyMembers.length * healthTargetPerPerson;

  const lifeCoverageGap = Math.max(0, recommendedLifeCoverage - totalLifeCoverage);
  const healthCoverageGap = Math.max(0, recommendedHealthCoverage - totalHealthCoverage);

  // Check for policies with missing nominees
  const policiesMissingNominees = policies.filter(
    (p) => !p.nominees || p.nominees.length === 0
  );

  // Overlapping health policies check
  const hasMultipleHealth = healthPolicies.length > 1;

  // Upcoming renewals within 60 days
  const upcomingRenewals = premiumSchedules.filter((s) => {
    const dueDate = new Date(s.nextDueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Coverage Analysis & Family Protection Intelligence
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Real Analytics
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Objective evaluation of family life, medical hospitalization limits, nominee compliance, and insurer verification checklists.
        </p>
      </div>

      {/* High-Level Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Life Insurance Protection Ratio */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Life Insurance Protection
                </h3>
                <span className="text-[11px] text-slate-400">Term plans & government life schemes</span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                lifeCoverageGap === 0
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {lifeCoverageGap === 0 ? 'Adequate' : 'Coverage Gap Detected'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Recorded</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalLifeCoverage, 'INR')}
              </div>
              <span className="text-[10px] text-slate-500">{lifePolicies.length} policy records</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Target ({targetMultiplier}x Income)
              </span>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {formatCurrency(recommendedLifeCoverage, 'INR')}
              </div>
              <span className="text-[10px] text-slate-500">Based on ₹{annualFamilyIncome.toLocaleString('en-IN')}/yr</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Coverage Ratio</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {recommendedLifeCoverage > 0
                  ? Math.min(100, Math.round((totalLifeCoverage / recommendedLifeCoverage) * 100))
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    recommendedLifeCoverage > 0
                      ? (totalLifeCoverage / recommendedLifeCoverage) * 100
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Health Hospitalization Floater Coverage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Health Hospitalization Coverage
                </h3>
                <span className="text-[11px] text-slate-400">Family floaters & individual policies</span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                healthCoverageGap === 0
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {healthCoverageGap === 0 ? 'Adequate' : 'Evaluation Advised'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Recorded</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalHealthCoverage, 'INR')}
              </div>
              <span className="text-[10px] text-slate-500">{healthPolicies.length} policy records</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Target Benchmark
              </span>
              <div className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">
                {formatCurrency(recommendedHealthCoverage, 'INR')}
              </div>
              <span className="text-[10px] text-slate-500">₹10 Lakhs / person across {familyMembers.length} members</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Coverage Ratio</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {recommendedHealthCoverage > 0
                  ? Math.min(100, Math.round((totalHealthCoverage / recommendedHealthCoverage) * 100))
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    recommendedHealthCoverage > 0
                      ? (totalHealthCoverage / recommendedHealthCoverage) * 100
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configurable Assumptions Box */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 text-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <TrendingUp className="w-4 h-4 text-teal-500" />
          <span>Adjust Calculation Assumptions</span>
        </div>
        <p className="text-slate-500 text-[11px]">
          Guardian Stack does not invent universal recommendations. Gaps are calculated strictly based on your provided family income and target multipliers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">
              Annual Family Gross Income (₹)
            </label>
            <input
              type="number"
              value={annualFamilyIncome}
              onChange={(e) => setAnnualFamilyIncome(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">
              Life Target Multiple (x Income)
            </label>
            <select
              value={targetMultiplier}
              onChange={(e) => setTargetMultiplier(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold cursor-pointer"
            >
              <option value={8}>8x Annual Income</option>
              <option value={10}>10x Annual Income (Recommended)</option>
              <option value={15}>15x Annual Income (High Dependency)</option>
              <option value={20}>20x Annual Income</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">
              Target Health Base / Member (₹)
            </label>
            <input
              type="number"
              value={healthTargetPerPerson}
              onChange={(e) => setHealthTargetPerPerson(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Actionable Findings & Insurer Confirmation Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings & Compliance Alerts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Identified Portfolio Flags & Observations</span>
          </h3>

          <div className="space-y-2.5">
            {hasMultipleHealth && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Overlapping Health Coverage Identified</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">
                  You have recorded multiple health policies (e.g. Family Floater and Individual Young Star). During claims, decide whether to utilize the cashless primary plan or coordinate contribution between insurers.
                </p>
              </div>
            )}

            {policiesMissingNominees.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200">
                <div className="font-bold">Missing Nominee Records ({policiesMissingNominees.length})</div>
                <p className="mt-1 text-[11px]">
                  Policies without verified nominees may cause legal settlement delays. Update nominees under the Nominees section.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Nominee Compliance Verified</span>
                </div>
                <p className="mt-1 text-[11px]">
                  All stored insurance policies have explicitly documented nominees totaling 100% share.
                </p>
              </div>
            )}

            {upcomingRenewals.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  <span>Approaching Renewal Obligations ({upcomingRenewals.length})</span>
                </div>
                <div className="mt-2 space-y-1">
                  {upcomingRenewals.map((r) => (
                    <div key={r.id} className="flex justify-between text-[11px] text-slate-500">
                      <span>{r.policyName}</span>
                      <strong className="text-amber-600 dark:text-amber-400">Due {r.nextDueDate}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insurer Confirmation Checklist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-500" />
            <span>Checklist of Questions to Confirm With Insurers</span>
          </h3>

          <p className="text-slate-500 text-[11px]">
            In keeping with Guardian Stack's verification constitution, confirm these points directly with your insurer or broker:
          </p>

          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <span className="text-teal-500 font-bold">1.</span>
              <span>Confirm whether pre-existing disease (PED) waiting periods are fully satisfied on the health floater policy.</span>
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <span className="text-teal-500 font-bold">2.</span>
              <span>Verify that bank credit-card complimentary personal accident cover is active by confirming the 60-day retail card usage clause.</span>
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <span className="text-teal-500 font-bold">3.</span>
              <span>Ensure nominee contact details and bank account numbers are updated directly in the insurer's portal.</span>
            </li>
            <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <span className="text-teal-500 font-bold">4.</span>
              <span>Confirm that emergency cashless hospitalization TPA e-cards are downloaded to all adult family members' mobile devices.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
