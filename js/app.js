// Prevention Orchestrator - Main Application
class PreventionOrchestrator {
    constructor() {
        this.isInitialized = false;
        this.isEmergencyMode = false;
        this.modules = {};
        this.intervalIds = [];
    }

    async init() {
        console.log('🚀 Initializing Prevention Orchestrator...');
        
        try {
            // Initialize configuration
            this.loadConfiguration();
            
            // Initialize all modules
            await this.initializeModules();
            
            // Set up global event handlers
            this.setupGlobalEvents();
            
            // Start system monitoring
            this.startMonitoring();
            
            // Update UI
            this.updateDashboard();
            
            this.isInitialized = true;
            console.log('✅ Prevention Orchestrator initialized successfully');
            
            // Show welcome notification
            setTimeout(() => {
                if (window.NotificationManager) {
                    window.NotificationManager.showSuccess(
                        'System initialized and ready. Monitoring active.',
                        'System Ready'
                    );
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Failed to initialize Prevention Orchestrator:', error);
            this.showError('Initialization failed: ' + error.message);
        }
    }

    loadConfiguration() {
        console.log('📋 Loading configuration...');
        // Configuration is already loaded via config.js
        this.config = window.Config || {};
    }

    async initializeModules() {
        console.log('🛠️ Initializing modules...');
        
        const modules = [
            { name: 'DataManager', instance: DataManager },
            { name: 'MLService', instance: MLService },
            { name: 'SimulationService', instance: SimulationService },
            { name: 'TabManager', instance: TabManager },
            { name: 'MapManager', instance: MapManager },
            { name: 'NotificationManager', instance: NotificationManager },
            { name: 'UIManager', instance: UIManager }
        ];
        
        for (const module of modules) {
            try {
                if (module.instance && typeof module.instance.init === 'function') {
                    console.log(`  Initializing ${module.name}...`);
                    await module.instance.init();
                    this.modules[module.name] = module.instance;
                    console.log(`  ✅ ${module.name} initialized`);
                }
            } catch (error) {
                console.error(`  ❌ Failed to initialize ${module.name}:`, error);
            }
        }
    }

    setupGlobalEvents() {
        console.log('🔗 Setting up global events...');
        
        // System-wide event listeners
        document.addEventListener('new-alert', (event) => {
            this.handleNewAlert(event.detail);
        });
        
        document.addEventListener('simulation-complete', (event) => {
            this.handleSimulationComplete(event.detail);
        });
        
        document.addEventListener('emergency-mode', (event) => {
            this.handleEmergencyMode(event.detail);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
        
        // Custom events for UI interactions
        document.addEventListener('toggle-emergency', (event) => {
            this.toggleEmergencyMode(event.detail.enabled);
        });
    }

    startMonitoring() {
        console.log('📊 Starting system monitoring...');
        
        // Update dashboard every 10 seconds
        const dashboardInterval = setInterval(() => {
            this.updateDashboard();
        }, 10000);
        this.intervalIds.push(dashboardInterval);
        
        // Simulate random alerts every 30-60 seconds
        const alertInterval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance
                this.simulateNewTrigger();
            }
        }, 30000 + Math.random() * 30000);
        this.intervalIds.push(alertInterval);
        
        // Update system stats every 5 seconds
        const statsInterval = setInterval(() => {
            this.updateSystemStats();
        }, 5000);
        this.intervalIds.push(statsInterval);
        
        console.log(`📈 Started ${this.intervalIds.length} monitoring intervals`);
    }

    updateDashboard() {
        if (this.modules.UIManager) {
            this.modules.UIManager.updateUI();
        }
        
        if (this.modules.MapManager) {
            this.modules.MapManager.updateMapStats();
        }
    }

    updateSystemStats() {
        // Update response time randomly to simulate real variations
        const metrics = DataManager.getMetrics();
        const currentResponse = parseFloat(metrics.responseTime);
        const newResponse = Math.max(4, Math.min(12, currentResponse + (Math.random() - 0.5) * 0.5));
        
        DataManager.data.metrics.responseTime = newResponse.toFixed(1) + 's';
        
        // Update live trigger count
        DataManager.data.metrics.activeTriggers = DataManager.getAlerts().filter(a => a.status === 'active').length;
        
        // Update UI
        this.updateDashboard();
    }

    async simulateNewTrigger() {
        try {
            const newAlert = await DataManager.simulateRandomAlert();
            
            // Show notification
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showAlert(newAlert);
            }
            
            // Update map if initialized
            if (this.modules.MapManager && this.modules.MapManager.isInitialized) {
                this.modules.MapManager.addAlertMarker(newAlert);
            }
            
            // Log to console
            console.log(`🚨 New alert simulated: ${newAlert.type} at ${newAlert.location}`);
            
            // Dispatch event
            const event = new CustomEvent('new-alert', { detail: newAlert });
            document.dispatchEvent(event);
            
            return newAlert;
            
        } catch (error) {
            console.error('Failed to simulate new trigger:', error);
            return null;
        }
    }

    handleNewAlert(alert) {
        console.log(`📢 Handling new alert: ${alert.type}`);
        
        // Update badge counts
        this.updateMenuBadges();
        
        // If in emergency mode, automatically escalate
        if (this.isEmergencyMode && alert.severity === 'high') {
            setTimeout(() => {
                if (this.modules.TabManager) {
                    this.modules.TabManager.escalateAlert(alert.id);
                }
            }, 2000);
        }
    }

    handleSimulationComplete(results) {
        console.log(`🎯 Simulation complete: ${results.scenario}`);
        
        // Update playbook effectiveness if improved
        if (results.accuracy > 0.9) {
            const playbook = DataManager.getPlaybook();
            const improvement = (parseFloat(results.accuracy) - 0.9) * 0.5;
            playbook.effectiveness = Math.min(100, playbook.effectiveness + improvement);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showSuccess(
                    `AI playbook improved by ${improvement.toFixed(1)}%`,
                    'Playbook Enhanced'
                );
            }
        }
    }

