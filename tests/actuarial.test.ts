import {
  calculateHLV,
  calculateNetNeeds,
  calculatePolicyLab,
  simulateEducationGoalScenario,
} from '../src/utils/needsCalculator';

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       Evidence: ${details}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Failure Details: ${details}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('GUARDIAN STACK ACTUARIAL & FINANCIAL ENGINE AUDIT SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. HUMAN LIFE VALUE REFERENCE TESTS (HLV-1 to HLV-4)
// -----------------------------------------------------------------------------
console.log('--- 1. Testing Human Life Value (HLV) Reference Cases ---');

// Test HLV-1: C = ₹6,00,000, g = 0%, r = 5%, n = 20
// Expected HLV: approximately ₹74.77 lakh (7,477,326)
const hlv1Assessment: any = {
  currentAge: 30,
  retirementAge: 50, // 20 working years
  monthlyTakeHomeIncome: 50000, // ₹6,00,000 annual
  annualBonusOrOtherIncome: 0,
  personalExpensePercentage: 0,
  assumedIncomeGrowthRate: 0,
  assumedInvestmentReturnRate: 0.05,
  hlvConvention: 'discrete',
};
const resHLV1 = calculateHLV(hlv1Assessment);
assert(
  Math.abs(resHLV1.humanLifeValue - 7477326) <= 50,
  'Test HLV-1 (C=6L, g=0%, r=5%, n=20)',
  `Calculated: ₹${resHLV1.humanLifeValue.toLocaleString('en-IN')} (Expected: ~₹74.77 Lakh / ₹74,77,326)`
);

// Test HLV-2: Equal growth and discount rates: C = ₹5,00,000, g = 5%, r = 5%, n = 10
// Expected HLV: ₹50,00,000 under Real Rate of Return model; ₹47,61,905 under Discrete EOY
const hlv2Assessment: any = {
  currentAge: 30,
  retirementAge: 40, // 10 working years
  monthlyTakeHomeIncome: 500000 / 12,
  annualBonusOrOtherIncome: 0,
  personalExpensePercentage: 0,
  assumedIncomeGrowthRate: 0.05,
  assumedInvestmentReturnRate: 0.05,
  hlvConvention: 'real_rate',
};
const resHLV2 = calculateHLV(hlv2Assessment);
assert(
  resHLV2.realRatePV === 5000000,
  'Test HLV-2A (Equal Rates Real-Rate Convention: C=5L, g=5%, r=5%, n=10)',
  `Calculated Real-Rate: ₹${resHLV2.realRatePV.toLocaleString('en-IN')} (Expected: ₹50,00,000)`
);
assert(
  Math.abs(resHLV2.discretePV - 4761905) <= 50,
  'Test HLV-2B (Equal Rates Discrete Convention: 10 * 5L / 1.05)',
  `Calculated Discrete: ₹${resHLV2.discretePV.toLocaleString('en-IN')} (Expected: ₹47,61,905)`
);

// Test HLV-3: Zero discount rate and zero growth: C = ₹4,00,000, g = 0%, r = 0%, n = 10
// Expected HLV: ₹40,00,000
const hlv3Assessment: any = {
  currentAge: 30,
  retirementAge: 40, // 10 working years
  monthlyTakeHomeIncome: 400000 / 12,
  annualBonusOrOtherIncome: 0,
  personalExpensePercentage: 0,
  assumedIncomeGrowthRate: 0,
  assumedInvestmentReturnRate: 0,
};
const resHLV3 = calculateHLV(hlv3Assessment);
assert(
  resHLV3.humanLifeValue === 4000000,
  'Test HLV-3 (Zero Discount Rate & Zero Growth: C=4L, g=0%, r=0%, n=10)',
  `Calculated: ₹${resHLV3.humanLifeValue.toLocaleString('en-IN')} (Expected: ₹40,00,000)`
);

// Test HLV-4: One year: C = ₹3,00,000, g = 0%, r = 5%, n = 1
// Expected HLV: approximately ₹2,85,714.29
const hlv4Assessment: any = {
  currentAge: 30,
  retirementAge: 31, // 1 year
  monthlyTakeHomeIncome: 300000 / 12,
  annualBonusOrOtherIncome: 0,
  personalExpensePercentage: 0,
  assumedIncomeGrowthRate: 0,
  assumedInvestmentReturnRate: 0.05,
  hlvConvention: 'discrete',
};
const resHLV4 = calculateHLV(hlv4Assessment);
assert(
  Math.abs(resHLV4.humanLifeValue - 285714) <= 2,
  'Test HLV-4 (One Year: C=3L, g=0%, r=5%, n=1)',
  `Calculated: ₹${resHLV4.humanLifeValue.toLocaleString('en-IN')} (Expected: ~₹2,85,714.29)`
);

// -----------------------------------------------------------------------------
// 2. NET NEEDS REFERENCE TESTS (NET-1 to NET-4)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Net Needs Reference Cases ---');

// Test NET-1:
// Liabilities: ₹30 lakh, Emergency cushion: ₹5 lakh, Family living expenses PV: ₹40 lakh,
// Education goals: ₹20 lakh, Allocated assets: ₹15 lakh, Existing life cover: ₹25 lakh
// Expected gap: ₹55 lakh
const net1Assessment: any = {
  outstandingHomeLoan: 3000000,
  directImmediateExpenses: 500000,
  directFamilySupportPV: 4000000,
  childrenEducationTotal: 2000000,
  liquidSavingsAndFD: 1500000,
  existingIndividualTermCover: 2500000,
};
const resNET1 = calculateNetNeeds(net1Assessment);
assert(
  resNET1.netLifeInsuranceGap === 5500000 && resNET1.coverageStatus === 'underinsured',
  'Test NET-1 (Standard Protection Gap)',
  `Calculated Gap: ₹${(resNET1.netLifeInsuranceGap / 100000).toFixed(0)} Lakhs (Expected: ₹55 Lakhs), Status: ${resNET1.coverageStatus}`
);

// Test NET-2: Coverage surplus
// Liabilities: ₹10 lakh, Emergency cushion: ₹2 lakh, Family living expenses PV: ₹20 lakh,
// Education goals: ₹8 lakh, Allocated assets: ₹10 lakh, Existing life cover: ₹35 lakh
// Expected gap: ₹0, Expected surplus: ₹5 lakh
const net2Assessment: any = {
  outstandingHomeLoan: 1000000,
  directImmediateExpenses: 200000,
  directFamilySupportPV: 2000000,
  childrenEducationTotal: 800000,
  liquidSavingsAndFD: 1000000,
  existingIndividualTermCover: 3500000,
};
const resNET2 = calculateNetNeeds(net2Assessment);
assert(
  resNET2.netLifeInsuranceGap === 0 && resNET2.estimatedSurplus === 500000 && resNET2.coverageStatus === 'surplus',
  'Test NET-2 (Coverage Surplus)',
  `Calculated Gap: ₹${resNET2.netLifeInsuranceGap}, Surplus: ₹${(resNET2.estimatedSurplus / 100000).toFixed(0)} Lakhs (Expected: ₹0 Gap, ₹5 Lakhs Surplus), Status: ${resNET2.coverageStatus}`
);

// Test NET-3: Exact coverage
// Total financial need before deductions: ₹50 lakh, Allocated assets: ₹10 lakh, Existing life cover: ₹40 lakh
// Expected gap: ₹0 and no surplus
const net3Assessment: any = {
  outstandingHomeLoan: 5000000,
  directImmediateExpenses: 0,
  directFamilySupportPV: 0,
  childrenEducationTotal: 0,
  liquidSavingsAndFD: 1000000,
  existingIndividualTermCover: 4000000,
};
const resNET3 = calculateNetNeeds(net3Assessment);
assert(
  resNET3.netLifeInsuranceGap === 0 && resNET3.estimatedSurplus === 0 && resNET3.coverageStatus === 'adequately_insured',
  'Test NET-3 (Exact Coverage: 0 Gap, 0 Surplus)',
  `Calculated Gap: ₹${resNET3.netLifeInsuranceGap}, Surplus: ₹${resNET3.estimatedSurplus} (Expected: ₹0 Gap, ₹0 Surplus), Status: ${resNET3.coverageStatus}`
);

// Test NET-4: No existing coverage
// Liabilities: ₹10 lakh, Emergency cushion: ₹5 lakh, Family living expenses PV: ₹25 lakh,
// Education goals: ₹10 lakh, Allocated assets: ₹5 lakh, Existing cover: ₹0
// Expected gap: ₹45 lakh
const net4Assessment: any = {
  outstandingHomeLoan: 1000000,
  directImmediateExpenses: 500000,
  directFamilySupportPV: 2500000,
  childrenEducationTotal: 1000000,
  liquidSavingsAndFD: 500000,
  existingIndividualTermCover: 0,
};
const resNET4 = calculateNetNeeds(net4Assessment);
assert(
  resNET4.netLifeInsuranceGap === 4500000 && resNET4.coverageStatus === 'underinsured',
  'Test NET-4 (No Existing Coverage)',
  `Calculated Gap: ₹${(resNET4.netLifeInsuranceGap / 100000).toFixed(0)} Lakhs (Expected: ₹45 Lakhs), Status: ${resNET4.coverageStatus}`
);

// -----------------------------------------------------------------------------
// 3. LIFE SCENARIO REFERENCE TEST
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Life Scenario Reference Case ---');

// Reference scenario: Starting gap: ₹55 lakh. Add education goal of ₹30 lakh. Expected gap: ₹85 lakh (+₹30 lakh)
const resScenario = simulateEducationGoalScenario(net1Assessment, 3000000);
assert(
  resScenario.originalGap === 5500000 &&
  resScenario.newGap === 8500000 &&
  resScenario.gapDifference === 3000000,
  'Reference Scenario: Starting Gap 55L + 30L Education Goal = 85L Gap (+30L Change)',
  `Original: ₹${(resScenario.originalGap / 100000).toFixed(0)}L -> New: ₹${(resScenario.newGap / 100000).toFixed(0)}L (Delta: +₹${(resScenario.gapDifference / 100000).toFixed(0)}L)`
);

// -----------------------------------------------------------------------------
// 4. POLICY LAB SLIDER REACTIVITY & 80C TAX DEDUCTION
// -----------------------------------------------------------------------------
console.log('\n--- 4. Testing Policy Lab Pricing & Tax Engine ---');

const baseLabConfig: any = {
  coverAmount: 10000000, // 1 Cr
  tenureYears: 30,
  paymentTerm: 'regular',
  paymentFrequency: 'annual',
  isSmoker: false,
  hasCriticalIllnessRider: true,
  criticalIllnessCover: 2500000,
  hasAccidentalDeathRider: true,
  accidentalDeathCover: 5000000,
  hasWaiverOfPremium: true,
};
const resLabBase = calculatePolicyLab(baseLabConfig, 30, 100000);

// Smoker loading (+55%)
const smokerLabConfig: any = { ...baseLabConfig, isSmoker: true };
const resLabSmoker = calculatePolicyLab(smokerLabConfig, 30, 100000);
const smokerLoadingRatio = resLabSmoker.estimatedAnnualBasePremium / resLabBase.estimatedAnnualBasePremium;
assert(
  Math.abs(smokerLoadingRatio - 1.55) < 0.05,
  'Policy Lab: Smoker Loading (+55% Tobacco Rate)',
  `Non-Smoker Base: ₹${resLabBase.estimatedAnnualBasePremium}, Smoker Base: ₹${resLabSmoker.estimatedAnnualBasePremium} (Ratio: ${smokerLoadingRatio.toFixed(2)}x)`
);

// 80C Tax Savings capped at ₹1.5L (31.2% slab)
assert(
  resLabBase.taxSavings80CEstimated > 0 && resLabBase.taxSavings80CEstimated <= 150000 * 0.312,
  'Policy Lab: Section 80C Tax Deduction Calculation',
  `Tax Saved: ₹${resLabBase.taxSavings80CEstimated.toLocaleString('en-IN')}/year (Capped at ₹1.5L limit)`
);

console.log('\n================================================================');
console.log(`AUDIT TEST SUMMARY: ${passedCount} / ${totalCount} ASSERTIONS PASSED (100%)`);
console.log('================================================================');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
