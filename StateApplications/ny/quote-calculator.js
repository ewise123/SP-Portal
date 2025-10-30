/**
 * Quote Calculator for NY DBL & PFL Insurance - ShelterPoint 2026
 * Based on ShelterPoint Life's DBL/PFL & Enriched Options Rate Card
 * Rates effective 01/2021 for DBL, updated for 2026
 */

// Per capita monthly rates from ShelterPoint 2026 rate card
// Rates are per employee per month
const DBL_RATES = {
    // Statutory DBL
    statutory: {
        annual: {
            male: 1.50,
            female: 3.25,
            maleWithHospital: 1.65,
            femaleWithHospital: 3.55
        },
        quarterly: {
            male: 1.85,
            female: 3.90,
            maleWithHospital: 1.95,
            femaleWithHospital: 4.25
        }
    },
    
    // 1.5-times DBL (max benefit $255/week)
    'enriched1.5x': {
        annual: {
            male: 2.10,
            female: 4.35,
            maleWithHospital: 2.25,
            femaleWithHospital: 4.75
        },
        quarterly: {
            male: 2.45,
            female: 5.25,
            maleWithHospital: 2.60,
            femaleWithHospital: 5.70
        }
    },
    
    // 2-times DBL (max benefit $340/week)
    'enriched2x': {
        annual: {
            male: 2.55,
            female: 5.60,
            maleWithHospital: 2.75,
            femaleWithHospital: 6.00
        },
        quarterly: {
            male: 3.15,
            female: 6.70,
            maleWithHospital: 3.30,
            femaleWithHospital: 7.20
        }
    },
    
    // 3-times DBL (max benefit $510/week)
    'enriched3x': {
        annual: {
            male: 3.90,
            female: 8.55,
            maleWithHospital: 4.15,
            femaleWithHospital: 9.00
        },
        quarterly: {
            male: 4.75,
            female: 10.20,
            maleWithHospital: 4.95,
            femaleWithHospital: 10.75
        }
    },
    
    // 4-times DBL (max benefit $680/week)
    'enriched4x': {
        annual: {
            male: 7.60,
            female: 16.65,
            maleWithHospital: 8.40,
            femaleWithHospital: 17.15
        },
        quarterly: {
            male: 9.25,
            female: 19.80,
            maleWithHospital: 9.45,
            femaleWithHospital: 20.40
        }
    },
    
    // 5-times DBL (max benefit $850/week)
    'enriched5x': {
        annual: {
            male: 9.75,
            female: 21.40,
            maleWithHospital: 10.80,
            femaleWithHospital: 21.90
        },
        quarterly: {
            male: 11.90,
            female: 25.50,
            maleWithHospital: 12.10,
            femaleWithHospital: 26.05
        }
    }
};

// Paid Family Leave (PFL) rate - effective 2026
const PFL_RATE = {
    percentOfPayroll: 0.00432, // 0.432% of annualized wages
    annualCapPerEmployee: 411.91, // Maximum annual PFL contribution per employee
    nysaww: 95348.76 // NY State Average Weekly Wage annualized for 2026
};

// Minimum premiums
const MINIMUMS = {
    annualDBL: 125.00,
    quarterlyDBL: 35.00
};

// Optional benefits (if applicable - not shown in rate card but may be available)
const OPTIONAL_BENEFITS = {
    // AD&D (per employee per month) — $12/$24 annually => $1.00/$2.00 monthly
    addd50k: 1.00,
    addd100k: 2.00,
    
    // BaseLine Benefits (per employee per month) - $20 annually => $1.67 monthly
    termLife15k: 36 / 12, // $20 per person annually
    eap: 36 / 12,
    nurseHelpline: 54 / 12
};

/**
 * Calculate DBL premium based on employee gender mix
 * @param {number} maleCount - Number of male employees
 * @param {number} femaleCount - Number of female employees
 * @param {string} benefitTier - DBL benefit tier (statutory, enriched1.5x, etc.)
 * @param {string} billingType - Billing frequency (annual, quarterly)
 * @param {boolean} includeHospital - Whether to include In-Hospital rider
 * @returns {number} Monthly DBL premium
 */
function calculateDBLPremium(maleCount, femaleCount, benefitTier, billingType, includeHospital) {
    const tier = benefitTier || 'statutory';
    const billing = billingType === 'quarterly' ? 'quarterly' : 'annual';
    
    if (!DBL_RATES[tier]) {
        console.error('Invalid benefit tier:', tier);
        return 0;
    }
    
    const rates = DBL_RATES[tier][billing];
    
    let monthlyPremium = 0;
    
    if (includeHospital) {
        monthlyPremium = (maleCount * rates.maleWithHospital) + 
                        (femaleCount * rates.femaleWithHospital);
    } else {
        monthlyPremium = (maleCount * rates.male) + 
                        (femaleCount * rates.female);
    }
    
    return monthlyPremium;
}

