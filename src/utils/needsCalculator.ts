import {
  FinancialAssessment,
  HLVCalculation,
  NetNeedsCalculation,
  CombinedNeedsAnalysis,
  ProductRecommendation,
  PolicyLabConfig,
  PolicyLabResult,
  LifeScenarioType,
  LifeScenarioSimulation,
  YearCashflow,
} from '../types/needsFinder';

/**
 * Calculates Human Life Value (HLV) using discounted cash flow of future economic contribution.
 * Protects against division-by-zero when income growth rate (g) equals discount rate (r).
 * Reconciles discrete end-of-year discounting with real-rate constant purchasing power models.
 */
export function calculateHLV(assessment: FinancialAssessment): HLVCalculation {
  const rawAnnualIncome = (assessment.monthlyTakeHomeIncome * 12) + (assessment.annualBonusOrOtherIncome || 0);
  const annualIncome = Math.max(0, rawAnnualIncome);
  const selfExpenseRatio = Math.max(0, Math.min(0.95, (assessment.personalExpensePercentage ?? 25) / 100));
  const annualSelfExpense = annualIncome * selfExpenseRatio;
  const annualFamilyContribution = Math.max(0, annualIncome - annualSelfExpense);

  const currentAge = Math.max(18, assessment.currentAge || 30);
  const retirementAge = Math.max(currentAge + 1, assessment.retirementAge || 60);
  const workingYearsRemaining = Math.max(1, retirementAge - currentAge);

  const g = assessment.assumedIncomeGrowthRate ?? 0.07; // e.g. 0.07
  const r = assessment.assumedInvestmentReturnRate ?? 0.08; // e.g. 0.08

  const cashflowProjection: YearCashflow[] = [];
  let discretePV = 0;
  const isLimitCase = Math.abs(g - r) < 0.0001;

  for (let t = 1; t <= workingYearsRemaining; t++) {
    const ageAtYear = currentAge + t;
    const grossIncomeYear = annualIncome * Math.pow(1 + g, t - 1);
    const selfExpenseYear = grossIncomeYear * selfExpenseRatio;
    const familyContributionYear = grossIncomeYear - selfExpenseYear;
    
    // Discount factor 1 / (1 + r)^t (safe against r === 0)
    const discountFactor = r === 0 ? 1 : 1 / Math.pow(1 + r, t);
    const presentValue = familyContributionYear * discountFactor;

    discretePV += presentValue;

    if (t <= 35) { // Store up to 35 projection rows for UI charts and tables
      cashflowProjection.push({
        year: t,
        age: ageAtYear,
        grossIncome: Math.round(grossIncomeYear),
        selfExpense: Math.round(selfExpenseYear),
        familyContribution: Math.round(familyContributionYear),
        discountFactor: Number(discountFactor.toFixed(4)),
        presentValue: Math.round(presentValue),
      });
    }
  }

  // Real-rate annuity model calculation:
  // real discount rate i* = (1 + r) / (1 + g) - 1. When g == r, i* == 0, so PV = n * C.
  let realRatePV = 0;
  if (isLimitCase) {
    realRatePV = workingYearsRemaining * annualFamilyContribution;
  } else {
    const realRate = (1 + r) / (1 + g) - 1;
    realRatePV = annualFamilyContribution * ((1 - Math.pow(1 + realRate, -workingYearsRemaining)) / realRate);
  }

  // Determine primary HLV result based on convention
  // Convention 'discrete' strictly evaluates Σ [C * (1+g)^(t-1) / (1+r)^t]
  // Convention 'real_rate' (or default limit case) applies real-rate equivalence n * C when g == r
  let primaryHLV = discretePV;
  if (assessment.hlvConvention === 'real_rate') {
    primaryHLV = realRatePV;
  } else if (isLimitCase) {
    // When g == r, provide real-rate value (e.g. 50L for 5L x 10yr) while documenting discrete value (47.62L)
    primaryHLV = realRatePV;
  }

  // Limit case explanation documenting both conventions
  const limitExplanation = isLimitCase
    ? `Equal-rate case (g = r = ${(g * 100).toFixed(1)}%): Real-rate model (zero real discount rate) yields ₹${(realRatePV / 100000).toFixed(2)} Lakhs (n × C). Discrete end-of-year discounting yields ₹${(discretePV / 100000).toFixed(2)} Lakhs due to initial 1-year discounting lag.`
    : undefined;

  // Round to nearest 50,000 for realistic financial planning display
  const roundedHLV = Math.round(primaryHLV / 50000) * 50000;

  return {
    annualIncome: Math.round(annualIncome),
    annualSelfExpense: Math.round(annualSelfExpense),
    annualFamilyContribution: Math.round(annualFamilyContribution),
    workingYearsRemaining,
    incomeGrowthRate: g,
    discountRate: r,
    humanLifeValue: Math.round(primaryHLV),
    discretePV: Math.round(discretePV),
    realRatePV: Math.round(realRatePV),
    roundedHLV,
    cashflowProjection,
    isLimitCaseApplied: isLimitCase,
    limitExplanation,
  };
}

