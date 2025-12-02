// UI Manager
class UIManager {
    static isInitialized = false;
    static emergencyMode = false;
    static charts = {};

    static async init() {
        console.log('Initializing UI Manager...');
        
        if (this.isInitialized) return true;
        
        // Initialize UI components
        await this.initializeUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start UI updates
        this.startUIUpdates();
        
        this.isInitialized = true;
        console.log('UI Manager initialized');
        return true;
    }

    static async initializeUI() {
        // Update initial values
        this.updateLiveStats();
        this.updateResourceGrid();
        this.updateAlertList();
        this.updateProtocolPerformance();
        
        // Initialize charts
        this.initializeCharts();
    }

    static setupEventListeners() {
        // Listen for data changes
        document.addEventListener('data-updated', () => {
            this.updateUI();
        });
        
        // Listen for emergency mode changes
        document.addEventListener('emergency-mode', (event) => {
            this.toggleEmergencyMode(event.detail.enabled);
        });
        
        // Listen for simulation completion
        document.addEventListener('simulation-complete', (event) => {
            this.updateSimulationResults(event.detail);
        });
        
        // Listen for tab changes
        document.addEventListener('tab-changed', (event) => {
            this.onTabChange(event.detail);
        });
    }

    static startUIUpdates() {
        // Update time display every second
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
        
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateLiveStats();
        }, 30000);
        
        // Update UI every minute
        setInterval(() => {
            this.updateUI();
        }, 60000);
    }

    static updateUI() {
        this.updateLiveStats();
        this.updateResourceGrid();
        this.updateAlertList();
        this.updateProtocolPerformance();
        this.updateImpactMetrics();
    }

    static updateLiveStats() {
        const metrics = DataManager.getMetrics();
        
        // Update trigger count
        const triggerElement = document.getElementById('live-trigger-count');
        if (triggerElement) {
            triggerElement.textContent = metrics.activeTriggers;
        }
        
        // Update response time
        const responseElement = document.getElementById('response-time');
        if (responseElement) {
            responseElement.textContent = metrics.responseTime;
        }
        
        // Update uptime
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = metrics.uptime;
        }
        
        // Update available resources
        const resources = DataManager.getResources();
        const availableResources = resources.filter(r => r.status === 'available' || r.status === 'active').length;
        const totalResources = resources.length;
        
        const availableElement = document.getElementById('available-resources');
        const totalElement = document.getElementById('total-resources');
        
        if (availableElement) availableElement.textContent = availableResources;
        if (totalElement) totalElement.textContent = totalResources;
        
        // Update AI effectiveness
        const aiElement = document.getElementById('ai-effectiveness');
        if (aiElement) {
            aiElement.textContent = metrics.aiEffectiveness.toFixed(1) + '%';
        }
    }

    static updateTimeDisplay() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    static updateResourceGrid() {
        const resources = DataManager.getResources();
        const resourceGrid = document.getElementById('resource-grid');
        
        if (!resourceGrid) return;
        
        resourceGrid.innerHTML = resources.map(resource => `
            <div class="resource-item" data-status="${resource.status}" onclick="UIManager.selectResource('${resource.id}')">
                <div class="resource-icon">
                    ${this.getResourceIcon(resource.type)}
                </div>
                <div class="resource-name">${resource.name}</div>
                <div class="resource-status ${resource.status}">${resource.status}</div>
                ${resource.capacity ? `<div class="resource-info">Capacity: ${resource.capacity}</div>` : ''}
                ${resource.battery ? `<div class="resource-info">Battery: ${resource.battery}%</div>` : ''}
            </div>
        `).join('');
    }

    static getResourceIcon(type) {
        const icons = {
            vehicle: '<i class="fas fa-car"></i>',
            camera: '<i class="fas fa-camera"></i>',
            team: '<i class="fas fa-users"></i>',
            drone: '<i class="fas fa-drone"></i>',
            sign: '<i class="fas fa-sign"></i>'
        };
        return icons[type] || '<i class="fas fa-question"></i>';
    }

    static updateAlertList() {
        const alerts = DataManager.getAlerts().slice(0, 5); // Show only 5 most recent
        const alertList = document.getElementById('alert-list');
        
        if (!alertList) return;
        
        alertList.innerHTML = alerts.map(alert => `
            <div class="alert-item" onclick="UIManager.viewAlert('${alert.id}')">
                <div class="alert-header">
                    <span class="alert-protocol">${alert.protocol}</span>
                    <span class="alert-confidence">${alert.confidence}</span>
                </div>
                <div class="alert-body">
                    <div class="alert-type">${alert.type}</div>
                    <div class="alert-location">${alert.location}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
                <div class="alert-footer">
                    <span class="severity-badge ${alert.severity}">${alert.severity}</span>
                    <span class="status-badge ${alert.status}">${alert.status}</span>
                </div>
            </div>
        `).join('');
    }

    static updateProtocolPerformance() {
        const protocols = DataManager.getProtocols();
        const protocolContainer = document.getElementById('protocol-performance');
        
        if (!protocolContainer) return;
        
        protocolContainer.innerHTML = protocols.map(protocol => `
            <div class="protocol-item-small">
                <div class="protocol-header-small">
                    <span class="protocol-name">${protocol.name}</span>
                    <span class="protocol-id">${protocol.id}</span>
                </div>
                <div class="protocol-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${protocol.effectiveness}%"></div>
                    </div>
                    <span class="progress-text">${protocol.effectiveness}%</span>
                </div>
                <div class="protocol-stats-small">
                    <span class="stat"><i class="fas fa-bolt"></i> ${protocol.triggers}</span>
                    <span class="stat"><i class="fas fa-clock"></i> ${protocol.lastUsed}</span>
                </div>
            </div>
        `).join('');
    }

    static updateImpactMetrics() {
        const metrics = DataManager.getMetrics();
        
        const accidentsElement = document.getElementById('accidents-prevented');
        const livesElement = document.getElementById('lives-saved');
        const economicElement = document.getElementById('economic-impact');
        
        if (accidentsElement) accidentsElement.textContent = metrics.accidentsPrevented;
        if (livesElement) livesElement.textContent = metrics.livesSaved;
        if (economicElement) economicElement.textContent = metrics.economicImpact;
    }

    static initializeCharts() {
        // Initialize impact chart
        const impactCtx = document.getElementById('impact-chart');
        if (impactCtx) {
            this.charts.impact = this.createImpactChart(impactCtx);
        }
    }

    static createImpactChart(ctx) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Accidents Prevented',
                    data: [12, 19, 8, 15, 22, 18, 24],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Risk Level',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    static toggleEmergencyMode(enabled) {
        this.emergencyMode = enabled;
        
        if (enabled) {
            document.body.classList.add('emergency-mode');
            
            // Update emergency button
            const emergencyBtn = document.querySelector('.header-btn');
            if (emergencyBtn) {
                emergencyBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Emergency Active</span>';
                emergencyBtn.classList.add('emergency-active');
            }
            
            // Show emergency notification
            if (window.NotificationManager) {
                window.NotificationManager.showWarning(
                    'Emergency protocols activated. All systems at maximum alert.',
                    'Emergency Mode Activated'
                );
            }
        } else {
            document.body.classList.remove('emergency-mode');
            
            // Update emergency button
            const emergencyBtn = document.querySelector('.header-btn');
            if (emergencyBtn) {
                emergencyBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Emergency Mode</span>';
                emergencyBtn.classList.remove('emergency-active');
            }
            
            // Show deactivation notification
            if (window.NotificationManager) {
                window.NotificationManager.showSuccess(
                    'Emergency mode deactivated. Returning to normal operations.',
                    'Emergency Mode Deactivated'
                );
            }
        }
    }

    static updateSimulationResults(results) {
        const riskElement = document.getElementById('last-risk-reduction');
        const responseElement = document.getElementById('last-response-time');
        const accuracyElement = document.getElementById('last-accuracy');
        
        if (riskElement) riskElement.textContent = results.riskReduction;
        if (responseElement) responseElement.textContent = results.responseTime;
        if (accuracyElement) accuracyElement.textContent = results.accuracy;
    }

    static onTabChange(detail) {
        console.log(`Tab changed to: ${detail.tabName}`);
        
        // Initialize components specific to this tab
        switch(detail.tabId) {
            case 'map':
                if (window.MapManager) {
                    setTimeout(() => {
                        if (window.MapManager.fullMap) {
                            window.MapManager.fullMap.invalidateSize();
                        }
                    }, 300);
                }
                break;
            case 'analytics':
                this.initializeAnalyticsCharts();
                break;
        }
    }

    static initializeAnalyticsCharts() {
        // Initialize analytics charts when analytics tab is opened
        // This would be implemented when the analytics tab is fully built
    }

    static selectResource(resourceId) {
        const resource = DataManager.getResources().find(r => r.id === resourceId);
        if (resource) {
            if (window.NotificationManager) {
                window.NotificationManager.showInfo(
                    `Selected ${resource.name} (${resource.type}) - Status: ${resource.status}`,
                    'Resource Selected'
                );
            }
        }
    }

    static viewAlert(alertId) {
        const alert = DataManager.getAlerts().find(a => a.id === alertId);
        if (alert) {
            // Switch to alerts tab
            if (window.TabManager) {
                window.TabManager.switchToTab('alerts');
            }
            
            // In a full implementation, you would highlight the specific alert
            alert(`Viewing alert: ${alert.type}\n\nDetails:\n${JSON.stringify(alert, null, 2)}`);
        }
    }

    static updateImpactChart() {
        const timePeriod = document.getElementById('time-period')?.value || '7d';
        
        // Update chart based on selected time period
        if (this.charts.impact) {
            // In a real implementation, you would fetch new data based on time period
            // For now, we'll just update the chart with mock data
            const newData = this.generateMockChartData(timePeriod);
            this.charts.impact.data.datasets[0].data = newData.accidents;
            this.charts.impact.data.datasets[1].data = newData.risk;
            this.charts.impact.update();
            
            if (window.NotificationManager) {
                window.NotificationManager.showSuccess(
                    `Chart updated for ${timePeriod} period`,
                    'Chart Updated'
                );
            }
        }
    }

    static generateMockChartData(period) {
        const dataPoints = period === '24h' ? 24 : period === '7d' ? 7 : 30;
        
        const accidents = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 30) + 10);
        const risk = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 50) + 30);
        
        return { accidents, risk };
    }

    static getStatus() {
        return {
            initialized: this.isInitialized,
            emergencyMode: this.emergencyMode,
            charts: Object.keys(this.charts)
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}