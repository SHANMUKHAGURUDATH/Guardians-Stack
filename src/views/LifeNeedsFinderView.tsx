import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FinancialAssessment,
  DependentInfo,
  PolicyLabConfig,
  LifeScenarioType,
  AdvisorConsultation,
} from '../types/needsFinder';
import {
  calculateHLV,
  calculateNetNeeds,
  analyzeCombinedNeeds,
  generateProductRecommendations,
  calculatePolicyLab,
  simulateLifeScenario,
  CERTIFIED_ADVISORS,
} from '../utils/needsCalculator';
import {
  ShieldCheck,
  Calculator,
  Layers,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Sparkles,
  Users,
  CheckCircle2,
  DollarSign,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  Info,
  UserCheck,
  Clock,
  Video,
  PhoneCall,
  Calendar,
  RefreshCw,
  Plus,
  Trash2,
  ShieldAlert,
  MessageSquare,
  Send,
} from 'lucide-react';

export const LifeNeedsFinderView: React.FC = () => {
  const {
    familyMembers,
    policies,
    user,
    language,
    financialAssessment,
    saveFinancialAssessment,
    advisorConsultations,
    bookConsultation,
    cancelConsultation,
    rescheduleConsultation,
  } = useApp();

  // Active stage (1: Assessment, 2: Calculation Engine, 3: Products & Lab, 4: Advisory & Scheduler)
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);

  // Auto-detect existing life coverage from user's vault
  const vaultLifeCoverTotal = useMemo(() => {
    return policies
      .filter((p) => p.category === 'life')
      .reduce((sum, p) => sum + (p.sumAssured || 0), 0);
  }, [policies]);

  // Initial Assessment State (persisted via AppContext / localStorage)
  const [assessment, setAssessment] = useState<FinancialAssessment>(() => {
    if (financialAssessment) return financialAssessment;
    return {
      id: 'fa-' + Date.now(),
      userId: user?.id || 'user-1',
      assessmentDate: new Date().toISOString().split('T')[0],
      currentAge: 34,
      retirementAge: 60,
      employmentType: 'salaried',
      monthlyTakeHomeIncome: 150000,
      annualBonusOrOtherIncome: 200000,
      personalExpensePercentage: 25,
      dependents: [
        {
          id: 'dep-1',
          name: 'Priya Sharma (Spouse)',
          relationship: 'Spouse',
          age: 32,
          yearsOfDependence: 30,
          monthlySupportNeeded: 45000,
          higherEducationPlanned: false,
          educationCostEstimated: 0,
        },
        {
          id: 'dep-2',
          name: 'Aarav Sharma (Son)',
          relationship: 'Son',
          age: 6,
          yearsOfDependence: 16,
          monthlySupportNeeded: 25000,
          higherEducationPlanned: true,
          educationCostEstimated: 3500000,
        },
      ],
      outstandingHomeLoan: 4500000,
      outstandingVehicleLoan: 600000,
      outstandingPersonalLoan: 0,
      outstandingEducationLoan: 0,
      otherDebts: 0,
      immediateEmergencyBufferMonths: 6,
      finalExpensesBuffer: 400000,
      childrenEducationTotal: 3500000,
      marriageOrMilestoneGoals: 1500000,
      familyMonthlyLivingExpense: 75000,
      yearsOfFamilySupportNeeded: 22,
      liquidSavingsAndFD: 1200000,
      equityAndMutualFunds: 1800000,
      retirementCorpusAllocable: 1500000,
      otherLiquidInvestments: 500000,
      existingIndividualTermCover: vaultLifeCoverTotal > 0 ? vaultLifeCoverTotal : 5000000,
      existingTraditionalLifeCover: 500000,
      existingEmployerGroupCover: 3000000,
      assumedInflationRate: 0.06,
      assumedInvestmentReturnRate: 0.08,
      assumedIncomeGrowthRate: 0.07,
      isPrefilledFromVault: true,
      notes: 'Primary earner protecting young family and pending housing loan.',
    };
  });

  // Prefill from Family Members helper
  const handlePrefillFromFamily = () => {
    const nonSelfMembers = familyMembers.filter((m) => m.relationship !== 'Self');
    if (nonSelfMembers.length === 0) return;

    const importedDeps: DependentInfo[] = nonSelfMembers.map((m, idx) => {
      const birthYear = parseInt(m.dateOfBirth.split('-')[0]) || 2015;
      const currentYear = new Date().getFullYear();
      const age = Math.max(1, currentYear - birthYear);
      const isChild = age < 21;
      const yearsNeeded = isChild ? Math.max(5, 23 - age) : 25;

      return {
        id: `dep-imp-${idx}`,
        name: `${m.fullName} (${m.relationship})`,
        relationship: m.relationship,
        age,
        yearsOfDependence: yearsNeeded,
        monthlySupportNeeded: isChild ? 20000 : 35000,
        higherEducationPlanned: isChild,
        educationCostEstimated: isChild ? 3000000 : 0,
      };
    });

    const totalChildEd = importedDeps.reduce((sum, d) => sum + d.educationCostEstimated, 0);

    setAssessment((prev) => ({
      ...prev,
      dependents: importedDeps,
      childrenEducationTotal: totalChildEd,
      existingIndividualTermCover: vaultLifeCoverTotal > 0 ? vaultLifeCoverTotal : prev.existingIndividualTermCover,
      isPrefilledFromVault: true,
    }));
  };

  // Add a dependent row
  const handleAddDependent = () => {
    const newDep: DependentInfo = {
      id: 'dep-' + Date.now(),
      name: 'New Dependent',
      relationship: 'Dependent',
      age: 5,
      yearsOfDependence: 18,
      monthlySupportNeeded: 20000,
      higherEducationPlanned: true,
      educationCostEstimated: 2500000,
    };
    setAssessment((prev) => ({
      ...prev,
      dependents: [...prev.dependents, newDep],
      childrenEducationTotal: prev.childrenEducationTotal + 2500000,
    }));
  };

  // Remove a dependent row
  const handleRemoveDependent = (id: string) => {
    const depToRemove = assessment.dependents.find((d) => d.id === id);
    const edCost = depToRemove?.educationCostEstimated || 0;
    setAssessment((prev) => ({
      ...prev,
      dependents: prev.dependents.filter((d) => d.id !== id),
      childrenEducationTotal: Math.max(0, prev.childrenEducationTotal - edCost),
    }));
  };

  // Calculation Results
  const hlvResult = useMemo(() => calculateHLV(assessment), [assessment]);
  const netNeedsResult = useMemo(() => calculateNetNeeds(assessment), [assessment]);
  const combinedAnalysis = useMemo(
    () => analyzeCombinedNeeds(assessment, hlvResult, netNeedsResult),
    [assessment, hlvResult, netNeedsResult]
  );
  const recommendations = useMemo(
    () => generateProductRecommendations(assessment, combinedAnalysis),
    [assessment, combinedAnalysis]
  );

  // Policy Lab Config State
  const [policyLab, setPolicyLab] = useState<PolicyLabConfig>(() => ({
    coverAmount: combinedAnalysis.primaryRecommendationAmount || 15000000,
    tenureYears: Math.max(15, 60 - assessment.currentAge),
    paymentTerm: 'regular',
    paymentFrequency: 'annual',
    isSmoker: false,
    hasCriticalIllnessRider: true,
    criticalIllnessCover: 2500000,
    hasAccidentalDeathRider: true,
    accidentalDeathCover: 5000000,
    hasWaiverOfPremium: true,
  }));

  // Keep policy lab cover aligned if recommendation changes
  React.useEffect(() => {
    if (combinedAnalysis.primaryRecommendationAmount > 0) {
      setPolicyLab((prev) => ({
        ...prev,
        coverAmount: combinedAnalysis.primaryRecommendationAmount,
      }));
    }
  }, [combinedAnalysis.primaryRecommendationAmount]);

  const labResult = useMemo(() => {
    return calculatePolicyLab(
      policyLab,
      assessment.currentAge,
      assessment.monthlyTakeHomeIncome
    );
  }, [policyLab, assessment.currentAge, assessment.monthlyTakeHomeIncome]);

  // Life Scenario Simulation State
  const [activeScenario, setActiveScenario] = useState<LifeScenarioType>('new_child');
  const scenarioResult = useMemo(() => {
    return simulateLifeScenario(assessment, activeScenario);
  }, [assessment, activeScenario]);

  // Cashflow projection expansion toggle
  const [showProjectionTable, setShowProjectionTable] = useState(false);

  // Digital Advisory & Booking State
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('adv-1');
  const [consultationDate, setConsultationDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [consultationSlot, setConsultationSlot] = useState<string>('11:00 AM - 11:45 AM');
  const [consultationMode, setConsultationMode] = useState<'video' | 'phone' | 'in_person'>('video');
  const [bookingNotes, setBookingNotes] = useState<string>(
    'Need guidance on structuring term cover under Married Women Property Act (MWPA) and adding critical illness riders.'
  );
  const [userPhone, setUserPhone] = useState<string>(user?.phone || '+91 98765 43210');
  const [confirmedBooking, setConfirmedBooking] = useState<AdvisorConsultation | null>(() => {
    return advisorConsultations.find((c) => c.status !== 'cancelled') || null;
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  // Sync confirmedBooking if advisorConsultations changes
  useEffect(() => {
    const active = advisorConsultations.find((c) => c.status !== 'cancelled');
    setConfirmedBooking(active || null);
  }, [advisorConsultations]);

  // Auto-sync assessment with AppContext persistence
  useEffect(() => {
    saveFinancialAssessment(assessment);
  }, [assessment]);

  const selectedAdvisor = useMemo(() => {
    return CERTIFIED_ADVISORS.find((a) => a.id === selectedAdvisorId) || CERTIFIED_ADVISORS[0];
  }, [selectedAdvisorId]);

  const handleBookConsultation = () => {
    setBookingError(null);
    const res = bookConsultation({
      advisorId: selectedAdvisor.id,
      advisorName: selectedAdvisor.name,
      advisorTitle: selectedAdvisor.title,
      scheduledDate: consultationDate,
      timeSlot: consultationSlot,
      topic: 'Life Insurance Gap Review & Policy Structuring',
      userNotes: bookingNotes,
      preferredMode: consultationMode,
      contactPhone: userPhone,
      contactEmail: user?.email || 'sarah.admin@familyvault.internal',
      status: 'simulated_confirmed',
    });

    if (!res.success) {
      setBookingError(res.error || 'Failed to book appointment.');
    } else {
      setConfirmedBooking(res.booking || null);
      setBookingError(null);
    }
  };

  const handleCancelBooking = (id: string) => {
    cancelConsultation(id);
    setConfirmedBooking(null);
    setIsRescheduling(false);
  };

  const handleRescheduleBooking = (id: string, date: string, slot: string) => {
    setBookingError(null);
    const res = rescheduleConsultation(id, date, slot);
    if (!res.success) {
      setBookingError(res.error || 'Failed to reschedule appointment.');
    } else {
      setIsRescheduling(false);
      setBookingError(null);
    }
  };

  // Advisory Tab Mode (Appointment Scheduler vs Live Chat Consultation)
  const [advisoryTab, setAdvisoryTab] = useState<'scheduler' | 'live_chat'>('scheduler');
  const [chatMessages, setChatMessages] = useState<{ sender: 'advisor' | 'user'; text: string; time: string }[]>([
    {
      sender: 'advisor',
      text: `Hello! I'm ${selectedAdvisor.name}, ${selectedAdvisor.title}. I've reviewed your assessment: you have a calculated Net Protection Gap of ₹${(netNeedsResult.netLifeInsuranceGap / 100000).toFixed(1)} Lakhs and an HLV of ₹${(hlvResult.roundedHLV / 100000).toFixed(1)} Lakhs. How can I help you customize your coverage, riders, or MWP Act structuring?`,
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = async (messageText?: string) => {
    const query = (messageText || chatInput).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgList = [...chatMessages, { sender: 'user' as const, text: query, time }];
    setChatMessages(newMsgList);
    setChatInput('');

    try {
      const resp = await fetch('/api/needs/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          advisorName: selectedAdvisor.name,
          advisorTitle: selectedAdvisor.title,
          netGap: netNeedsResult.netLifeInsuranceGap,
          hlv: hlvResult.roundedHLV,
          recommendationCover: combinedAnalysis.primaryRecommendationAmount,
          age: assessment.currentAge,
          liabilities: netNeedsResult.totalLiabilities,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.reply) {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'advisor',
              text: data.reply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          return;
        }
      }
    } catch (e) {
      // Fallback below
    }

    // Local deterministic actuarial knowledge base fallback
    const qLower = query.toLowerCase();
    let reply = '';
    if (qLower.includes('mwp') || qLower.includes('married') || qLower.includes('trust')) {
      reply = `Under Section 6 of the Married Women's Property Act (MWPA, 1874), your term insurance policy proceeds are held in trust exclusively for your spouse and children. They cannot be attached by any creditors, court orders, or business debts in insolvency. You must declare this during the initial proposal; it cannot be added retrospectively!`;
    } else if (qLower.includes('ulip') || qLower.includes('endowment') || qLower.includes('term')) {
      reply = `For your calculated coverage of ₹${(combinedAnalysis.primaryRecommendationAmount / 100000).toFixed(0)} Lakhs, pure term insurance costs only ~₹${labResult.totalAnnualPremium.toLocaleString('en-IN')}/year. A ULIP or endowment plan for this sum would cost over ₹6 - 8 Lakhs per year with high upfront charges. The fiduciary golden rule: Buy pure term and invest the difference in mutual funds!`;
    } else if (qLower.includes('rider') || qLower.includes('critical') || qLower.includes('illness')) {
      reply = `Based on your profile, we strongly recommend: 1. Accelerated Critical Illness (₹25 Lakhs) for 36 ailments like cancer/cardiac, 2. Accidental Total Permanent Disability (₹50 Lakhs), and 3. Waiver of Premium (WOP) to keep the policy active if you are unable to work. Avoid 'Return of Premium' (TROP) riders, as they yield poor returns.`;
    } else if (qLower.includes('tax') || qLower.includes('80c') || qLower.includes('10(10d)')) {
      reply = `Under Section 80C, your term premium qualifies for tax deductions up to ₹1.5 Lakhs annually, saving approx ₹${labResult.taxSavings80CEstimated.toLocaleString('en-IN')}/year under the old regime. Additionally, all death benefit payouts to your family are 100% tax-free under Section 10(10D) with no upper cap.`;
    } else {
      reply = `Thank you for your question! For your profile (Age ${assessment.currentAge}, ${assessment.dependents.length} dependents, ₹${(netNeedsResult.totalLiabilities / 100000).toFixed(0)}L liabilities), securing ₹${(combinedAnalysis.primaryRecommendationAmount / 100000).toFixed(0)} Lakhs pure term coverage up to age ${assessment.currentAge + policyLab.tenureYears} provides optimal financial certainty. Would you like to schedule a 1-on-1 video call to review insurer claim settlement ratios together?`;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'advisor',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 print:p-0">
      {/* Platform Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-[#0A1A2F] text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Guardian Stack Advisory
              </span>
              <span className="text-xs text-slate-400">
                Deterministic Financial Architecture • Zero AI Hallucination
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-teal-400 shrink-0" />
              <span>Intelligent Life Insurance Needs Finder</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Actuarial Human Life Value (HLV) DCF model and Capital Needs analysis to calculate your exact protection gap, compare policy categories, simulate life scenarios, and book certified advisory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition-all border border-white/15 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* 4-Stage Stepper Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {
              step: 1,
              title: '1. Financial Assessment',
              desc: 'Income, Debts & Dependents',
              icon: Calculator,
            },
            {
              step: 2,
              title: '2. Needs Engine',
              desc: 'HLV & Net Needs Model',
              icon: TrendingUp,
            },
            {
              step: 3,
              title: '3. Products & Policy Lab',
              desc: 'Term vs ULIP & Scenarios',
              icon: Sliders,
            },
            {
              step: 4,
              title: '4. Digital Advisory',
              desc: 'Report & Advisor Booking',
              icon: CalendarCheck,
            },
          ].map((item) => {
            const isCurrent = activeStage === item.step;
            const isCompleted = activeStage > item.step;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                onClick={() => setActiveStage(item.step as any)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                    : isCompleted
                    ? 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-900/30 border-slate-800/50 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-teal-500 text-slate-950 font-black'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: FINANCIAL ASSESSMENT QUESTIONNAIRE */}
      {/* ========================================================================= */}
      {activeStage === 1 && (
        <div className="space-y-6">
          {/* Header Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 text-xs">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                <strong>Smart Vault Integration:</strong> Automatically import your family members, children education horizons, and verified policies.
              </span>
            </div>
            <button
              onClick={handlePrefillFromFamily}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync from Family Vault</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Personal & Income Profile */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-500" />
                <span>1. Primary Breadwinner & Income Profile</span>
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Current Age (Years)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="75"
                    value={assessment.currentAge}
                    onChange={(e) =>
                      setAssessment({ ...assessment, currentAge: Number(e.target.value) || 30 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Planned Retirement Age
                  </label>
                  <input
                    type="number"
                    min="45"
                    max="80"
                    value={assessment.retirementAge}
                    onChange={(e) =>
                      setAssessment({ ...assessment, retirementAge: Number(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Take-Home Income (₹ Net)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="5000"
                      value={assessment.monthlyTakeHomeIncome}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          monthlyTakeHomeIncome: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ₹{(assessment.monthlyTakeHomeIncome / 100000).toFixed(2)} Lakhs per month
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Performance Bonus / Other Income (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="25000"
                      value={assessment.annualBonusOrOtherIncome}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          annualBonusOrOtherIncome: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Personal Expenditure Share: {assessment.personalExpensePercentage}%
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Family gets {100 - assessment.personalExpensePercentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="5"
                    value={assessment.personalExpensePercentage}
                    onChange={(e) =>
                      setAssessment({
                        ...assessment,
                        personalExpensePercentage: Number(e.target.value),
                      })
                    }
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Portion of earnings spent on self (commute, personal hobbies, meals). The remainder (₹
                    {(
                      ((assessment.monthlyTakeHomeIncome * 12 + assessment.annualBonusOrOtherIncome) *
                        (1 - assessment.personalExpensePercentage / 100)) /
                      100000
                    ).toFixed(1)}{' '}
                    Lakhs/yr) directly supports your family.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Liabilities & Debts */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>2. Outstanding Liabilities & Debts</span>
              </h2>

              <p className="text-xs text-slate-500">
                In the event of untimely demise, lenders demand immediate liquidation or seize mortgaged assets.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Home Loan Principal (₹)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={assessment.outstandingHomeLoan}
                    onChange={(e) =>
                      setAssessment({
                        ...assessment,
                        outstandingHomeLoan: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Car / Vehicle Loan (₹)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={assessment.outstandingVehicleLoan}
                    onChange={(e) =>
                      setAssessment({
                        ...assessment,
                        outstandingVehicleLoan: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Personal Loan Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="25000"
                    value={assessment.outstandingPersonalLoan}
                    onChange={(e) =>
                      setAssessment({
                        ...assessment,
                        outstandingPersonalLoan: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Education / Other Debt (₹)
                  </label>
                  <input
                    type="number"
                    step="25000"
                    value={assessment.outstandingEducationLoan}
                    onChange={(e) =>
                      setAssessment({
                        ...assessment,
                        outstandingEducationLoan: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Total Debt Burden
                  </span>
                  <div className="text-lg font-black text-rose-700 dark:text-rose-300">
                    ₹
                    {(
                      ((assessment.outstandingHomeLoan || 0) +
                        (assessment.outstandingVehicleLoan || 0) +
                        (assessment.outstandingPersonalLoan || 0) +
                        (assessment.outstandingEducationLoan || 0)) /
                      100000
                    ).toFixed(1)}{' '}
                    Lakhs
                  </div>
                </div>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold text-right">
                  100% must be hedged with Term Cover
                </span>
              </div>
            </div>
          </div>

          {/* Dependents & Family Living Horizon */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <span>3. Dependents, Higher Education & Living Horizon</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track how many years your family requires guaranteed cash flow until financial independence.
                </p>
              </div>

              <button
                onClick={handleAddDependent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dependent</span>
              </button>
            </div>

            <div className="space-y-3">
              {assessment.dependents.map((dep, idx) => (
                <div
                  key={dep.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs"
                >
                  <div className="sm:col-span-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
                      Name & Relation
                    </label>
                    <input
                      type="text"
                      value={dep.name}
                      onChange={(e) => {
                        const updated = [...assessment.dependents];
                        updated[idx].name = e.target.value;
                        setAssessment({ ...assessment, dependents: updated });
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
                      Years of Dependence
                    </label>
                    <input
                      type="number"
                      value={dep.yearsOfDependence}
                      onChange={(e) => {
                        const updated = [...assessment.dependents];
                        updated[idx].yearsOfDependence = Number(e.target.value) || 1;
                        setAssessment({ ...assessment, dependents: updated });
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
                      Higher Education Goal (₹)
                    </label>
                    <input
                      type="number"
                      step="100000"
                      value={dep.educationCostEstimated}
                      onChange={(e) => {
                        const updated = [...assessment.dependents];
                        updated[idx].educationCostEstimated = Number(e.target.value) || 0;
                        const newTotal = updated.reduce((s, d) => s + d.educationCostEstimated, 0);
                        setAssessment({
                          ...assessment,
                          dependents: updated,
                          childrenEducationTotal: newTotal,
                        });
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                    <button
                      onClick={() => handleRemoveDependent(dep.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Remove Dependent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Family Monthly Living Expense (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={assessment.familyMonthlyLivingExpense}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      familyMonthlyLivingExpense: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Years of Support Horizon
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={assessment.yearsOfFamilySupportNeeded}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      yearsOfFamilySupportNeeded: Number(e.target.value) || 15,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Immediate Emergency Cushion
                </label>
                <select
                  value={assessment.immediateEmergencyBufferMonths}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      immediateEmergencyBufferMonths: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value={3}>3 Months Living Expenses</option>
                  <option value={6}>6 Months (Standard Safety)</option>
                  <option value={12}>12 Months (Conservative)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Current Financial Assets & Existing Policies */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>4. Liquid Financial Assets & Existing Insurance Coverage</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Liquid Savings & FDs (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={assessment.liquidSavingsAndFD}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      liquidSavingsAndFD: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mutual Funds & Equities (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={assessment.equityAndMutualFunds}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      equityAndMutualFunds: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Existing Individual Term Cover (₹)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={assessment.existingIndividualTermCover}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      existingIndividualTermCover: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Employer Group Life Cover (₹)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={assessment.existingEmployerGroupCover}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      existingEmployerGroupCover: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/20 cursor-pointer transition-all hover:scale-102"
            >
              <span>Run Actuarial Needs Engine &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: CALCULATION ENGINE & HLV VS NET NEEDS */}
      {/* ========================================================================= */}
      {activeStage === 2 && (
        <div className="space-y-6">
          {/* Top Scorecard: Net Protection Gap */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      netNeedsResult.coverageStatus === 'surplus'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : netNeedsResult.coverageStatus === 'adequately_insured'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    Status: {netNeedsResult.coverageStatus.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    Coverage Ratio: {netNeedsResult.coverageRatioPercentage}%
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
                  {netNeedsResult.netLifeInsuranceGap > 0 ? (
                    <>
                      Net Protection Gap:{' '}
                      <span className="text-rose-600 dark:text-rose-400">
                        ₹{(netNeedsResult.netLifeInsuranceGap / 100000).toFixed(1)} Lakhs
                      </span>
                    </>
                  ) : netNeedsResult.coverageStatus === 'surplus' ? (
                    <>
                      Protection Status:{' '}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Surplus of ₹{(netNeedsResult.estimatedSurplus / 100000).toFixed(1)} Lakhs
                      </span>
                    </>
                  ) : (
                    <>
                      Protection Status:{' '}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        100% Exactly Hedged (₹0 Gap)
                      </span>
                    </>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  {combinedAnalysis.rationale}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Recommended Term Cover
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                  ₹{(combinedAnalysis.primaryRecommendationAmount / 10000000).toFixed(2)} Crore
                </div>
                <div className="text-[11px] text-slate-500">
                  (₹{(combinedAnalysis.primaryRecommendationAmount / 100000).toLocaleString('en-IN')} Lakhs)
                </div>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Available Resources: ₹{(netNeedsResult.totalAvailableResources / 100000).toFixed(1)}L</span>
                <span>Total Needs: ₹{(netNeedsResult.totalFinancialNeeds / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, netNeedsResult.coverageRatioPercentage)}%`,
                  }}
                />
                {netNeedsResult.netLifeInsuranceGap > 0 && (
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        100 - Math.min(100, netNeedsResult.coverageRatioPercentage)
                      )}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Model Comparison: HLV vs Net Needs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model A: Human Life Value (HLV) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Human Life Value (HLV)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Discounted Cash Flow (DCF) of Future Earning Potential
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  ₹{(hlvResult.roundedHLV / 10000000).toFixed(2)} Cr
                </span>
              </div>

              <div className="text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Gross Annual Income:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(hlvResult.annualIncome / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Less Personal Expenses ({assessment.personalExpensePercentage}%):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    -₹{(hlvResult.annualSelfExpense / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Net Annual Family Contribution:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(hlvResult.annualFamilyContribution / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Working Horizon:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {hlvResult.workingYearsRemaining} Years (Age {assessment.currentAge} to {assessment.retirementAge})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Growth rate (g) vs Discount rate (r):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(hlvResult.incomeGrowthRate * 100).toFixed(1)}% vs {(hlvResult.discountRate * 100).toFixed(1)}%
                  </span>
                </div>
                {hlvResult.isLimitCaseApplied && (
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-[11px] font-semibold">
                    Safe Limit Case Applied ($g = r$): zero-division protected discrete limit DCF.
                  </div>
                )}
              </div>

              {/* Collapsible Cashflow Projection */}
              <div className="pt-2">
                <button
                  onClick={() => setShowProjectionTable(!showProjectionTable)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>{showProjectionTable ? 'Hide Projection Table' : 'Show 35-Year DCF Projection Rows'}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showProjectionTable ? 'rotate-180' : ''}`}
                  />
                </button>

                {showProjectionTable && (
                  <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 text-[10px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky top-0">
                        <tr>
                          <th className="p-1.5">Yr</th>
                          <th className="p-1.5">Age</th>
                          <th className="p-1.5">Contribution</th>
                          <th className="p-1.5">Discount</th>
                          <th className="p-1.5 text-right">Present Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {hlvResult.cashflowProjection.map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="p-1.5 font-bold">{row.year}</td>
                            <td className="p-1.5">{row.age}</td>
                            <td className="p-1.5">₹{(row.familyContribution / 100000).toFixed(2)}L</td>
                            <td className="p-1.5">{row.discountFactor}</td>
                            <td className="p-1.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                              ₹{(row.presentValue / 100000).toFixed(2)}L
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Model B: Net Needs Approach */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Net Needs Approach
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Debts + Living Horizon + Milestone Goals − Existing Cover
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {netNeedsResult.netLifeInsuranceGap > 0
                    ? `Gap: ₹${(netNeedsResult.netLifeInsuranceGap / 100000).toFixed(1)} Lakhs`
                    : netNeedsResult.estimatedSurplus > 0
                    ? `Surplus: ₹${(netNeedsResult.estimatedSurplus / 100000).toFixed(1)} Lakhs`
                    : 'Exact 100% Covered'}
                </span>
              </div>

              <div className="text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Outstanding Liabilities:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(netNeedsResult.totalLiabilities / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Immediate Cushion & Final Expenses:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(netNeedsResult.immediateExpenses / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Family Living Expenses PV ({assessment.yearsOfFamilySupportNeeded} yrs):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(netNeedsResult.familySupportPV / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Higher Education & Milestone Goals:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(netNeedsResult.futureEducationAndMilestones / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Total Gross Financial Obligation:</span>
                  <span>₹{(netNeedsResult.totalFinancialNeeds / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 text-slate-500">
                  <span>Less Allocated Financial Assets:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    -₹{(netNeedsResult.allocatedFinancialAssets / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 text-slate-500">
                  <span>Less Existing Life Insurance:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    -₹{(netNeedsResult.totalExistingCover / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                {netNeedsResult.estimatedSurplus > 0 && (
                  <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-800/60 font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Estimated Coverage Surplus:</span>
                    <span>+₹{(netNeedsResult.estimatedSurplus / 100000).toFixed(1)} Lakhs</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setActiveStage(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Assessment Inputs</span>
            </button>

            <button
              onClick={() => setActiveStage(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/20 cursor-pointer transition-all hover:scale-102"
            >
              <span>Explore Products & Policy Lab &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: PRODUCTS COMPARISON, POLICY LAB & SCENARIO SIMULATOR */}
      {/* ========================================================================= */}
      {activeStage === 3 && (
        <div className="space-y-6">
          {/* Section A: Product Category Comparison */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-500" />
                <span>Intelligent Product Recommendation & Category Comparison</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Objective actuarial evaluation comparing Pure Term, Whole Life, ULIPs, and Endowment plans based on your debt and family profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                    prod.isTopPick
                      ? 'bg-gradient-to-br from-teal-50/50 via-white to-teal-50/20 dark:from-teal-950/30 dark:via-[#0E1322] dark:to-teal-950/10 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {prod.title}
                          </h3>
                          {prod.isTopPick && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-600 text-white">
                              Top Pick ({prod.matchScore}% Match)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{prod.tagline}</p>
                      </div>

                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                        Match {prod.matchScore}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">
                          Recommended Sum Assured:
                        </span>
                        <div className="font-black text-slate-900 dark:text-white text-sm">
                          ₹{(prod.recommendedSumAssured / 100000).toFixed(0)} Lakhs
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">
                          Est. Annual Premium:
                        </span>
                        <div className="font-black text-teal-600 dark:text-teal-400 text-sm">
                          ₹{prod.estimatedAnnualPremiumMin.toLocaleString('en-IN')} - ₹
                          {prod.estimatedAnnualPremiumMax.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] uppercase tracking-wider">
                        Key Advantages:
                      </div>
                      {prod.keyBenefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Trade-offs */}
                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-amber-600 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                        Trade-Offs to Note:
                      </div>
                      {prod.tradeOffs.map((t, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                    <strong>Best Suited For:</strong> {prod.bestSuitedFor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Interactive Policy Lab (Sliders & Real-Time Math) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <span>Interactive Policy Lab & Rider Customizer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust sum assured, tenure, and essential health riders to preview real-time premiums and Section 80C tax savings.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sliders (2 cols) */}
              <div className="lg:col-span-2 space-y-5">
                {/* Cover Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Target Sum Assured Coverage:
                    </span>
                    <span className="text-base font-black text-teal-600 dark:text-teal-400">
                      ₹{(policyLab.coverAmount / 10000000).toFixed(2)} Crore (₹
                      {(policyLab.coverAmount / 100000).toFixed(0)} Lakhs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2500000"
                    max="50000000"
                    step="500000"
                    value={policyLab.coverAmount}
                    onChange={(e) =>
                      setPolicyLab({ ...policyLab, coverAmount: Number(e.target.value) })
                    }
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>₹25 Lakhs</span>
                    <span>₹1 Crore</span>
                    <span>₹2.5 Crores</span>
                    <span>₹5 Crores</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Policy Tenure: {policyLab.tenureYears} Years (Covers up to Age{' '}
                      {assessment.currentAge + policyLab.tenureYears})
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Ideal: until youngest child is self-sufficient
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="1"
                    value={policyLab.tenureYears}
                    onChange={(e) =>
                      setPolicyLab({ ...policyLab, tenureYears: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Payment Frequency & Smoker Status */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Payment Frequency
                    </label>
                    <select
                      value={policyLab.paymentFrequency}
                      onChange={(e) =>
                        setPolicyLab({ ...policyLab, paymentFrequency: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="annual">Annual (Cheapest)</option>
                      <option value="monthly">Monthly Standing Order</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Premium Payment Term
                    </label>
                    <select
                      value={policyLab.paymentTerm}
                      onChange={(e) =>
                        setPolicyLab({ ...policyLab, paymentTerm: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="regular">Regular Pay (full term)</option>
                      <option value="limited_10yr">Limited Pay (10 Years)</option>
                      <option value="pay_to_60">Pay to Age 60</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tobacco / Nicotine Use
                    </label>
                    <select
                      value={policyLab.isSmoker ? 'yes' : 'no'}
                      onChange={(e) =>
                        setPolicyLab({ ...policyLab, isSmoker: e.target.value === 'yes' })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="no">Non-Smoker (Standard)</option>
                      <option value="yes">Smoker / Nicotine (+55%)</option>
                    </select>
                  </div>
                </div>

                {/* Recommended Riders */}
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                    Essential Integrated Riders:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <input
                        type="checkbox"
                        checked={policyLab.hasCriticalIllnessRider}
                        onChange={(e) =>
                          setPolicyLab({
                            ...policyLab,
                            hasCriticalIllnessRider: e.target.checked,
                          })
                        }
                        className="mt-0.5 accent-teal-600"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Critical Illness (₹25L)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Cancer, Stroke, Heart Attack payout
                        </div>
                      </div>
                    </label>

                    <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <input
                        type="checkbox"
                        checked={policyLab.hasAccidentalDeathRider}
                        onChange={(e) =>
                          setPolicyLab({
                            ...policyLab,
                            hasAccidentalDeathRider: e.target.checked,
                          })
                        }
                        className="mt-0.5 accent-teal-600"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Accidental Death (₹50L)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Double payout on road/travel accident
                        </div>
                      </div>
                    </label>

                    <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <input
                        type="checkbox"
                        checked={policyLab.hasWaiverOfPremium}
                        onChange={(e) =>
                          setPolicyLab({
                            ...policyLab,
                            hasWaiverOfPremium: e.target.checked,
                          })
                        }
                        className="mt-0.5 accent-teal-600"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Waiver of Premium
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Policy stays free if disabled
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Lab Results Card (1 col) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0A1A2F] text-white border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Live Actuarial Quote Preview
                  </span>
                  <div className="text-3xl font-black text-white mt-1">
                    ₹{labResult.periodicInstallment.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400">
                      {' '}
                      /{policyLab.paymentFrequency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Total annual outflow: ₹{labResult.totalAnnualPremium.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="space-y-2 text-xs py-3 border-y border-white/10">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Term Premium:</span>
                    <span className="font-bold text-white">
                      ₹{labResult.estimatedAnnualBasePremium.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {policyLab.hasCriticalIllnessRider && (
                    <div className="flex justify-between text-slate-300">
                      <span>Critical Illness Rider:</span>
                      <span className="font-bold text-teal-300">
                        +₹{labResult.riderPremiums.criticalIllness.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {policyLab.hasAccidentalDeathRider && (
                    <div className="flex justify-between text-slate-300">
                      <span>Accidental Death Rider:</span>
                      <span className="font-bold text-teal-300">
                        +₹{labResult.riderPremiums.accidentalDeath.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {policyLab.hasWaiverOfPremium && (
                    <div className="flex justify-between text-slate-300">
                      <span>Waiver of Premium:</span>
                      <span className="font-bold text-teal-300">
                        +₹{labResult.riderPremiums.waiverOfPremium.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300 pt-1">
                    <span>Income Share:</span>
                    <span className="font-bold text-emerald-400">
                      {labResult.premiumToIncomeRatio}% of take-home
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs space-y-1">
                  <div className="font-bold text-teal-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Estimated 80C Tax Savings:</span>
                  </div>
                  <div className="text-lg font-black text-white">
                    ₹{labResult.taxSavings80CEstimated.toLocaleString('en-IN')} / year
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Life Scenario Simulator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Life Milestone Scenario Simulator</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate upcoming family milestones or financial changes to see their instantaneous mathematical impact on your insurance gap.
              </p>
            </div>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'new_child', label: '👶 New Child', desc: '+Education & living' },
                { id: 'home_loan_taken', label: '🏡 Home Loan', desc: '+₹60L mortgage' },
                { id: 'early_retirement', label: '🏖️ Retire at 50', desc: '-5 working yrs' },
                { id: 'spouse_starts_earning', label: '💼 Spouse Working', desc: '+Family income' },
                { id: 'inheritance_windfall', label: '💰 Windfall ₹40L', desc: '+Liquid corpus' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id as any)}
                  className={`p-3 rounded-2xl text-left border cursor-pointer transition-all ${
                    activeScenario === s.id
                      ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Scenario Impact Result Card */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-amber-950 dark:text-amber-200">
                    {scenarioResult.title}
                  </h3>
                  <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                    {scenarioResult.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      New Protection Gap
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      ₹{(scenarioResult.newGap / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black ${
                      scenarioResult.gapDifference > 0
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {scenarioResult.gapDifference > 0 ? '+' : ''}₹
                    {(scenarioResult.gapDifference / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>

              {/* Action Plan */}
              <div className="space-y-1.5 pt-2 border-t border-amber-200/80 dark:border-amber-900/80 text-xs">
                <span className="font-bold text-amber-950 dark:text-amber-200 text-[11px] uppercase tracking-wider block">
                  Recommended Action Plan:
                </span>
                {scenarioResult.actionPlan.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Needs Engine</span>
            </button>

            <button
              onClick={() => setActiveStage(4)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/20 cursor-pointer transition-all hover:scale-102"
            >
              <span>Digital Advisory & Book Certified Session &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: DIGITAL ADVISORY & CONSULTATION SCHEDULER */}
      {/* ========================================================================= */}
      {activeStage === 4 && (
        <div className="space-y-6">
          {/* Printable Report Header (Active in print mode) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Certified Advisory Synthesis Report
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Executive Protection Summary & Policy Structuring Plan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepared for {user?.displayName || 'Primary Family Earner'} • Assessment ID:{' '}
                  {assessment.id}
                </p>
              </div>

              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
            </div>

            {/* Key Metric Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">
                  Recommended Term Cover:
                </span>
                <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
                  ₹{(combinedAnalysis.primaryRecommendationAmount / 100000).toFixed(0)}L
                </div>
                <div className="text-[10px] text-slate-500">Pure Risk Transfer</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">
                  Human Life Value (DCF):
                </span>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  ₹{(hlvResult.roundedHLV / 100000).toFixed(0)}L
                </div>
                <div className="text-[10px] text-slate-500">Economic earning potential</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">
                  Total Outstanding Debt:
                </span>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  ₹{(netNeedsResult.totalLiabilities / 100000).toFixed(0)}L
                </div>
                <div className="text-[10px] text-slate-500">Immediate mortgage liability</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">
                  Recommended Term:
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {policyLab.tenureYears} Years
                </div>
                <div className="text-[10px] text-slate-500">
                  Covers until Age {assessment.currentAge + policyLab.tenureYears}
                </div>
              </div>
            </div>

            {/* Strategic Rationale & MWP Act Guidance */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <span>Guardian Stack Actuarial Counsel & Legal Protection Mandates</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                1. <strong>Married Women's Property Act (MWPA, 1874) Endorsement:</strong> Execute your term policy under Section 6 of the MWPA. Under Indian jurisprudence, policy proceeds are held in trust exclusively for your wife and children and cannot be attached by creditors, court decrees, or business liability claims.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                2. <strong>Rider Configuration:</strong> Ensure the Critical Illness rider is an accelerated or standalone benefit rather than a surrender deductible. Maintain a minimum of ₹25 Lakhs for catastrophic cardiac, oncological, and neurovascular diagnoses.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                3. <strong>Annual Review Trigger:</strong> Re-run this assessment upon welcoming another child, acquiring property, or receiving substantial salary hikes of &gt;20%.
              </p>
            </div>
          </div>

          {/* Certified Financial Advisor Consultation Scheduler & Live Chat */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-teal-500" />
                  <span>Digital Advisory Consultation with Certified Specialists</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complimentary 45-minute zero-commission fiduciary consultation & instant simulated live chat with SEBI / IRDAI specialists.
                </p>
              </div>

              {/* Advisory Mode Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setAdvisoryTab('scheduler')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advisoryTab === 'scheduler'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Call</span>
                </button>
                <button
                  onClick={() => setAdvisoryTab('live_chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advisoryTab === 'live_chat'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Live Advisory Chat</span>
                </button>
              </div>
            </div>

            {/* Advisor Selection Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Your Fiduciary Advisor:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CERTIFIED_ADVISORS.map((adv) => {
                  const isSelected = selectedAdvisorId === adv.id;

                  return (
                    <div
                      key={adv.id}
                      onClick={() => setSelectedAdvisorId(adv.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 ring-2 ring-teal-500/30'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${adv.avatarColor} text-white font-black text-sm flex items-center justify-center shadow-md`}
                          >
                            {adv.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {adv.name}
                            </div>
                            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                              {adv.title}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {adv.certifications.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-950 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <span>⭐ {adv.rating} ({adv.totalConsultations}+ reviews)</span>
                        <span>{adv.experienceYears} yrs exp</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conditional Sub-View: 1. Scheduler vs 2. Live Chat */}
            {advisoryTab === 'scheduler' ? (
              <>
                {/* Booking Form Details */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                      <span>Consultation Date</span>
                    </label>
                    <input
                      type="date"
                      value={consultationDate}
                      onChange={(e) => setConsultationDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-500" />
                      <span>Time Slot (IST)</span>
                    </label>
                    <select
                      value={consultationSlot}
                      onChange={(e) => setConsultationSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                      <option value="11:00 AM - 11:45 AM">11:00 AM - 11:45 AM</option>
                      <option value="02:30 PM - 03:15 PM">02:30 PM - 03:15 PM</option>
                      <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM</option>
                      <option value="06:00 PM - 06:45 PM">06:00 PM - 06:45 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-teal-500" />
                      <span>Preferred Channel</span>
                    </label>
                    <select
                      value={consultationMode}
                      onChange={(e) => setConsultationMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="video">Secure HD Video Call (Google Meet)</option>
                      <option value="phone">Direct Phone Call</option>
                      <option value="in_person">In-Person City Office</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Topics to Focus On / Questions for {selectedAdvisor.name}:
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                {/* Conflict / Validation Error Banner */}
                {bookingError && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Confirmed Booking Card with Reschedule and Cancel Controls */}
                {confirmedBooking ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="font-extrabold text-sm block">
                            Consultation Confirmed: Ref #{confirmedBooking.id}
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            Simulated Fiduciary Appointment • IRDAI / SEBI Registered Specialist
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 w-fit">
                        Status: {confirmedBooking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed">
                      Your appointment with <strong>{confirmedBooking.advisorName}</strong> is scheduled for{' '}
                      <strong>{confirmedBooking.scheduledDate}</strong> at{' '}
                      <strong>{confirmedBooking.timeSlot}</strong> via{' '}
                      <strong>{confirmedBooking.preferredMode.toUpperCase()}</strong>.
                      {confirmedBooking.rescheduledFromSlot && (
                        <span className="text-amber-700 dark:text-amber-400 block mt-1">
                          (Rescheduled from previous slot: {confirmedBooking.rescheduledFromSlot})
                        </span>
                      )}
                    </p>

                    {/* Reschedule Picker Mode */}
                    {isRescheduling ? (
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-3 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          Select New Date & Time Slot:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={consultationDate}
                            onChange={(e) => setConsultationDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                          />
                          <select
                            value={consultationSlot}
                            onChange={(e) => setConsultationSlot(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                          >
                            <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                            <option value="11:00 AM - 11:45 AM">11:00 AM - 11:45 AM</option>
                            <option value="02:30 PM - 03:15 PM">02:30 PM - 03:15 PM</option>
                            <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM</option>
                            <option value="06:00 PM - 06:45 PM">06:00 PM - 06:45 PM</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => setIsRescheduling(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRescheduleBooking(confirmedBooking.id, consultationDate, consultationSlot)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Save New Slot
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Calendar invite prepared for <strong>{confirmedBooking.contactEmail}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsRescheduling(true)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-slate-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold cursor-pointer"
                          >
                            Reschedule Slot
                          </button>
                          <button
                            onClick={() => handleCancelBooking(confirmedBooking.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold cursor-pointer"
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={handleBookConsultation}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/20 cursor-pointer transition-all hover:scale-102"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Confirm Appointment with {selectedAdvisor.name}</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Live Chat Consultation Interface */
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden space-y-3 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${selectedAdvisor.avatarColor} text-white font-bold flex items-center justify-center text-xs`}>
                        {selectedAdvisor.name.charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{selectedAdvisor.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          Active Now
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{selectedAdvisor.title}</div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Fiduciary Zero-Commission Advisory
                  </span>
                </div>

                {/* Message Log */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-teal-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Query Pills */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 mb-1.5">
                    Ask quick actuarial questions:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Why Term over ULIP/Endowment?',
                      'How to register under MWPA Trust?',
                      'Which Riders to select?',
                      'Section 80C & 10(10D) tax benefits?',
                    ].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => handleSendChat(pill)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder={`Ask ${selectedAdvisor.name.split(' ')[0]} about your ₹${(combinedAnalysis.primaryRecommendationAmount / 100000).toFixed(0)}L cover...`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-teal-500"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Return to Stage 1 */}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setActiveStage(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Policy Lab</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