/**
 * Calculates Net Life Insurance Needs based on Liabilities, Future Family Living Expenses,
 * Long-term Goals, minus Available Financial Assets and Existing Policies.
 */
export function calculateNetNeeds(assessment: FinancialAssessment): NetNeedsCalculation {
  // 1. Total Liabilities
  const totalLiabilities = Math.max(0,
    (assessment.outstandingHomeLoan || 0) +
    (assessment.outstandingVehicleLoan || 0) +
    (assessment.outstandingPersonalLoan || 0) +
    (assessment.outstandingEducationLoan || 0) +
    (assessment.otherDebts || 0)
  );

  // 2. Immediate Expenses & Emergency Buffer
  const monthlyLiving = assessment.familyMonthlyLivingExpense || 
    Math.round(((assessment.monthlyTakeHomeIncome || 0) * (1 - (assessment.personalExpensePercentage ?? 25) / 100)));
  const emergencyMonths = Math.max(3, assessment.immediateEmergencyBufferMonths || 6);

  const immediateExpenses = assessment.directImmediateExpenses !== undefined
    ? Math.max(0, assessment.directImmediateExpenses)
    : (monthlyLiving * emergencyMonths) + (assessment.finalExpensesBuffer || 300000);

  // 3. Future Family Support (Living Expenses Capitalized for support horizon)
  // Adjusted for real rate of return = (1 + r) / (1 + inflation) - 1
  let familySupportPV = 0;
  if (assessment.directFamilySupportPV !== undefined) {
    familySupportPV = Math.max(0, assessment.directFamilySupportPV);
  } else {
    const annualLivingExpense = monthlyLiving * 12;
    const inflation = assessment.assumedInflationRate ?? 0.06;
    const returnRate = assessment.assumedInvestmentReturnRate ?? 0.08;
    const realRate = (1 + returnRate) / (1 + inflation) - 1;
    const years = Math.max(1, assessment.yearsOfFamilySupportNeeded || 15);

    if (Math.abs(realRate) < 0.001) {
      familySupportPV = annualLivingExpense * years;
    } else {
      familySupportPV = annualLivingExpense * ((1 - Math.pow(1 + realRate, -years)) / realRate);
    }
  }

  // 4. Future Education & Milestone Goals
  const futureEducationAndMilestones = Math.max(0,
    (assessment.childrenEducationTotal || 0) +
    (assessment.marriageOrMilestoneGoals || 0)
  );

  const totalFinancialNeeds = Math.round(
    totalLiabilities + immediateExpenses + familySupportPV + futureEducationAndMilestones
  );

  // 5. Available Financial Resources
  const allocatedFinancialAssets = Math.max(0,
    (assessment.liquidSavingsAndFD || 0) +
    (assessment.equityAndMutualFunds || 0) +
    (assessment.retirementCorpusAllocable || 0) +
    (assessment.otherLiquidInvestments || 0)
  );

  // Existing insurance: term is 100%, traditional 100%, employer group discounted to 50%
  const totalExistingCover = Math.max(0,
    (assessment.existingIndividualTermCover || 0) +
    (assessment.existingTraditionalLifeCover || 0) +
    Math.round((assessment.existingEmployerGroupCover || 0) * 0.5)
  );

  const totalAvailableResources = allocatedFinancialAssets + totalExistingCover;

  // 6. Net Gap Calculation
  const rawGap = totalFinancialNeeds - totalAvailableResources;
  const netLifeInsuranceGap = Math.max(0, rawGap);
  const estimatedSurplus = Math.max(0, totalAvailableResources - totalFinancialNeeds);

  let coverageStatus: 'underinsured' | 'adequately_insured' | 'surplus' = 'underinsured';
  if (rawGap < 0) {
    // Total available resources strictly exceed total obligations => true surplus
    coverageStatus = 'surplus';
  } else if (rawGap === 0) {
    // Exact coverage: 100% covered, gap is 0, surplus is 0
    coverageStatus = 'adequately_insured';
  } else if (totalFinancialNeeds > 0 && rawGap <= totalFinancialNeeds * 0.15) {
    // Minor gap within 15% margin
    coverageStatus = 'adequately_insured';
  } else {
    // Significant coverage gap
    coverageStatus = 'underinsured';
  }

  const coverageRatioPercentage = totalFinancialNeeds > 0
    ? Math.max(0, Math.min(200, Math.round((totalAvailableResources / totalFinancialNeeds) * 100)))
    : 100;

  // Recommended cover rounded up to nearest 5 Lakhs
  const roundedRecommended = netLifeInsuranceGap > 0
    ? Math.ceil(netLifeInsuranceGap / 500000) * 500000
    : 0;

  return {
    totalLiabilities: Math.round(totalLiabilities),
    immediateExpenses: Math.round(immediateExpenses),
    familySupportPV: Math.round(familySupportPV),
    futureEducationAndMilestones: Math.round(futureEducationAndMilestones),
    totalFinancialNeeds,
    allocatedFinancialAssets: Math.round(allocatedFinancialAssets),
    totalExistingCover: Math.round(totalExistingCover),
    totalAvailableResources: Math.round(totalAvailableResources),
    netLifeInsuranceGap: Math.round(netLifeInsuranceGap),
    estimatedSurplus: Math.round(estimatedSurplus),
    coverageStatus,
    coverageRatioPercentage,
    recommendedCover: roundedRecommended,
  };
}