    handleEmergencyMode(event) {
        this.toggleEmergencyMode(event.enabled);
    }

    toggleEmergencyMode(enabled = !this.isEmergencyMode) {
        this.isEmergencyMode = enabled;
        
        // Update UI
        if (this.modules.UIManager) {
            this.modules.UIManager.toggleEmergencyMode(enabled);
        }
        
        // Update system behavior
        if (enabled) {
            console.log('🚨 EMERGENCY MODE ACTIVATED');
            
            // Increase monitoring frequency
            this.intervalIds.forEach(clearInterval);
            this.intervalIds = [];
            
            // Start intensive monitoring
            const intensiveInterval = setInterval(() => {
                this.updateDashboard();
                this.updateSystemStats();
            }, 2000);
            this.intervalIds.push(intensiveInterval);
            
            // Simulate more frequent alerts
            const alertInterval = setInterval(() => {
                if (Math.random() > 0.5) {
                    this.simulateNewTrigger();
                }
            }, 10000);
            this.intervalIds.push(alertInterval);
            
        } else {
            console.log('✅ Emergency mode deactivated');
            
            // Restore normal monitoring
            this.intervalIds.forEach(clearInterval);
            this.intervalIds = [];
            this.startMonitoring();
        }
        
        // Dispatch event
        const event = new CustomEvent('emergency-mode', {
            detail: { enabled: this.isEmergencyMode }
        });
        document.dispatchEvent(event);
    }

    updateMenuBadges() {
        const alerts = DataManager.getAlerts();
        const activeAlerts = alerts.filter(a => a.status === 'active').length;
        
        // Update alerts badge
        const alertsBadge = document.querySelector('.menu-item[onclick*="alerts"] .menu-badge');
        if (alertsBadge) {
            alertsBadge.textContent = activeAlerts;
            alertsBadge.style.display = activeAlerts > 0 ? 'inline-block' : 'none';
        }
        
        // Update protocols badge (mock - would be based on pending protocols)
        const protocolsBadge = document.querySelector('.menu-item[onclick*="protocols"] .menu-badge');
        if (protocolsBadge) {
            const pendingProtocols = DataManager.getProtocols().filter(p => p.effectiveness < 80).length;
            protocolsBadge.textContent = pendingProtocols;
            protocolsBadge.style.display = pendingProtocols > 0 ? 'inline-block' : 'none';
        }
    }