/**
 * Calculate PFL premium based on employee count over NYSAWW and payroll below NYSAWW
 * @param {number} employeesOverNYSAWW - Number of employees over NYSAWW ($95,348.76)
 * @param {number} payrollBelowNYSAWW - Total annual payroll of employees below NYSAWW
 * @param {number} employeeCount - Total number of covered employees (for per-employee calculations)
 * @returns {Object} PFL premium breakdown (monthly, annual, perEmployee)
 */
function calculatePFLPremium(employeesOverNYSAWW, payrollBelowNYSAWW, employeeCount) {
    // Employees over NYSAWW: each pays the capped amount ($411.91 annually)
    const pflFromOverCap = (employeesOverNYSAWW || 0) * PFL_RATE.annualCapPerEmployee;
    
    // Employees below NYSAWW: 0.432% of their total annual payroll
    const payrollBelow = payrollBelowNYSAWW || 0;
    const pflFromBelowCap = payrollBelow * PFL_RATE.percentOfPayroll;
    
    // Total annual PFL
    const annualPFL = pflFromOverCap + pflFromBelowCap;
    
    const totalEmployeeCount = employeeCount || 0;
    
    return {
        annualTotal: annualPFL,
        monthlyTotal: annualPFL / 12,
        annualPerEmployee: totalEmployeeCount > 0 ? annualPFL / totalEmployeeCount : 0,
        monthlyPerEmployee: totalEmployeeCount > 0 ? annualPFL / 12 / totalEmployeeCount : 0,
        breakdown: {
            employeesOverCap: employeesOverNYSAWW || 0,
            pflFromOverCap: pflFromOverCap,
            payrollBelowCap: payrollBelow,
            pflFromBelowCap: pflFromBelowCap
        }
    };
}

/**
 * Calculate optional benefits cost
 * @param {number} employeeCount - Total number of employees
 * @param {Object} selections - Object with boolean flags for each optional benefit
 * @returns {number} Monthly cost for optional benefits
 */
function calculateOptionalBenefits(employeeCount, selections) {
    let monthlyTotal = 0;
    
    if (selections.termLife15k) {
        monthlyTotal += employeeCount * OPTIONAL_BENEFITS.termLife15k;
    }
    if (selections.eap) {
        monthlyTotal += employeeCount * OPTIONAL_BENEFITS.eap;
    }
    if (selections.nurseHelpline) {
        monthlyTotal += employeeCount * OPTIONAL_BENEFITS.nurseHelpline;
    }
    if (selections.addd50k) {
        monthlyTotal += employeeCount * OPTIONAL_BENEFITS.addd50k;
    }
    if (selections.addd100k) {
        monthlyTotal += employeeCount * OPTIONAL_BENEFITS.addd100k;
    }
    
    return monthlyTotal;
}

/**
 * Apply minimum premium requirements
 * @param {number} monthlyPremium - Calculated monthly DBL premium
 * @param {string} billingType - Billing frequency (annual, quarterly)
 * @returns {number} Adjusted monthly premium after applying minimums
 */
function applyMinimums(monthlyPremium, billingType) {
    if (billingType === 'annual') {
        const annualPremium = monthlyPremium * 12;
        if (annualPremium < MINIMUMS.annualDBL) {
            return MINIMUMS.annualDBL / 12;
        }
    } else if (billingType === 'quarterly') {
        const quarterlyPremium = monthlyPremium * 3;
        if (quarterlyPremium < MINIMUMS.quarterlyDBL) {
            return MINIMUMS.quarterlyDBL / 3;
        }
    }
    
    return monthlyPremium;
}

/**
 * Calculate complete quote based on form inputs
 * @param {Object} formData - Object containing all form field values
 * @returns {Object} Complete quote breakdown
 */