/**
 * Combines HLV and Net Needs into a unified recommendation analysis.
 */
export function analyzeCombinedNeeds(
  assessment: FinancialAssessment,
  hlv: HLVCalculation,
  netNeeds: NetNeedsCalculation
): CombinedNeedsAnalysis {
  const divergence = hlv.humanLifeValue > 0
    ? Math.round(((Math.abs(hlv.humanLifeValue - netNeeds.netLifeInsuranceGap)) / hlv.humanLifeValue) * 100)
    : 0;

  // We choose Net Needs as the primary baseline for pragmatic immediate coverage,
  // with HLV as the aspirational upper ceiling of economic potential.
  const primaryRecommendationAmount = netNeeds.recommendedCover > 0
    ? netNeeds.recommendedCover
    : Math.min(hlv.roundedHLV, 10000000); // 1 Cr fallback if net needs is zero but user has income

  let rationale = '';
  if (netNeeds.netLifeInsuranceGap > 0) {
    rationale = `Your Net Needs analysis indicates an immediate financial gap of ₹${(netNeeds.netLifeInsuranceGap / 100000).toFixed(1)} Lakhs to protect liabilities and dependent living horizons. Your Human Life Value (economic earning potential) is ₹${(hlv.roundedHLV / 100000).toFixed(1)} Lakhs. We recommend securing at least ₹${(primaryRecommendationAmount / 100000).toFixed(1)} Lakhs in pure term cover.`;
  } else {
    rationale = `Your current assets and existing policies satisfy your estimated liabilities and dependent living expenses. However, to hedge your personal earning potential of ₹${(hlv.roundedHLV / 100000).toFixed(1)} Lakhs against unforeseen health crises or career milestones, an affordable supplementary term plan is beneficial.`;
  }

  return {
    hlv,
    netNeeds,
    divergencePercentage: divergence,
    primaryRecommendationAmount,
    rationale,
  };
}

