// Simulation Service
class SimulationService {
    static scenarios = {
        rush_hour: {
            name: 'Rush Hour',
            description: 'Simulate peak traffic conditions during morning/evening commute',
            parameters: {
                trafficDensity: 95,
                avgSpeed: 35,
                accidentProbability: 0.15,
                vehicleCount: 250,
                duration: '2 hours',
                timeOfDay: '07:00-09:00'
            },
            expectedOutcomes: {
                riskReduction: '65-75%',
                responseTime: '6-8s',
                protocolEffectiveness: '85-90%'
            }
        },
        school_zone: {
            name: 'School Zone',
            description: 'Simulate school zone safety during peak hours',
            parameters: {
                pedestrianDensity: 80,
                vehicleSpeed: 30,
                crosswalkActivity: 'high',
                schoolHours: true,
                parentDropoff: true
            },
            expectedOutcomes: {
                riskReduction: '70-80%',
                responseTime: '5-7s',
                protocolEffectiveness: '90-95%'
            }
        },
        weekend_night: {
            name: 'Weekend Night',
            description: 'Simulate weekend night traffic with potential DUI risks',
            parameters: {
                timeOfDay: '22:00-04:00',
                alcoholRisk: 'elevated',
                speedVariation: 'high',
                enforcementPresence: 'reduced'
            },
            expectedOutcomes: {
                riskReduction: '60-70%',
                responseTime: '8-10s',
                protocolEffectiveness: '80-85%'
            }
        },
        weather_emergency: {
            name: 'Weather Emergency',
            description: 'Simulate extreme weather conditions impact on road safety',
            parameters: {
                weatherCondition: 'heavy_rain',
                visibility: 'low',
                roadCondition: 'slippery',
                windSpeed: 'high'
            },
            expectedOutcomes: {
                riskReduction: '75-85%',
                responseTime: '7-9s',
                protocolEffectiveness: '88-92%'
            }
        },
        highway_accident: {
            name: 'Highway Accident',
            description: 'Simulate multi-vehicle accident on major highway',
            parameters: {
                vehiclesInvolved: 3,
                laneClosures: 2,
                emergencyResponse: 'required',
                trafficBackup: 'severe'
            },
            expectedOutcomes: {
                riskReduction: '80-90%',
                responseTime: '4-6s',
                protocolEffectiveness: '92-96%'
            }
        }
    };

    static currentSimulation = null;
    static resultsHistory = [];

    static async init() {
        console.log('Initializing Simulation Service...');
        await this.loadHistory();
        return true;
    }

    static async runScenario(scenarioType) {
        const scenario = this.scenarios[scenarioType];
        if (!scenario) {
            throw new Error(`Unknown scenario: ${scenarioType}`);
        }

        console.log(`Running scenario: ${scenario.name}`);
        
        // Update UI status
        this.updateSimulationStatus('running', scenario.name);
        
        // Run simulation
        const results = await this.executeSimulation(scenario);
        
        // Store results
        this.currentSimulation = { scenario, results };
        this.resultsHistory.unshift({
            scenario: scenario.name,
            timestamp: new Date().toISOString(),
            results: results
        });
        
        // Save to storage
        await this.saveHistory();
        
        // Update UI
        this.updateSimulationStatus('completed', scenario.name);
        this.displayResults(results);
        
        return results;
    }

    static async executeSimulation(scenario) {
        // Simulate processing time based on scenario complexity
        const processingTime = 1000 + Math.random() * 2000;
        await this.simulateProcessing(processingTime);
        
        // Generate realistic results
        const baseRiskReduction = 0.6 + Math.random() * 0.3;
        const baseResponseTime = 5 + Math.random() * 5;
        
        // Adjust based on scenario parameters
        const riskReduction = this.calculateRiskReduction(scenario, baseRiskReduction);
        const responseTime = this.calculateResponseTime(scenario, baseResponseTime);
        
        return {
            scenario: scenario.name,
            riskReduction: riskReduction,
            responseTime: responseTime.toFixed(1) + 's',
            accuracy: (0.85 + Math.random() * 0.1).toFixed(2),
            recommendations: this.generateScenarioRecommendations(scenario, riskReduction),
            parameters: scenario.parameters,
            expectedOutcomes: scenario.expectedOutcomes,
            timestamp: new Date().toISOString(),
            processingTime: processingTime + 'ms',
            success: true
        };
    }

    static calculateRiskReduction(scenario, baseValue) {
        let adjustment = 0;
        
        if (scenario.parameters.trafficDensity > 90) adjustment += 0.05;
        if (scenario.parameters.pedestrianDensity > 70) adjustment += 0.08;
        if (scenario.parameters.weatherCondition === 'heavy_rain') adjustment += 0.1;
        if (scenario.parameters.vehiclesInvolved > 2) adjustment += 0.12;
        
        const finalValue = Math.min(0.95, baseValue + adjustment);
        return (finalValue * 100).toFixed(1) + '%';
    }

    static calculateResponseTime(scenario, baseValue) {
        let adjustment = 0;
        
        if (scenario.parameters.accidentProbability > 0.1) adjustment -= 1;
        if (scenario.parameters.enforcementPresence === 'reduced') adjustment += 2;
        if (scenario.parameters.emergencyResponse === 'required') adjustment -= 0.5;
        
        return Math.max(3, baseValue + adjustment);
    }

