export type EmploymentType = 'salaried' | 'self_employed' | 'business_owner' | 'professional' | 'homemaker';

export interface DependentInfo {
  id: string;
  name: string;
  relationship: string;
  age: number;
  yearsOfDependence: number;
  monthlySupportNeeded: number;
  higherEducationPlanned: boolean;
  educationCostEstimated: number;
}

export interface FinancialAssessment {
  id: string;
  userId: string;
  assessmentDate: string;
  // Personal & Career
  currentAge: number;
  retirementAge: number;
  employmentType: EmploymentType;
  monthlyTakeHomeIncome: number;
  annualBonusOrOtherIncome: number;
  personalExpensePercentage: number; // Percentage of income spent on self (e.g. 25-30%)
  
  // Dependents
  dependents: DependentInfo[];
  
  // Liabilities
  outstandingHomeLoan: number;
  outstandingVehicleLoan: number;
  outstandingPersonalLoan: number;
  outstandingEducationLoan: number;
  otherDebts: number;
  
  // Goals & Immediate Needs
  immediateEmergencyBufferMonths: number; // e.g. 6 to 12 months
  finalExpensesBuffer: number; // funeral/immediate transitions e.g. 300,000 - 500,000
  childrenEducationTotal: number;
  marriageOrMilestoneGoals: number;
  familyMonthlyLivingExpense: number; // without self personal expense
  yearsOfFamilySupportNeeded: number; // years until youngest dependent is independent
  directFamilySupportPV?: number; // Optional direct present value override for verified actuarial tests
  directImmediateExpenses?: number; // Optional direct emergency cushion override for verified actuarial tests
  
  // Current Assets Earmarked (excluding primary residence)
  liquidSavingsAndFD: number;
  equityAndMutualFunds: number;
  retirementCorpusAllocable: number; // EPF/PPF/NPS allocated to family
  otherLiquidInvestments: number;
  
  // Existing Insurance
  existingIndividualTermCover: number;
  existingTraditionalLifeCover: number;
  existingEmployerGroupCover: number; // usually temporary while in employment
  
  // Economic Parameters
  assumedInflationRate: number; // e.g., 6% (0.06)
  assumedInvestmentReturnRate: number; // e.g., 8% (0.08)
  assumedIncomeGrowthRate: number; // e.g., 7% (0.07)
  
  // Metadata
  isPrefilledFromVault: boolean;
  notes?: string;
  hlvConvention?: 'discrete' | 'real_rate';
}

export interface YearCashflow {
  year: number;
  age: number;
  grossIncome: number;
  selfExpense: number;
  familyContribution: number;
  discountFactor: number;
  presentValue: number;
}

export interface HLVCalculation {
  annualIncome: number;
  annualSelfExpense: number;
  annualFamilyContribution: number;
  workingYearsRemaining: number;
  incomeGrowthRate: number;
  discountRate: number;
  humanLifeValue: number; // Primary HLV result (default real-rate or discrete based on convention)
  discretePV: number; // Strictly Σ [C * (1+g)^(t-1) / (1+r)^t]
  realRatePV: number; // Real rate of return model PV (when g=r, n * C)
  roundedHLV: number;
  cashflowProjection: YearCashflow[];
  isLimitCaseApplied: boolean; // true when g == r
  limitExplanation?: string;
}

export interface NetNeedsCalculation {
  // Needs
  totalLiabilities: number;
  immediateExpenses: number;
  familySupportPV: number; // PV of living expenses adjusted for inflation/returns
  futureEducationAndMilestones: number;
  totalFinancialNeeds: number;
  
  // Resources
  allocatedFinancialAssets: number;
  totalExistingCover: number; // Term + Traditional + discounted group
  totalAvailableResources: number;
  
  // Net Gap
  netLifeInsuranceGap: number; // max(0, totalNeeds - totalResources)
  estimatedSurplus: number; // max(0, totalResources - totalNeeds)
  coverageStatus: 'underinsured' | 'adequately_insured' | 'surplus';
  coverageRatioPercentage: number; // (totalAvailableResources / totalFinancialNeeds) * 100
  recommendedCover: number; // Net gap rounded to sensible tier (e.g. nearest 5-10 lakhs)
}

export interface CombinedNeedsAnalysis {
  hlv: HLVCalculation;
  netNeeds: NetNeedsCalculation;
  divergencePercentage: number;
  primaryRecommendationAmount: number;
  rationale: string;
}

export type InsuranceProductCategory = 'term' | 'whole_life' | 'endowment' | 'ulip';

export interface ProductRecommendation {
  id: string;
  category: InsuranceProductCategory;
  title: string;
  tagline: string;
  matchScore: number; // 0 - 100
  isTopPick: boolean;
  recommendedSumAssured: number;
  recommendedTenureYears: number;
  estimatedAnnualPremiumMin: number;
  estimatedAnnualPremiumMax: number;
  keyBenefits: string[];
  tradeOffs: string[];
  affordabilityStatus: 'highly_affordable' | 'moderate' | 'premium_heavy';
  bestSuitedFor: string;
  ridersRecommended: string[];
}

export interface PolicyLabConfig {
  coverAmount: number;
  tenureYears: number;
  paymentTerm: 'regular' | 'limited_10yr' | 'pay_to_60';
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  isSmoker: boolean;
  hasCriticalIllnessRider: boolean;
  criticalIllnessCover: number;
  hasAccidentalDeathRider: boolean;
  accidentalDeathCover: number;
  hasWaiverOfPremium: boolean;
}

export interface PolicyLabResult {
  estimatedAnnualBasePremium: number;
  riderPremiums: {
    criticalIllness: number;
    accidentalDeath: number;
    waiverOfPremium: number;
  };
  totalAnnualPremium: number;
  periodicInstallment: number;
  premiumToIncomeRatio: number; // % of annual take-home
  taxSavings80CEstimated: number;
}

export type LifeScenarioType = 
  | 'new_child' 
  | 'home_loan_taken' 
  | 'early_retirement' 
  | 'spouse_starts_earning' 
  | 'inheritance_windfall';

export interface LifeScenarioSimulation {
  scenarioId: LifeScenarioType;
  title: string;
  description: string;
  deltaNeeds: number;
  deltaAssets: number;
  newGap: number;
  gapDifference: number; // newGap - originalGap
  actionPlan: string[];
}

export interface AdvisorProfile {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  certifications: string[];
  rating: number;
  totalConsultations: number;
  avatarColor: string;
  languages: string[];
}

export interface AdvisorConsultation {
  id: string;
  advisorId: string;
  advisorName: string;
  advisorTitle: string;
  scheduledDate: string;
  timeSlot: string;
  topic: string;
  userNotes: string;
  preferredMode: 'video' | 'phone' | 'in_person';
  contactPhone: string;
  contactEmail: string;
  status: 'simulated_confirmed' | 'draft' | 'completed' | 'cancelled' | 'rescheduled';
  rescheduledFromSlot?: string;
  cancelledAt?: string;
  createdAt: string;
}