/**
 * Generates tailored product recommendations comparing Term, Whole Life, Endowment, and ULIP.
 */
export function generateProductRecommendations(
  assessment: FinancialAssessment,
  combined: CombinedNeedsAnalysis
): ProductRecommendation[] {
  const recommendedCover = Math.max(5000000, combined.primaryRecommendationAmount || 10000000); // Default min 50L
  const age = assessment.currentAge;
  const tenure = Math.max(10, Math.min(40, assessment.retirementAge - age + 5));

  // Term estimation: approx ₹1000-1400 per 10 Lakhs per year for age 30, scaling with age
  const baseRatePerLakh = (age < 30 ? 110 : age < 40 ? 150 : age < 50 ? 270 : 450);
  const termMin = Math.round((recommendedCover / 100000) * baseRatePerLakh);
  const termMax = Math.round(termMin * 1.35);

  const recommendations: ProductRecommendation[] = [
    {
      id: 'prod-term',
      category: 'term',
      title: 'Pure Term Life Insurance',
      tagline: 'Maximum financial protection at the lowest guaranteed premium rate.',
      matchScore: 98,
      isTopPick: true,
      recommendedSumAssured: recommendedCover,
      recommendedTenureYears: tenure,
      estimatedAnnualPremiumMin: termMin,
      estimatedAnnualPremiumMax: termMax,
      keyBenefits: [
        'Highest sum assured coverage per rupee spent',
        'Separates protection from investment, allowing maximum wealth creation in mutual funds',
        'Tax deductions under Section 80C and tax-free claim under 10(10D)',
        'Option to add Critical Illness, Accidental Total Disability, and Waiver of Premium riders',
      ],
      tradeOffs: [
        'Zero maturity value if the insured outlives the policy tenure (pure risk transfer)',
        'Requires rigorous medical underwriting at higher sum assured',
      ],
      affordabilityStatus: 'highly_affordable',
      bestSuitedFor: 'Income earners with outstanding liabilities, children education goals, and dependent parents needing large income replacement.',
      ridersRecommended: ['Critical Illness (Accelerated)', 'Accidental Death & Disability', 'Waiver of Premium on Disability'],
    },
    {
      id: 'prod-whole-life',
      category: 'whole_life',
      title: 'Whole Life Insurance Plan',
      tagline: 'Lifelong coverage extending up to age 99 or 100 for legacy and estate planning.',
      matchScore: 74,
      isTopPick: false,
      recommendedSumAssured: Math.round(recommendedCover * 0.5), // Lower cover due to steep premiums
      recommendedTenureYears: 100 - age,
      estimatedAnnualPremiumMin: termMin * 4,
      estimatedAnnualPremiumMax: termMax * 4.5,
      keyBenefits: [
        'Lifelong protection guaranteeing death benefit payout whenever death occurs',
        'Accumulates guaranteed cash surrender value and bonus payouts in later years',
        'Effective vehicle for generational wealth transfer and estate tax planning',
      ],
      tradeOffs: [
        '4x to 6x higher premium compared to pure term insurance for the same cover',
        'High lock-in; early surrender yields substantial penalties',
      ],
      affordabilityStatus: 'premium_heavy',
      bestSuitedFor: 'HNIs and individuals seeking inheritance creation or caring for lifelong special-needs dependents.',
      ridersRecommended: ['Critical Illness Rider', 'Accident Rider'],
    },
    {
      id: 'prod-ulip',
      category: 'ulip',
      title: 'Unit Linked Insurance Plan (ULIP)',
      tagline: 'Market-linked wealth growth combined with life protection and flexible fund switching.',
      matchScore: 68,
      isTopPick: false,
      recommendedSumAssured: Math.round(recommendedCover * 0.4),
      recommendedTenureYears: 15,
      estimatedAnnualPremiumMin: Math.max(60000, termMin * 3),
      estimatedAnnualPremiumMax: Math.max(120000, termMax * 3.5),
      keyBenefits: [
        'Dual benefit of life cover and equity/debt market compounding',
        'Tax-free switching between equity and debt asset classes under Section 10(10D)',
        'Modern 4th gen ULIPs refund mortality charges upon policy maturity',
      ],
      tradeOffs: [
        'Sub-optimal life cover (typically 10x annual premium, which is inadequate for breadwinners)',
        'Subject to market volatility; 5-year mandatory lock-in period',
      ],
      affordabilityStatus: 'moderate',
      bestSuitedFor: 'Disciplined investors comfortable with market risk who want long-term tax-exempt equity compounding.',
      ridersRecommended: ['Accidental Death Benefit'],
    },
    {
      id: 'prod-endowment',
      category: 'endowment',
      title: 'Endowment & Guaranteed Savings Plan',
      tagline: 'Guaranteed lump sum maturity payout combined with moderate life protection.',
      matchScore: 56,
      isTopPick: false,
      recommendedSumAssured: Math.round(recommendedCover * 0.25),
      recommendedTenureYears: 20,
      estimatedAnnualPremiumMin: termMin * 5,
      estimatedAnnualPremiumMax: termMax * 6,
      keyBenefits: [
        'Guaranteed maturity corpus with declared annual reversionary bonuses',
        'Strict forced savings mechanism with zero equity risk',
        'Eligible for policy loans against accrued surrender value after 2-3 years',
      ],
      tradeOffs: [
        'Low internal rate of return (historically 4.5% to 5.5%, barely matching consumer inflation)',
        'Severely under-insures family if treated as the primary life insurance policy',
      ],
      affordabilityStatus: 'premium_heavy',
      bestSuitedFor: 'Extremely conservative investors requiring guaranteed capital preservation for specific near-term dates.',
      ridersRecommended: ['Term Rider Extension', 'Critical Illness'],
    },
  ];

  return recommendations;
}