    async runScenario(scenarioType) {
        try {
            console.log(`🎮 Running scenario: ${scenarioType}`);
            
            if (this.modules.SimulationService) {
                const results = await this.modules.SimulationService.runScenario(scenarioType);
                return results;
            } else {
                throw new Error('SimulationService not available');
            }
        } catch (error) {
            console.error('Failed to run scenario:', error);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showError(
                    error.message,
                    'Scenario Failed'
                );
            }
            
            throw error;
        }
    }

    async runAllScenarios() {
        try {
            console.log('🎮 Running all scenarios...');
            
            if (this.modules.SimulationService) {
                const results = await this.modules.SimulationService.runAllScenarios();
                return results;
            } else {
                throw new Error('SimulationService not available');
            }
        } catch (error) {
            console.error('Failed to run all scenarios:', error);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showError(
                    error.message,
                    'Scenarios Failed'
                );
            }
            
            throw error;
        }
    }

    async trainPlaybook() {
        try {
            console.log('🧠 Training AI playbook...');
            
            // Get training data from recent alerts
            const alerts = DataManager.getAlerts();
            const trainingData = alerts.map(alert => ({
                type: alert.type,
                severity: alert.severity,
                location: alert.location,
                outcome: alert.status === 'resolved' ? 'success' : 'pending'
            }));
            
            if (this.modules.MLService) {
                const results = await this.modules.MLService.train(trainingData);
                
                if (this.modules.NotificationManager) {
                    this.modules.NotificationManager.showSuccess(
                        `Training complete. New accuracy: ${results.newAccuracy}`,
                        'AI Training Complete'
                    );
                }
                
                return results;
            } else {
                throw new Error('MLService not available');
            }
        } catch (error) {
            console.error('Failed to train playbook:', error);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showError(
                    error.message,
                    'Training Failed'
                );
            }
            
            throw error;
        }
    }

    async resetPlaybook() {
        try {
            console.log('🔄 Resetting playbook...');
            
            // Reset playbook data
            DataManager.data.playbook = {
                effectiveness: 75.0, // Reset to baseline
                lastTrained: new Date().toISOString(),
                scenariosTested: 0
            };
            
            // Save changes
            await DataManager.saveToStorage();
            
            // Update UI
            this.updateDashboard();
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showInfo(
                    'AI playbook has been reset to baseline',
                    'Playbook Reset'
                );
            }
            
            return true;
        } catch (error) {
            console.error('Failed to reset playbook:', error);
            throw error;
        }
    }

    async deployResources() {
        try {
            console.log('🚚 Deploying resources...');
            
            // Get available resources
            const resources = DataManager.getResources();
            const availableResources = resources.filter(r => 
                r.status === 'available' || r.status === 'active'
            );
            
            if (availableResources.length === 0) {
                throw new Error('No available resources to deploy');
            }
            
            // Simulate deployment
            const deployments = availableResources.slice(0, 3); // Deploy up to 3
            
            for (const resource of deployments) {
                // Update resource status
                await DataManager.updateResource(resource.id, { status: 'deploying' });
                
                // Simulate deployment time
                setTimeout(async () => {
                    await DataManager.updateResource(resource.id, { status: 'on-duty' });
                    
                    if (this.modules.NotificationManager) {
                        this.modules.NotificationManager.showSuccess(
                            `${resource.name} deployed successfully`,
                            'Resource Deployed'
                        );
                    }
                }, 2000);
            }
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showInfo(
                    `Deploying ${deployments.length} resources...`,
                    'Deployment Started'
                );
            }
            
            // Update UI
            this.updateDashboard();
            
            return deployments.length;
        } catch (error) {
            console.error('Failed to deploy resources:', error);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showError(
                    error.message,
                    'Deployment Failed'
                );
            }
            
            throw error;
        }
    }

    async optimizeResourceAllocation() {
        try {
            console.log('🤖 Optimizing resource allocation with AI...');
            
            if (this.modules.MLService) {
                // Get current state
                const resources = DataManager.getResources();
                const alerts = DataManager.getAlerts();
                
                // Prepare data for ML optimization
                const optimizationData = {
                    resources: resources.map(r => ({
                        id: r.id,
                        type: r.type,
                        status: r.status,
                        location: r.location
                    })),
                    alerts: alerts.map(a => ({
                        id: a.id,
                        type: a.type,
                        severity: a.severity,
                        location: a.location
                    })),
                    timestamp: new Date().toISOString()
                };
                
                // Get AI recommendations
                const recommendations = await this.modules.MLService.predict(optimizationData);
                
                if (this.modules.NotificationManager) {
                    this.modules.NotificationManager.showSuccess(
                        `AI optimization complete. ${recommendations.recommendations.length} recommendations generated.`,
                        'Resource Optimization'
                    );
                }
                
                // Show recommendations
                alert(`AI Resource Optimization Recommendations:\n\n${recommendations.recommendations.join('\n')}`);
                
                return recommendations;
            } else {
                throw new Error('MLService not available');
            }
        } catch (error) {
            console.error('Failed to optimize resource allocation:', error);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showError(
                    error.message,
                    'Optimization Failed'
                );
            }
            
            throw error;
        }
    }

    async exportImpactData() {
        try {
            console.log('💾 Exporting impact data...');
            
            const data = {
                metrics: DataManager.getMetrics(),
                alerts: DataManager.getAlerts(),
                protocols: DataManager.getProtocols(),
                simulations: SimulationService.getHistory(),
                exportDate: new Date().toISOString(),
                systemVersion: this.config.app?.version || '1.0.0'
            };
            
            // Create download link
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const dataUrl = URL.createObjectURL(dataBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `prevention-orchestrator-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(dataUrl);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showSuccess(
                    'Impact data exported successfully',
                    'Export Complete'
                );
            }
            
            return true;
        } catch (error) {
            console.error('Failed to export impact data:', error);
            
            if (this.modules.NotificationManager) {
                this.modules.NotificationManager.showError(
                    error.message,
                    'Export Failed'
                );
            }
            
            throw error;
        }
    }

    switchTab(tabId) {
        if (this.modules.TabManager) {
            this.modules.TabManager.switchToTab(tabId);
        } else {
            // Fallback
            window.switchTab(tabId);
        }
    }

    refreshDashboard() {
        console.log('🔄 Refreshing dashboard...');
        
        // Force update all data
        DataManager.calculateMetrics();
        
        // Update all UI components
        this.updateDashboard();
        
        // Refresh map if available
        if (this.modules.MapManager) {
            this.modules.MapManager.refreshMapData();
        }
        
        // Show notification
        if (this.modules.NotificationManager) {
            this.modules.NotificationManager.showSuccess(
                'Dashboard refreshed with latest data',
                'Refresh Complete'
            );
        }
    }

    saveState() {
        try {
            const state = {
                emergencyMode: this.isEmergencyMode,
                lastActive: new Date().toISOString(),
                moduleStatus: {}
            };
            
            // Save module status
            for (const [name, module] of Object.entries(this.modules)) {
                if (module.getStatus) {
                    state.moduleStatus[name] = module.getStatus();
                }
            }
            
            localStorage.setItem('preventionOrchestratorState', JSON.stringify(state));
            console.log('💾 Application state saved');
        } catch (error) {
            console.warn('Could not save application state:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('preventionOrchestratorState');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Restore emergency mode
                if (state.emergencyMode && state.emergencyMode !== this.isEmergencyMode) {
                    this.toggleEmergencyMode(state.emergencyMode);
                }
                
                console.log('📂 Application state loaded');
                return state;
            }
        } catch (error) {
            console.warn('Could not load application state:', error);
        }
        return null;
    }

    showError(message) {
        console.error('❌ Error:', message);
        
        if (this.modules.NotificationManager) {
            this.modules.NotificationManager.showError(message, 'System Error');
        } else {
            alert(`Error: ${message}`);
        }
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            emergencyMode: this.isEmergencyMode,
            modules: Object.keys(this.modules),
            config: this.config,
            intervals: this.intervalIds.length
        };
    }
}

// Global instance and initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, starting application...');
    
    // Create global app instance
    window.app = new PreventionOrchestrator();
    
    // Start initialization
    window.app.init().catch(error => {
        console.error('Failed to initialize application:', error);
        alert(`Failed to initialize application: ${error.message}`);
    });
});

// Global helper functions
window.switchTab = function(tabId) {
    if (window.app) {
        window.app.switchTab(tabId);
    }
};

window.toggleEmergencyMode = function() {
    if (window.app) {
        window.app.toggleEmergencyMode();
    }
};

window.refreshDashboard = function() {
    if (window.app) {
        window.app.refreshDashboard();
    }
};

window.simulateNewTrigger = function() {
    if (window.app) {
        window.app.simulateNewTrigger();
    }
};

window.deployResources = function() {
    if (window.app) {
        window.app.deployResources();
    }
};

window.trainPlaybook = function() {
    if (window.app) {
        window.app.trainPlaybook();
    }
};

window.resetPlaybook = function() {
    if (window.app) {
        window.app.resetPlaybook();
    }
};

window.runScenario = function(scenarioType) {
    if (window.app) {
        window.app.runScenario(scenarioType);
    }
};

window.runAllScenarios = function() {
    if (window.app) {
        window.app.runAllScenarios();
    }
};

window.optimizeResourceAllocation = function() {
    if (window.app) {
        window.app.optimizeResourceAllocation();
    }
};

window.exportImpactData = function() {
    if (window.app) {
        window.app.exportImpactData();
    }
};

window.updateImpactChart = function() {
    if (window.UIManager) {
        window.UIManager.updateImpactChart();
    }
};

window.zoomToJohannesburg = function() {
    if (window.MapManager) {
        window.MapManager.zoomToJohannesburg();
    }
};

window.toggleTrafficLayers = function() {
    if (window.MapManager) {
        window.MapManager.toggleTrafficLayer();
    }
};

window.updateMapData = function() {
    if (window.MapManager) {
        window.MapManager.updateMapData();
    }
};

window.logout = function() {
    if (confirm('Are you sure you want to logout? All unsaved data will be lost.')) {
        // Clear sensitive data
        localStorage.removeItem('preventionOrchestratorState');
        
        // Show logout message
        alert('Logged out successfully. In a real application, this would redirect to login page.');
        
        // In a real app, you would redirect:
        // window.location.href = '/login.html';
    }
};