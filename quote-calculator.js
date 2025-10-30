/**
 * Quote Calculator for NY DBL & PFL Insurance
 * This file contains all pricing constants and calculation logic
 */

// Pricing constants (adjust these based on actual rates)
const PRICING = {
    // Base rates
    baseRatePerEmployee: 50, // Base monthly rate per employee
    
    // DBL Benefit multipliers
    statutoryMultiplier: 1.0,
    enriched1_5x: 1.5,
    enriched2x: 2.0,
    enriched3x: 3.0,
    enriched4x: 4.0,
    enriched5x: 5.0,
    
    // Optional Riders (per employee per month)
    inHospitalRider: 2.50,
    addd50k: 1.25,
    addd100k: 2.50,
    
    // Optional Baseline Benefits (per employee per month)
    termLife15k: 1.50,
    eap: 0.75,
    nurseHelpline: 0.50,
    
    // Billing fees
    quarterlyFee: 15.00, // quarterly installment fee
    
    // Minimum premiums
    annualMinimum: 125.00,
    quarterlyMinimum: 35.00,
    
    // Payroll-based calculation rate (percentage of monthly payroll)
    payrollRate: 0.005 // 0.5% of monthly payroll
};

/**
 * Get the multiplier for the selected DBL benefit option
 * @param {string} benefitValue - The value of the selected DBL benefit radio button
 * @returns {number} The multiplier to apply
 */
function getDBLMultiplier(benefitValue) {
    switch(benefitValue) {
        case 'statutory':
            return PRICING.statutoryMultiplier;
        case 'enriched1.5x':
            return PRICING.enriched1_5x;
        case 'enriched2x':
            return PRICING.enriched2x;
        case 'enriched3x':
            return PRICING.enriched3x;
        case 'enriched4x':
            return PRICING.enriched4x;
        case 'enriched5x':
            return PRICING.enriched5x;
        default:
            return PRICING.statutoryMultiplier;
    }
}

/**
 * Calculate the base premium based on employees and DBL benefit level
 * @param {number} totalEmployees - Total number of covered employees
 * @param {number} multiplier - DBL benefit multiplier
 * @param {string} billingType - Type of billing (annual, quarterly, quarterlyPayroll)
 * @param {number} totalPayroll - Total monthly payroll (for payroll-based billing)
 * @returns {number} Base monthly premium
 */
function calculateBasePremium(totalEmployees, multiplier, billingType, totalPayroll) {
    if (billingType === 'quarterlyPayroll' && totalPayroll > 0) {
        // Payroll-based calculation: percentage of monthly payroll
        return totalPayroll * PRICING.payrollRate;
    }
    
    // Standard calculation: employees × base rate × multiplier
    return totalEmployees * PRICING.baseRatePerEmployee * multiplier;
}

/**
 * Calculate riders cost per month
 * @param {number} totalEmployees - Total number of covered employees
 * @param {boolean} inHospitalSelected - Whether In-Hospital Rider is selected
 * @param {string} adddBenefit - AD&D benefit amount ('50000', '100000', or null)
 * @returns {number} Total monthly cost for riders
 */
function calculateRidersCost(totalEmployees, inHospitalSelected, adddBenefit) {
    let ridersMonthly = 0;
    
    if (inHospitalSelected) {
        ridersMonthly += totalEmployees * PRICING.inHospitalRider;
    }
    
    if (adddBenefit === '50000') {
        ridersMonthly += totalEmployees * PRICING.addd50k;
    } else if (adddBenefit === '100000') {
        ridersMonthly += totalEmployees * PRICING.addd100k;
    }
    
    return ridersMonthly;
}

/**
 * Calculate optional benefits cost per month
 * @param {number} totalEmployees - Total number of covered employees
 * @param {boolean} termLifeSelected - Whether Term Life is selected
 * @param {boolean} eapSelected - Whether EAP is selected
 * @param {boolean} nurseHelplineSelected - Whether Nurse Helpline is selected
 * @returns {number} Total monthly cost for optional benefits
 */
function calculateOptionalBenefitsCost(totalEmployees, termLifeSelected, eapSelected, nurseHelplineSelected) {
    let optionalMonthly = 0;
    
    if (termLifeSelected) {
        optionalMonthly += totalEmployees * PRICING.termLife15k;
    }
    if (eapSelected) {
        optionalMonthly += totalEmployees * PRICING.eap;
    }
    if (nurseHelplineSelected) {
        optionalMonthly += totalEmployees * PRICING.nurseHelpline;
    }
    
    return optionalMonthly;
}