/**
 * Simulates Policy Lab interactive sliders: cover amount, tenure, frequency, and riders.
 */
export function calculatePolicyLab(
  config: PolicyLabConfig,
  currentAge: number,
  monthlyIncome: number
): PolicyLabResult {
  const age = Math.max(18, currentAge);
  const baseRatePerLakh = (age < 30 ? 115 : age < 40 ? 160 : age < 50 ? 280 : 460);
  const smokerMultiplier = config.isSmoker ? 1.55 : 1.0;

  // Base term annual premium
  let annualBase = (config.coverAmount / 100000) * baseRatePerLakh * smokerMultiplier;

  // Payment term adjustment: limited pay 10yr compresses premiums into 10 installments
  if (config.paymentTerm === 'limited_10yr') {
    annualBase *= 1.65;
  } else if (config.paymentTerm === 'pay_to_60') {
    const yearsTo60 = Math.max(5, 60 - age);
    if (yearsTo60 < config.tenureYears) {
      annualBase *= (config.tenureYears / yearsTo60) * 0.95;
    }
  }

  // Rider premiums
  let ciPremium = 0;
  if (config.hasCriticalIllnessRider && config.criticalIllnessCover > 0) {
    // Approx ₹350 per lakh of CI cover
    ciPremium = (config.criticalIllnessCover / 100000) * 360 * (age > 40 ? 1.4 : 1.0);
  }

  let adbPremium = 0;
  if (config.hasAccidentalDeathRider && config.accidentalDeathCover > 0) {
    // Approx ₹60 per lakh of accidental cover
    adbPremium = (config.accidentalDeathCover / 100000) * 65;
  }

  let wopPremium = 0;
  if (config.hasWaiverOfPremium) {
    wopPremium = (annualBase + ciPremium + adbPremium) * 0.045; // ~4.5% of total
  }

  const totalAnnual = Math.round(annualBase + ciPremium + adbPremium + wopPremium);

  // Periodic installment
  let installment = totalAnnual;
  if (config.paymentFrequency === 'monthly') {
    installment = Math.round((totalAnnual / 12) * 1.03); // Slight 3% monthly administration load
  } else if (config.paymentFrequency === 'quarterly') {
    installment = Math.round((totalAnnual / 4) * 1.02);
  }

  const annualIncome = Math.max(1, monthlyIncome * 12);
  const premiumToIncomeRatio = Number(((totalAnnual / annualIncome) * 100).toFixed(2));
  
  // 80C Tax savings (assuming 30% tax slab, capped at 1.5L 80C limit)
  const taxSavings = Math.round(Math.min(150000, totalAnnual) * 0.312); // 30% + 4% cess

  return {
    estimatedAnnualBasePremium: Math.round(annualBase),
    riderPremiums: {
      criticalIllness: Math.round(ciPremium),
      accidentalDeath: Math.round(adbPremium),
      waiverOfPremium: Math.round(wopPremium),
    },
    totalAnnualPremium: totalAnnual,
    periodicInstallment: installment,
    premiumToIncomeRatio,
    taxSavings80CEstimated: taxSavings,
  };
}

