// Minimal MN quote calculator
export function calculateMNQuote(params) {
  const maleEmployees = Number(params.maleEmployees || 0);
  const femaleEmployees = Number(params.femaleEmployees || 0);
  const totalEmployees = maleEmployees + femaleEmployees;

  // Placeholder: no rating logic yet
  const annualTotal = 0;

  return {
    displayAmount: annualTotal,
    billingPeriod: params.billingOption === 'quarterly' ? 'quarter' : 'year',
    breakdown: {
      base: 0,
      totalEmployees,
      totalCost: annualTotal,
    },
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}


