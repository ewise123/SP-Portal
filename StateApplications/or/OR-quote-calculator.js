// Minimal OR quote calculator
function calculateMNQuote(params) {
  const maleEmployees = Number(params.maleEmployees || 0);
  const femaleEmployees = Number(params.femaleEmployees || 0);
  const totalEmployees = maleEmployees + femaleEmployees;
  const employeesOverCap = Number(params.employeesOverCap || 0);
  const payrollBelowCap = Number(params.payrollBelowCap || 0);
  const billingOption = params.billingOption === 'quarterly' ? 'quarterly' : 'annual';

  const WAGE_LIMIT = 184500; // Social Security wage limit
  // OR ShelterPoint rate: 0.54%
  const SHELTERPOINT_RATE = 0.0054;
  // OR State plan rate: 0.6%
  const STATE_PLAN_RATE = 0.006;

  // ShelterPoint quote
  const annualTotal = (employeesOverCap * WAGE_LIMIT * SHELTERPOINT_RATE) + (payrollBelowCap * SHELTERPOINT_RATE);
  const displayAmount = billingOption === 'quarterly' ? (annualTotal / 4) : annualTotal;

  // State plan price
  const statePlanAnnualTotal = (employeesOverCap * WAGE_LIMIT * STATE_PLAN_RATE) + (payrollBelowCap * STATE_PLAN_RATE);
  const statePlanDisplayAmount = billingOption === 'quarterly' ? (statePlanAnnualTotal / 4) : statePlanAnnualTotal;

  // Savings from state plan
  const savings = statePlanDisplayAmount - displayAmount;

  return {
    displayAmount: displayAmount,
    billingPeriod: billingOption === 'quarterly' ? 'quarter' : 'year',
    breakdown: {
      base: 0,
      totalEmployees,
      employeesOverCap,
      payrollBelowCap,
      totalCost: displayAmount,
      statePlanPrice: statePlanDisplayAmount,
      savings: savings,
    },
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

// Expose globals for non-module usage
window.calculateMNQuote = calculateMNQuote;
window.formatCurrency = formatCurrency;