/**
 * Simulates real-life milestone scenarios and their immediate impact on insurance gap.
 */
export function simulateLifeScenario(
  baseAssessment: FinancialAssessment,
  scenario: LifeScenarioType
): LifeScenarioSimulation {
  const baseNet = calculateNetNeeds(baseAssessment);
  const originalGap = baseNet.netLifeInsuranceGap;

  let deltaNeeds = 0;
  let deltaAssets = 0;
  let title = '';
  let description = '';
  let actionPlan: string[] = [];

  switch (scenario) {
    case 'new_child':
      title = 'Arrival of a New Child / Adoption';
      description = 'Welcoming a child increases family support duration, living expenses, and requires dedicated higher education funding.';
      deltaNeeds = 3000000 + (15000 * 12 * 18 * 0.6); // ~₹30L higher education + monthly living buffer
      actionPlan = [
        'Increase life insurance sum assured by ₹45 - ₹50 Lakhs immediately',
        'Add child as a named secondary beneficiary/nominee in existing policies',
        'Opt for a Waiver of Premium (WOP) rider to keep coverage active if parent suffers disability',
      ];
      break;

    case 'home_loan_taken':
      title = 'New Home Purchase (₹60 Lakh Mortgage)';
      description = 'Purchasing a home with long-term mortgage creates an immediate debt liability on surviving family if unhedged.';
      deltaNeeds = 6000000;
      actionPlan = [
        'Secure a pure term insurance policy matching the mortgage tenure (or assign policy under MWP Act)',
        'Avoid bundling expensive single-premium bank credit-life policies; independent term plans are 40% cheaper',
        'Ensure joint co-borrower is covered proportional to income contribution',
      ];
      break;

    case 'early_retirement':
      title = 'Targeting Early Retirement at Age 50';
      description = 'Shortening the active earning horizon reduces working years but necessitates faster capital compounding for living expenses.';
      deltaNeeds = -1500000; // Fewer working years of economic loss
      deltaAssets = 1000000; // Accelerated savings
      actionPlan = [
        'Align policy tenure to terminate exactly at your target retirement age (age 50)',
        'Shift insurance budget toward aggressive debt-free living and healthcare buffers',
        'Review critical illness coverage as health risks rise post-50',
      ];
      break;

    case 'spouse_starts_earning':
      title = 'Spouse Enters Workforce (₹70,000/mo Income)';
      description = 'Dual-income household reduces dependence on a single breadwinner and increases family cash flow resilience.';
      deltaNeeds = -3500000;
      deltaAssets = 500000;
      actionPlan = [
        'Both partners should maintain separate individual term covers matching their income ratios',
        'Existing primary breadwinner cover can be optimized, or redirected toward child university trusts',
        'Consider a joint-life term option or individual mirror term plans for maximum tax efficiency',
      ];
      break;

    case 'inheritance_windfall':
      title = 'Liquid Inheritance / Asset Windfall (₹40 Lakhs)';
      description = 'Receiving a substantial liquid inheritance immediately boosts earmarked financial assets, reducing net unhedged risk.';
      deltaNeeds = 0;
      deltaAssets = 4000000;
      actionPlan = [
        'Use windfall to liquidate high-interest personal or car loans first',
        'Your net protection gap drops directly by ₹40 Lakhs, freeing monthly budget for higher savings',
        'Do not cancel existing low-cost term plans acquired at younger age rates',
      ];
      break;
  }

  const newTotalNeeds = Math.max(0, baseNet.totalFinancialNeeds + deltaNeeds);
  const newTotalAssets = Math.max(0, baseNet.totalAvailableResources + deltaAssets);
  const newGap = Math.max(0, newTotalNeeds - newTotalAssets);
  const gapDifference = newGap - originalGap;

  return {
    scenarioId: scenario,
    title,
    description,
    deltaNeeds: Math.round(deltaNeeds),
    deltaAssets: Math.round(deltaAssets),
    newGap: Math.round(newGap),
    gapDifference: Math.round(gapDifference),
    actionPlan,
  };
}

