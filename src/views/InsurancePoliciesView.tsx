import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PolicyCategory } from '../types';
import { formatCurrency } from '../utils/crypto';
import {
  Shield,
  FilePlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const CATEGORY_TABS: { id: PolicyCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Policies' },
  { id: 'health', label: 'Health' },
  { id: 'life', label: 'Life' },
  { id: 'accident', label: 'Accident' },
  { id: 'banking', label: 'Bank / Card' },
  { id: 'government', label: 'Govt Schemes' },
  { id: 'group', label: 'Group / Corp' },
  { id: 'other', label: 'Other' },
];

export const InsurancePoliciesView: React.FC = () => {
  const {
    policies,
    familyMembers,
    navigate,
    setSelectedPolicyId,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<PolicyCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');

  const filteredPolicies = policies.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesMember = memberFilter === 'all' || p.familyMemberId === memberFilter;
    const matchesSearch =
      !searchQuery ||
      p.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.insurerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMember && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Insurance Policy Portfolio
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {policies.length} Policies
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Consolidated view of family life, health, accident, bank-linked, and government scheme policies.
          </p>
        </div>

        <button
          onClick={() => navigate('add_policy')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all cursor-pointer hover:scale-102 active:scale-98"
        >
          <FilePlus className="w-4 h-4" />
          <span>Add Policy / Upload</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by insurer, policy name, or policy number..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Family Member Filter */}
          <div className="sm:w-56">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Family Members</option>
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.relationship})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Policies List */}
      {filteredPolicies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322]">
          <Shield className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            No policies matching current criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try resetting your search or upload a new policy document.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setMemberFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((policy) => {
            const member = familyMembers.find((m) => m.id === policy.familyMemberId);

            return (
              <div
                key={policy.id}
                onClick={() => {
                  setSelectedPolicyId(policy.id);
                  navigate('policy_detail', policy.id);
                }}
                className="group rounded-2xl p-5 bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      {policy.category} insurance
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        policy.verificationStatus === 'active_verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {policy.verificationStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {policy.policyName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{policy.insurerName}</p>

                  {/* Insured Person */}
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400">Primary Insured:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {member?.fullName || policy.insuredMemberName}
                    </strong>
                  </div>

                  {/* Coverage Matrix */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-slate-100 dark:border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-400">Sum Assured</div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(policy.sumAssured, policy.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">
                        Premium ({policy.premiumFrequency})
                      </div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(policy.premiumAmount, policy.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Next Due Date & Policy Number */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px]">{policy.maskedNumber}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {policy.nextDueDate}
                    </span>
                  </div>
                </div>

                {/* Inspect Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                  <span>View Policy Details & Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