    static generateScenarioRecommendations(scenario, riskReduction) {
        const recommendations = [];
        const riskPercent = parseFloat(riskReduction);
        
        if (riskPercent >= 80) {
            recommendations.push('Excellent risk reduction - protocol highly effective');
            recommendations.push('Consider deploying this strategy in real situations');
        } else if (riskPercent >= 70) {
            recommendations.push('Good performance - minor optimizations needed');
            recommendations.push('Review response time for further improvements');
        } else {
            recommendations.push('Performance needs improvement');
            recommendations.push('Analyze bottlenecks in response protocol');
        }
        
        // Scenario-specific recommendations
        if (scenario.parameters.trafficDensity > 80) {
            recommendations.push('Implement dynamic lane management');
            recommendations.push('Adjust traffic signal coordination');
        }
        
        if (scenario.parameters.pedestrianDensity > 60) {
            recommendations.push('Increase pedestrian crossing time');
            recommendations.push('Deploy additional crossing guards');
        }
        
        if (scenario.parameters.weatherCondition === 'heavy_rain') {
            recommendations.push('Activate weather response protocol immediately');
            recommendations.push('Reduce speed limits by 30%');
        }
        
        return recommendations.slice(0, 5);
    }

    static async runAllScenarios() {
        console.log('Running all simulation scenarios...');
        
        const results = [];
        const scenarioTypes = Object.keys(this.scenarios);
        
        for (const scenarioType of scenarioTypes) {
            try {
                const result = await this.runScenario(scenarioType);
                results.push(result);
                
                // Brief pause between scenarios
                await this.simulateProcessing(500);
            } catch (error) {
                console.error(`Error running scenario ${scenarioType}:`, error);
                results.push({
                    scenario: scenarioType,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Generate summary report
        const summary = this.generateSummaryReport(results);
        
        // Display comprehensive results
        this.displayComprehensiveResults(results, summary);
        
        return { results, summary };
    }

    static generateSummaryReport(results) {
        const successful = results.filter(r => r.success);
        
        if (successful.length === 0) {
            return {
                totalScenarios: results.length,
                successful: 0,
                averageRiskReduction: '0%',
                averageResponseTime: '0s',
                overallEffectiveness: 'Poor'
            };
        }
        
        const avgRiskReduction = successful.reduce((sum, r) => {
            return sum + parseFloat(r.riskReduction);
        }, 0) / successful.length;
        
        const avgResponseTime = successful.reduce((sum, r) => {
            return sum + parseFloat(r.responseTime);
        }, 0) / successful.length;
        
        let effectiveness = 'Poor';
        if (avgRiskReduction >= 80) effectiveness = 'Excellent';
        else if (avgRiskReduction >= 70) effectiveness = 'Good';
        else if (avgRiskReduction >= 60) effectiveness = 'Fair';
        
        return {
            totalScenarios: results.length,
            successful: successful.length,
            failed: results.length - successful.length,
            averageRiskReduction: avgRiskReduction.toFixed(1) + '%',
            averageResponseTime: avgResponseTime.toFixed(1) + 's',
            overallEffectiveness: effectiveness,
            bestScenario: successful.reduce((best, current) => 
                parseFloat(current.riskReduction) > parseFloat(best.riskReduction) ? current : best
            ).scenario,
            worstScenario: successful.reduce((worst, current) => 
                parseFloat(current.riskReduction) < parseFloat(worst.riskReduction) ? current : worst
            ).scenario
        };
    }

    static updateSimulationStatus(status, scenarioName = '') {
        const statusElement = document.getElementById('sim-status');
        const statusDot = document.querySelector('.status-dot');
        
        if (statusElement) {
            statusElement.textContent = status === 'running' ? `Running ${scenarioName}...` : 'Ready';
        }
        
        if (statusDot) {
            statusDot.classList.remove('active');
            if (status === 'running') {
                statusDot.classList.add('running');
                statusDot.style.background = Config.colors?.warning || '#f59e0b';
            } else {
                statusDot.classList.add('active');
                statusDot.style.background = Config.colors?.success || '#10b981';
            }
        }
        
        // Dispatch event for other components
        const event = new CustomEvent('simulation-status', {
            detail: { status, scenarioName }
        });
        document.dispatchEvent(event);
    }

    static displayResults(results) {
        // Update UI elements with results
        const riskElement = document.getElementById('last-risk-reduction');
        const responseElement = document.getElementById('last-response-time');
        const accuracyElement = document.getElementById('last-accuracy');
        
        if (riskElement) riskElement.textContent = results.riskReduction;
        if (responseElement) responseElement.textContent = results.responseTime;
        if (accuracyElement) accuracyElement.textContent = results.accuracy;
        
        // Show notification
        if (window.NotificationManager) {
            window.NotificationManager.show({
                type: 'success',
                title: 'Simulation Complete',
                message: `${results.scenario}: Risk reduction ${results.riskReduction}`,
                duration: 5000
            });
        }
    }

    static displayComprehensiveResults(results, summary) {
        console.log('Simulation Summary:', summary);
        
        // In a full implementation, this would update a detailed results view
        const event = new CustomEvent('simulation-complete', {
            detail: { results, summary }
        });
        document.dispatchEvent(event);
    }

    static simulateProcessing(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async loadHistory() {
        try {
            const saved = localStorage.getItem('simulationHistory');
            if (saved) {
                this.resultsHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load simulation history:', error);
        }
    }

    static async saveHistory() {
        try {
            // Keep only last 50 simulations
            if (this.resultsHistory.length > 50) {
                this.resultsHistory = this.resultsHistory.slice(0, 50);
            }
            
            localStorage.setItem('simulationHistory', JSON.stringify(this.resultsHistory));
        } catch (error) {
            console.error('Could not save simulation history:', error);
        }
    }

    static getHistory() {
        return this.resultsHistory;
    }

    static clearHistory() {
        this.resultsHistory = [];
        localStorage.removeItem('simulationHistory');
        console.log('Simulation history cleared');
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SimulationService = SimulationService;
}