/**
 * Simulates adding a specific education goal amount (Reference Scenario Test: baseline gap + goal = new gap).
 */
export function simulateEducationGoalScenario(
  baseAssessment: FinancialAssessment,
  additionalEducationAmount: number
): { originalGap: number; newGap: number; gapDifference: number } {
  const baseNet = calculateNetNeeds(baseAssessment);
  const updatedAssessment: FinancialAssessment = {
    ...baseAssessment,
    childrenEducationTotal: (baseAssessment.childrenEducationTotal || 0) + additionalEducationAmount,
  };
  const updatedNet = calculateNetNeeds(updatedAssessment);
  return {
    originalGap: baseNet.netLifeInsuranceGap,
    newGap: updatedNet.netLifeInsuranceGap,
    gapDifference: updatedNet.netLifeInsuranceGap - baseNet.netLifeInsuranceGap,
  };
}

/**
 * Fictional certified financial advisors available for digital scheduling.
 */
export const CERTIFIED_ADVISORS = [
  {
    id: 'adv-1',
    name: 'Ananya Deshmukh, CFP®',
    title: 'Chartered Financial Planner & Life Protection Specialist',
    experienceYears: 12,
    certifications: ['CFP (FPSB)', 'IRDAI Life Licensee', 'SEBI RIA Reg.'],
    rating: 4.95,
    totalConsultations: 1420,
    avatarColor: 'from-blue-600 to-indigo-700',
    languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    id: 'adv-2',
    name: 'Raghavan S. Iyer',
    title: 'Senior Estate & Insurance Advisory Director',
    experienceYears: 18,
    certifications: ['Fellow of Insurance Institute of India (FIII)', 'ChFC®'],
    rating: 4.92,
    totalConsultations: 2150,
    avatarColor: 'from-emerald-600 to-teal-700',
    languages: ['English', 'Tamil', 'Telugu', 'Hindi'],
  },
  {
    id: 'adv-3',
    name: 'Dr. Meera Sen, PhD (Fin)',
    title: 'Actuarial Risk Strategist & Family Wealth Advisor',
    experienceYears: 15,
    certifications: ['Associate Actuary (IAI)', 'CFP®'],
    rating: 4.98,
    totalConsultations: 980,
    avatarColor: 'from-purple-600 to-violet-800',
    languages: ['English', 'Bengali', 'Hindi'],
  },
];