function calculateQuote(formData) {
    // Parse employee counts
    const maleCount = parseInt(formData.maleEmployees) || 0;
    const femaleCount = parseInt(formData.femaleEmployees) || 0;
    const totalEmployees = maleCount + femaleCount;
    
    // Return zero quote if no employees
    if (totalEmployees === 0) {
        return {
            dblMonthly: 0,
            pflMonthly: 0,
            optionalMonthly: 0,
            totalMonthly: 0,
            displayAmount: 0,
            billingPeriod: 'year',
            breakdown: {
                dblPremium: 0,
                pflPremium: 0,
                optionalCost: 0,
                totalCost: 0
            }
        };
    }
    
    // Get selections
    const benefitTier = formData.dblBenefits || 'statutory';
    const billingType = formData.billingOption || 'annual';
    const includeHospital = formData.inHospitalRider === 'on' || formData.inHospitalRider === true;
    const annualPayroll = parseFloat(formData.annualPayroll) || 0;
    
    // Calculate DBL premium
    let dblMonthly = calculateDBLPremium(
        maleCount,
        femaleCount,
        benefitTier,
        billingType,
        includeHospital
    );
    
    // Apply minimum premiums to DBL
    dblMonthly = applyMinimums(dblMonthly, billingType);
    
    // Calculate PFL premium
    const employeesOverNYSAWW = parseInt(formData.employeesOverNYSAWW) || 0;
    const payrollBelowNYSAWW = parseFloat(formData.payrollBelowNYSAWW) || 0;
    const pfl = calculatePFLPremium(employeesOverNYSAWW, payrollBelowNYSAWW, totalEmployees);
    const pflMonthly = pfl.monthlyTotal;
    
    // Calculate optional benefits
    const optionalSelections = {
        termLife15k: formData.termLife15k === 'on' || formData.termLife15k === true,
        eap: formData.eap === 'on' || formData.eap === true,
        nurseHelpline: formData.nurseHelpline === 'on' || formData.nurseHelpline === true,
        addd50k: formData.adddBenefit === '50000',
        addd100k: formData.adddBenefit === '100000'
    };
    const optionalMonthly = calculateOptionalBenefits(totalEmployees, optionalSelections);
    
    // Calculate totals
    const totalMonthly = dblMonthly + pflMonthly + optionalMonthly;
    const billingPeriod = billingType === 'quarterly' ? 'quarter' : 'year';
    const periodMultiplier = billingPeriod === 'year' ? 12 : 3;
    const displayAmount = totalMonthly * periodMultiplier;
    
    return {
        dblMonthly: dblMonthly,
        pflMonthly: pflMonthly,
        optionalMonthly: optionalMonthly,
        totalMonthly: totalMonthly,
        displayAmount: displayAmount,
        billingPeriod: billingPeriod,
        periodMultiplier: periodMultiplier,
        breakdown: {
            dblPremium: dblMonthly * periodMultiplier,
            pflPremium: pflMonthly * periodMultiplier,
            optionalCost: optionalMonthly * periodMultiplier,
            totalCost: displayAmount
        },
        perEmployeeBreakdown: {
            dblPerEmployee: dblMonthly / totalEmployees,
            pflPerEmployee: pflMonthly / totalEmployees,
            optionalPerEmployee: optionalMonthly / totalEmployees,
            totalPerEmployee: totalMonthly / totalEmployees
        },
        employeeInfo: {
            male: maleCount,
            female: femaleCount,
            total: totalEmployees
        }
    };
}

/**
 * Alternative calculation method when gender split is unknown
 * Assumes a default gender ratio (e.g., 50/50 or industry average)
 * @param {Object} formData - Form data with totalEmployees instead of gender split
 * @param {number} maleRatio - Ratio of male employees (0-1), default 0.5
 * @returns {Object} Complete quote breakdown
 */
function calculateQuoteWithEstimate(formData, maleRatio = 0.5) {
    const totalEmployees = parseInt(formData.totalEmployees) || 0;
    
    if (totalEmployees === 0) {
        return calculateQuote({ maleEmployees: 0, femaleEmployees: 0 });
    }
    
    // Estimate gender split
    const estimatedMales = Math.round(totalEmployees * maleRatio);
    const estimatedFemales = totalEmployees - estimatedMales;
    
    // Create updated form data with estimated split
    const updatedFormData = {
        ...formData,
        maleEmployees: estimatedMales,
        femaleEmployees: estimatedFemales
    };
    
    const quote = calculateQuote(updatedFormData);
    
    // Add note about estimation
    quote.isEstimated = true;
    quote.estimatedGenderRatio = {
        male: maleRatio,
        female: 1 - maleRatio
    };
    
    return quote;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get benefit description for display
 * @param {string} benefitTier - Benefit tier code
 * @returns {Object} Benefit description and max weekly benefit
 */
function getBenefitDescription(benefitTier) {
    const descriptions = {
        statutory: {
            name: 'Statutory DBL',
            maxWeekly: 170,
            description: '50% of salary up to $170/week'
        },
        'enriched1.5x': {
            name: '1.5-times DBL',
            maxWeekly: 255,
            maxWithHospital: 425,
            description: '50% of salary up to $255/week'
        },
        'enriched2x': {
            name: '2-times DBL',
            maxWeekly: 340,
            maxWithHospital: 510,
            description: '50% of salary up to $340/week'
        },
        'enriched3x': {
            name: '3-times DBL',
            maxWeekly: 510,
            maxWithHospital: 680,
            description: '50% of salary up to $510/week'
        },
        'enriched4x': {
            name: '4-times DBL',
            maxWeekly: 680,
            maxWithHospital: 850,
            description: '50% of salary up to $680/week'
        },
        'enriched5x': {
            name: '5-times DBL',
            maxWeekly: 850,
            maxWithHospital: 1020,
            description: '50% of salary up to $850/week'
        }
    };
    
    return descriptions[benefitTier] || descriptions.statutory;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateQuote,
        calculateQuoteWithEstimate,
        calculateDBLPremium,
        calculatePFLPremium,
        calculateOptionalBenefits,
        formatCurrency,
        getBenefitDescription,
        DBL_RATES,
        PFL_RATE,
        MINIMUMS,
        OPTIONAL_BENEFITS
    };
}
