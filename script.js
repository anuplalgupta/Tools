// Chart instances
let retirementChart = null;
let corpusGrowthChart = null;

// Format currency
function formatCurrency(amount) {
    if (amount >= 10000000) {
        return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(2) + ' L';
    } else {
        return '₹' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

// Calculate future value with compound interest
function futureValue(presentValue, rate, years) {
    return presentValue * Math.pow(1 + rate / 100, years);
}

// Calculate present value
function presentValue(futureValue, rate, years) {
    return futureValue / Math.pow(1 + rate / 100, years);
}

// Calculate SIP amount required
function calculateSIP(targetAmount, rate, years) {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
        return targetAmount / months;
    }
    
    return targetAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
}

// Calculate corpus required for retirement
function calculateRetirementCorpus(monthlyExpense, yearsInRetirement, inflationRate, returnRate) {
    let totalCorpus = 0;
    let annualExpense = monthlyExpense * 12;
    
    for (let year = 1; year <= yearsInRetirement; year++) {
        const expenseInYear = annualExpense * Math.pow(1 + inflationRate / 100, year - 1);
        const presentValueOfExpense = presentValue(expenseInYear, returnRate, year);
        totalCorpus += presentValueOfExpense;
    }
    
    return totalCorpus;
}

// Main calculation function
function calculateRetirement() {
    // Get input values
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const retirementAge = parseFloat(document.getElementById('retirementAge').value);
    const lifeExpectancy = parseFloat(document.getElementById('lifeExpectancy').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const inflationRate = parseFloat(document.getElementById('inflationRate').value);
    const postRetirementInflation = parseFloat(document.getElementById('postRetirementInflation').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const expectedReturns = parseFloat(document.getElementById('expectedReturns').value);
    const postRetirementReturns = parseFloat(document.getElementById('postRetirementReturns').value);
    const additionalExpenses = parseFloat(document.getElementById('additionalExpenses').value);
    const additionalInflation = parseFloat(document.getElementById('additionalInflation').value);
    
    // Validate inputs
    if (retirementAge <= currentAge) {
        alert('Retirement age must be greater than current age');
        return;
    }
    
    if (lifeExpectancy <= retirementAge) {
        alert('Life expectancy must be greater than retirement age');
        return;
    }
    
    // Calculate derived values
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Calculate future monthly expenses at retirement (adjusted for inflation)
    const futureMonthlyExpenses = futureValue(monthlyExpenses, inflationRate, yearsToRetirement);
    
    // Calculate future value of additional expenses
    const futureAdditionalExpenses = futureValue(additionalExpenses, additionalInflation, yearsToRetirement);
    
    // Calculate total annual expenses at retirement
    const annualExpensesAtRetirement = (futureMonthlyExpenses * 12) + futureAdditionalExpenses;
    
    // Calculate retirement corpus needed
    const requiredCorpus = calculateRetirementCorpus(
        futureMonthlyExpenses + (futureAdditionalExpenses / 12),
        yearsInRetirement,
        postRetirementInflation,
        postRetirementReturns
    );
    
    // Calculate future value of current savings
    const futureSavingsValue = futureValue(currentSavings, expectedReturns, yearsToRetirement);
    
    // Calculate additional corpus needed
    const additionalCorpus = Math.max(0, requiredCorpus - futureSavingsValue);
    
    // Calculate monthly SIP required
    const monthlySIP = calculateSIP(additionalCorpus, expectedReturns, yearsToRetirement);
    
    // Calculate annual investment required
    const annualInvestment = monthlySIP * 12;
    
    // Calculate lumpsum investment required
    const lumpsumRequired = presentValue(additionalCorpus, expectedReturns, yearsToRetirement);
    
    // Update results
    document.getElementById('yearsToRetirement').textContent = yearsToRetirement.toFixed(0);
    document.getElementById('requiredCorpus').textContent = formatCurrency(requiredCorpus);
    document.getElementById('futureMonthlyExpenses').textContent = formatCurrency(futureMonthlyExpenses);
    document.getElementById('futureSavingsValue').textContent = formatCurrency(futureSavingsValue);
    document.getElementById('additionalCorpus').textContent = formatCurrency(additionalCorpus);
    document.getElementById('monthlySIP').textContent = formatCurrency(monthlySIP);
    document.getElementById('annualInvestment').textContent = formatCurrency(annualInvestment);
    document.getElementById('lumpsumRequired').textContent = formatCurrency(lumpsumRequired);
    
    // Animate numbers
    document.querySelectorAll('.result-value').forEach(el => {
        el.classList.add('animate-number');
        setTimeout(() => el.classList.remove('animate-number'), 500);
    });
    
    // Create charts
    createRetirementChart(requiredCorpus, futureSavingsValue, additionalCorpus);
    createCorpusGrowthChart(
        currentAge,
        retirementAge,
        lifeExpectancy,
        currentSavings,
        monthlySIP,
        expectedReturns,
        postRetirementReturns,
        requiredCorpus
    );
}

// Create retirement corpus breakdown chart
function createRetirementChart(totalCorpus, currentSavingsFV, gap) {
    const ctx = document.getElementById('retirementChart').getContext('2d');
    
    if (retirementChart) {
        retirementChart.destroy();
    }
    
    retirementChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Current Savings (Future Value)', 'Additional Investment Needed'],
            datasets: [{
                data: [currentSavingsFV, gap],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(245, 87, 108, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(245, 87, 108, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Retirement Corpus Breakdown',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const percentage = ((context.parsed / totalCorpus) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create corpus growth over time chart
function createCorpusGrowthChart(currentAge, retirementAge, lifeExpectancy, currentSavings, monthlySIP, preReturnRate, postReturnRate, targetCorpus) {
    const ctx = document.getElementById('corpusGrowthChart').getContext('2d');
    
    if (corpusGrowthChart) {
        corpusGrowthChart.destroy();
    }
    
    const ages = [];
    const corpusValues = [];
    let corpus = currentSavings;
    
    // Pre-retirement phase
    for (let age = currentAge; age <= retirementAge; age++) {
        ages.push(age);
        corpusValues.push(corpus);
        
        if (age < retirementAge) {
            // Add annual returns
            corpus = corpus * (1 + preReturnRate / 100);
            // Add annual SIP contributions
            corpus += monthlySIP * 12;
        }
    }
    
    // Post-retirement phase (simplified - showing depletion)
    const annualWithdrawal = targetCorpus / (lifeExpectancy - retirementAge);
    for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
        corpus = corpus * (1 + postReturnRate / 100) - annualWithdrawal;
        ages.push(age);
        corpusValues.push(Math.max(0, corpus));
    }
    
    corpusGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ages,
            datasets: [{
                label: 'Retirement Corpus',
                data: corpusValues,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Corpus Growth & Depletion Over Time',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Age ${context.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        retirementLine: {
                            type: 'line',
                            xMin: retirementAge,
                            xMax: retirementAge,
                            borderColor: 'rgba(245, 87, 108, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Retirement',
                                enabled: true,
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age (Years)',
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Corpus Value',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000000) {
                                return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                            } else if (value >= 100000) {
                                return '₹' + (value / 100000).toFixed(1) + 'L';
                            }
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time validation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const min = parseFloat(this.getAttribute('min'));
            const max = parseFloat(this.getAttribute('max'));
            const value = parseFloat(this.value);
            
            if (value < min) {
                this.value = min;
            } else if (max && value > max) {
                this.value = max;
            }
        });
    });
    
    // Calculate on Enter key press
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateRetirement();
            }
        });
    });
    
    // Initial calculation
    calculateRetirement();
});