/**
 * Apply minimum premiums based on billing type
 * @param {number} monthlyPremium - Calculated monthly premium
 * @param {string} billingType - Type of billing (annual, quarterly, quarterlyPayroll)
 * @returns {number} Adjusted monthly premium after applying minimums
 */
function applyMinimums(monthlyPremium, billingType) {
    if (billingType === 'annual') {
        // Annual minimum: if annual premium < $125, adjust to $125/12 per month
        if (monthlyPremium * 12 < PRICING.annualMinimum) {
            return PRICING.annualMinimum / 12;
        }
    } else if (billingType === 'quarterly' || billingType === 'quarterlyPayroll') {
        // Quarterly minimum: if quarterly premium < $35, adjust to $35/3 per month
        if (monthlyPremium * 3 < PRICING.quarterlyMinimum) {
            return PRICING.quarterlyMinimum / 3;
        }
    }
    
    return monthlyPremium;
}

/**
 * Add billing fees (e.g., quarterly installment fee)
 * @param {number} monthlyPremium - Monthly premium
 * @param {string} billingType - Type of billing (annual, quarterly, quarterlyPayroll)
 * @returns {number} Monthly premium with fees added
 */
function addBillingFees(monthlyPremium, billingType) {
    if (billingType === 'quarterly' || billingType === 'quarterlyPayroll') {
        // Add quarterly fee prorated per month
        return monthlyPremium + (PRICING.quarterlyFee / 3);
    }
    
    return monthlyPremium;
}

/**
 * Calculate the complete quote based on all form inputs
 * @param {Object} formData - Object containing all form field values
 * @returns {Object} Quote breakdown with all calculations
 */
function calculateQuote(formData) {
    const totalEmployees = parseInt(formData.totalEmployees) || 0;
    
    // Return zero quote if no employees
    if (totalEmployees === 0) {
        return {
            baseMonthlyPremium: 0,
            ridersMonthly: 0,
            optionalMonthly: 0,
            totalMonthly: 0,
            displayAmount: 0,
            billingPeriod: 'year',
            breakdown: {
                basePremium: 0,
                ridersCost: 0,
                optionalCost: 0,
                totalCost: 0
            }
        };
    }
    
    // Get DBL benefit multiplier
    const multiplier = getDBLMultiplier(formData.dblBenefits || 'statutory');
    
    // Get billing type
    const billingType = formData.billingOption || 'annual';
    const billingPeriod = (billingType === 'quarterly' || billingType === 'quarterlyPayroll') ? 'quarter' : 'year';
    const totalPayroll = parseFloat(formData.totalPayroll) || 0;
    
    // Calculate base premium
    let baseMonthlyPremium = calculateBasePremium(totalEmployees, multiplier, billingType, totalPayroll);
    
    // Calculate riders cost
    const ridersMonthly = calculateRidersCost(
        totalEmployees,
        formData.inHospitalRider === 'on' || formData.inHospitalRider === true,
        formData.addBenefit || null
    );
    
    // Calculate optional benefits cost
    const optionalMonthly = calculateOptionalBenefitsCost(
        totalEmployees,
        formData.termLife15k === 'on' || formData.termLife15k === true,
        formData.eap === 'on' || formData.eap === true,
        formData.nurseHelpline === 'on' || formData.nurseHelpline === true
    );
    
    // Calculate total monthly premium
    let totalMonthly = baseMonthlyPremium + ridersMonthly + optionalMonthly;
    
    // Apply minimums
    totalMonthly = applyMinimums(totalMonthly, billingType);
    
    // Add billing fees
    totalMonthly = addBillingFees(totalMonthly, billingType);
    
    // Calculate display amount (annual or quarterly)
    const displayAmount = billingPeriod === 'year' ? totalMonthly * 12 : totalMonthly * 3;
    
    // Calculate period amounts for breakdown
    const periodMultiplier = billingPeriod === 'year' ? 12 : 3;
    
    return {
        baseMonthlyPremium: baseMonthlyPremium,
        ridersMonthly: ridersMonthly,
        optionalMonthly: optionalMonthly,
        totalMonthly: totalMonthly,
        displayAmount: displayAmount,
        billingPeriod: billingPeriod,
        breakdown: {
            basePremium: baseMonthlyPremium * periodMultiplier,
            ridersCost: ridersMonthly * periodMultiplier,
            optionalCost: optionalMonthly * periodMultiplier,
            totalCost: displayAmount
        }
    };
}

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

