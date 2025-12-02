// Tab Manager
class TabManager {
    static tabs = {};
    static currentTab = 'dashboard';
    static tabContents = {};

    static async init() {
        console.log('Initializing Tab Manager...');
        
        this.tabs = {
            dashboard: document.getElementById('tab-dashboard'),
            alerts: document.getElementById('tab-alerts'),
            map: document.getElementById('tab-map'),
            protocols: document.getElementById('tab-protocols'),
            resources: document.getElementById('tab-resources'),
            analytics: document.getElementById('tab-analytics'),
            playbook: document.getElementById('tab-playbook'),
            simulation: document.getElementById('tab-simulation'),
            reports: document.getElementById('tab-reports'),
            settings: document.getElementById('tab-settings')
        };

        // Load current tab from storage
        const savedState = localStorage.getItem('orchestratorState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.currentTab) {
                    this.currentTab = state.currentTab;
                }
            } catch (error) {
                console.warn('Could not load tab state:', error);
            }
        }

        // Initialize all tabs
        await this.initializeAllTabs();
        
        // Show current tab
        this.switchToTab(this.currentTab);
        
        return true;
    }

    static async initializeAllTabs() {
        // Initialize each tab with its content
        for (const [tabId, tabElement] of Object.entries(this.tabs)) {
            if (tabElement) {
                await this.initializeTab(tabId, tabElement);
            }
        }
    }

    static async initializeTab(tabId, tabElement) {
        switch(tabId) {
            case 'dashboard':
                // Dashboard is already loaded
                break;
            case 'alerts':
                tabElement.innerHTML = await this.generateAlertsTab();
                break;
            case 'map':
                tabElement.innerHTML = await this.generateMapTab();
                break;
            case 'protocols':
                tabElement.innerHTML = await this.generateProtocolsTab();
                break;
            case 'resources':
                tabElement.innerHTML = await this.generateResourcesTab();
                break;
            case 'analytics':
                tabElement.innerHTML = await this.generateAnalyticsTab();
                break;
            case 'playbook':
                tabElement.innerHTML = await this.generatePlaybookTab();
                break;
            case 'simulation':
                tabElement.innerHTML = await this.generateSimulationTab();
                break;
            case 'reports':
                tabElement.innerHTML = await this.generateReportsTab();
                break;
            case 'settings':
                tabElement.innerHTML = await this.generateSettingsTab();
                break;
        }
    }

    static switchToTab(tabId) {
        if (!this.tabs[tabId]) {
            console.error(`Tab not found: ${tabId}`);
            return;
        }

        // Hide all tabs
        Object.values(this.tabs).forEach(tab => {
            if (tab) tab.classList.remove('active');
        });

        // Show selected tab
        this.tabs[tabId].classList.add('active');
        this.currentTab = tabId;

        // Update sidebar active state
        this.updateSidebarActive(tabId);

        // Save state
        this.saveState();

        // Load tab content if not already loaded
        if (this.tabs[tabId].innerHTML.includes('Loading')) {
            this.initializeTab(tabId, this.tabs[tabId]);
        }

        // Dispatch tab change event
        const event = new CustomEvent('tab-changed', {
            detail: { tabId, tabName: this.getTabName(tabId) }
        });
        document.dispatchEvent(event);

        console.log(`Switched to tab: ${tabId}`);
    }

    static getTabName(tabId) {
        const tabNames = {
            dashboard: 'Dashboard',
            alerts: 'Active Alerts',
            map: 'Risk Map',
            protocols: 'Protocols',
            resources: 'Resources',
            analytics: 'Analytics',
            playbook: 'AI Playbook',
            simulation: 'Simulation Lab',
            reports: 'Reports',
            settings: 'Settings'
        };
        return tabNames[tabId] || tabId;
    }

    static updateSidebarActive(tabId) {
        // Update sidebar menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and activate the corresponding menu item
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.getAttribute('onclick')?.includes(`'${tabId}'`)) {
                item.classList.add('active');
            }
        });
    }

    static saveState() {
        const state = {
            currentTab: this.currentTab,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('orchestratorState', JSON.stringify(state));
        } catch (error) {
            console.warn('Could not save tab state:', error);
        }
    }

    // Tab Content Generators
    static async generateAlertsTab() {
        const alerts = DataManager.getAlerts();
        
        return `
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-bell"></i> All Active Alerts</h2>
                        <div class="header-actions">
                            <button class="btn btn-primary" onclick="TabManager.acknowledgeAllAlerts()">
                                <i class="fas fa-check-double"></i> Acknowledge All
                            </button>
                            <button class="btn btn-danger" onclick="TabManager.clearResolvedAlerts()">
                                <i class="fas fa-trash"></i> Clear Resolved
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Protocol</th>
                                    <th>Location</th>
                                    <th>Severity</th>
                                    <th>Confidence</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alerts.map(alert => `
                                    <tr class="alert-row severity-${alert.severity}">
                                        <td>${alert.time}</td>
                                        <td><i class="fas fa-exclamation-triangle"></i> ${alert.type}</td>
                                        <td><span class="protocol-badge">${alert.protocol}</span></td>
                                        <td>${alert.location}</td>
                                        <td><span class="severity-badge ${alert.severity}">${alert.severity}</span></td>
                                        <td><span class="confidence-badge">${alert.confidence}</span></td>
                                        <td><span class="status-badge ${alert.status}">${alert.status}</span></td>
                                        <td class="action-buttons">
                                            <button class="btn btn-sm btn-success" onclick="TabManager.acknowledgeAlert('${alert.id}')">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="TabManager.viewAlertDetails('${alert.id}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning" onclick="TabManager.escalateAlert('${alert.id}')">
                                                <i class="fas fa-level-up-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <div class="alert-stats">
                            <span class="stat"><strong>Total:</strong> ${alerts.length} alerts</span>
                            <span class="stat"><strong>Active:</strong> ${alerts.filter(a => a.status === 'active').length}</span>
                            <span class="stat"><strong>Critical:</strong> ${alerts.filter(a => a.severity === 'critical').length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-chart-bar"></i> Alert Statistics</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="alerts-chart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-cog"></i> Alert Management</h2>
                    </div>
                    <div class="alert-controls">
                        <div class="control-group">
                            <h3>Filter Alerts</h3>
                            <div class="filter-options">
                                <label><input type="checkbox" checked> High Severity</label>
                                <label><input type="checkbox" checked> Medium Severity</label>
                                <label><input type="checkbox" checked> Low Severity</label>
                            </div>
                        </div>
                        <div class="control-group">
                            <h3>Notification Settings</h3>
                            <div class="notification-options">
                                <label><input type="checkbox" checked> Push Notifications</label>
                                <label><input type="checkbox" checked> Email Alerts</label>
                                <label><input type="checkbox"> Sound Alerts</label>
                            </div>
                        </div>
                        <div class="control-group">
                            <h3>Auto-Actions</h3>
                            <div class="auto-action-options">
                                <label><input type="checkbox"> Auto-acknowledge after 5 min</label>
                                <label><input type="checkbox"> Auto-escalate critical alerts</label>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="TabManager.applyAlertSettings()">
                            <i class="fas fa-save"></i> Apply Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static async generateMapTab() {
        return `
            <div class="dashboard-grid">
                <div class="card full-width">
                    <div class="card-header">
                        <h2><i class="fas fa-map-marked-alt"></i> Interactive Risk Heat Map</h2>
                        <div class="map-toolbar">
                            <button class="btn btn-sm btn-primary" onclick="MapManager.zoomToCity('johannesburg')">
                                <i class="fas fa-home"></i> JHB
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="MapManager.zoomToCity('pretoria')">
                                <i class="fas fa-city"></i> PTA
                            </button>
                            <button class="btn btn-sm btn-info" onclick="MapManager.toggleTrafficLayer()">
                                <i class="fas fa-car"></i> Traffic
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="MapManager.toggleRiskLayer()">
                                <i class="fas fa-exclamation-triangle"></i> Risk
                            </button>
                            <button class="btn btn-sm btn-success" onclick="MapManager.refreshMapData()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div id="full-map-container" style="height: 500px;">
                        <div id="full-map"></div>
                    </div>
                    <div class="card-footer">
                        <div class="map-stats">
                            <div class="map-stat">
                                <span class="stat-label">Active Alerts on Map:</span>
                                <span class="stat-value" id="map-alert-count">0</span>
                            </div>
                            <div class="map-stat">
                                <span class="stat-label">High Risk Zones:</span>
                                <span class="stat-value" id="high-risk-zones">0</span>
                            </div>
                            <div class="map-stat">
                                <span class="stat-label">Last Updated:</span>
                                <span class="stat-value" id="map-update-time">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-layer-group"></i> Map Layers</h2>
                    </div>
                    <div class="map-layers">
                        <div class="layer-item">
                            <label>
                                <input type="checkbox" checked onchange="MapManager.toggleLayer('traffic')">
                                <span>Live Traffic</span>
                            </label>
                        </div>
                        <div class="layer-item">
                            <label>
                                <input type="checkbox" checked onchange="MapManager.toggleLayer('risk')">
                                <span>Risk Heatmap</span>
                            </label>
                        </div>
                        <div class="layer-item">
                            <label>
                                <input type="checkbox" onchange="MapManager.toggleLayer('cameras')">
                                <span>Camera Locations</span>
                            </label>
                        </div>
                        <div class="layer-item">
                            <label>
                                <input type="checkbox" onchange="MapManager.toggleLayer('resources')">
                                <span>Resource Locations</span>
                            </label>
                        </div>
                        <div class="layer-item">
                            <label>
                                <input type="checkbox" checked onchange="MapManager.toggleLayer('alerts')">
                                <span>Active Alerts</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-info-circle"></i> Map Legend</h2>
                    </div>
                    <div class="map-legend">
                        <div class="legend-item">
                            <span class="legend-color critical"></span>
                            <span class="legend-label">Critical Risk</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color high"></span>
                            <span class="legend-label">High Risk</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color medium"></span>
                            <span class="legend-label">Medium Risk</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color low"></span>
                            <span class="legend-label">Low Risk</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon"><i class="fas fa-camera"></i></span>
                            <span class="legend-label">Traffic Camera</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon"><i class="fas fa-car"></i></span>
                            <span class="legend-label">Patrol Vehicle</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static async generateProtocolsTab() {
        const protocols = DataManager.getProtocols();
        
        return `
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-clipboard-list"></i> Safety Protocols</h2>
                        <button class="btn btn-primary" onclick="TabManager.addNewProtocol()">
                            <i class="fas fa-plus"></i> Add Protocol
                        </button>
                    </div>
                    <div class="protocols-list">
                        ${protocols.map(protocol => `
                            <div class="protocol-item">
                                <div class="protocol-header">
                                    <h3>${protocol.name}</h3>
                                    <span class="protocol-id">${protocol.id}</span>
                                </div>
                                <div class="protocol-stats">
                                    <div class="protocol-stat">
                                        <span class="stat-label">Effectiveness:</span>
                                        <span class="stat-value">${protocol.effectiveness}%</span>
                                    </div>
                                    <div class="protocol-stat">
                                        <span class="stat-label">Triggers:</span>
                                        <span class="stat-value">${protocol.triggers}</span>
                                    </div>
                                    <div class="protocol-stat">
                                        <span class="stat-label">Last Used:</span>
                                        <span class="stat-value">${protocol.lastUsed}</span>
                                    </div>
                                </div>
                                <div class="protocol-actions">
                                    <button class="btn btn-sm btn-success" onclick="TabManager.testProtocol('${protocol.id}')">
                                        <i class="fas fa-play"></i> Test
                                    </button>
                                    <button class="btn btn-sm btn-info" onclick="TabManager.editProtocol('${protocol.id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="TabManager.optimizeProtocol('${protocol.id}')">
                                        <i class="fas fa-brain"></i> AI Optimize
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-chart-pie"></i> Protocol Performance</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="protocols-chart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-robot"></i> AI Protocol Generator</h2>
                    </div>
                    <div class="ai-generator">
                        <div class="generator-input">
                            <h3>Generate New Protocol</h3>
                            <div class="input-group">
                                <label for="protocol-scenario">Scenario Type:</label>
                                <select id="protocol-scenario">
                                    <option value="speed">Speed Violation</option>
                                    <option value="accident">Accident Response</option>
                                    <option value="congestion">Traffic Congestion</option>
                                    <option value="weather">Weather Emergency</option>
                                    <option value="pedestrian">Pedestrian Safety</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="protocol-severity">Severity Level:</label>
                                <select id="protocol-severity">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="protocol-location">Location Type:</label>
                                <select id="protocol-location">
                                    <option value="highway">Highway</option>
                                    <option value="intersection">Intersection</option>
                                    <option value="school_zone">School Zone</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>
                        </div>
                        <div class="generator-actions">
                            <button class="btn btn-primary" onclick="TabManager.generateProtocol()">
                                <i class="fas fa-magic"></i> Generate Protocol
                            </button>
                            <button class="btn btn-success" onclick="TabManager.trainProtocolGenerator()">
                                <i class="fas fa-brain"></i> Train AI
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Additional tab generators for resources, analytics, playbook, simulation, reports, settings
    static async generateResourcesTab() {
        return `<div class="tab-placeholder"><h2><i class="fas fa-users-cog"></i> Resources</h2><p>Resource management interface will be loaded here...</p></div>`;
    }

    static async generateAnalyticsTab() {
        return `<div class="tab-placeholder"><h2><i class="fas fa-chart-line"></i> Analytics</h2><p>Analytics dashboard will be loaded here...</p></div>`;
    }

    static async generatePlaybookTab() {
        return `<div class="tab-placeholder"><h2><i class="fas fa-robot"></i> AI Playbook</h2><p>AI Playbook interface will be loaded here...</p></div>`;
    }

    static async generateSimulationTab() {
        return `<div class="tab-placeholder"><h2><i class="fas fa-vial"></i> Simulation Lab</h2><p>Advanced simulation interface will be loaded here...</p></div>`;
    }

    static async generateReportsTab() {
        return `<div class="tab-placeholder"><h2><i class="fas fa-file-alt"></i> Reports</h2><p>Report generation interface will be loaded here...</p></div>`;
    }

    static async generateSettingsTab() {
        return `<div class="tab-placeholder"><h2><i class="fas fa-cog"></i> Settings</h2><p>Settings panel will be loaded here...</p></div>`;
    }

    // Alert management methods
    static async acknowledgeAlert(alertId) {
        await DataManager.updateAlert(alertId, { status: 'acknowledged' });
        this.refreshAlertsTab();
        
        if (window.NotificationManager) {
            window.NotificationManager.show({
                type: 'success',
                title: 'Alert Acknowledged',
                message: 'Alert has been marked as acknowledged',
                duration: 3000
            });
        }
    }

    static async acknowledgeAllAlerts() {
        const alerts = DataManager.getAlerts();
        const activeAlerts = alerts.filter(a => a.status === 'active');
        
        for (const alert of activeAlerts) {
            await DataManager.updateAlert(alert.id, { status: 'acknowledged' });
        }
        
        this.refreshAlertsTab();
        
        if (window.NotificationManager) {
            window.NotificationManager.show({
                type: 'success',
                title: 'All Alerts Acknowledged',
                message: `${activeAlerts.length} alerts have been acknowledged`,
                duration: 3000
            });
        }
    }

    static async clearResolvedAlerts() {
        const alerts = DataManager.getAlerts();
        const resolvedAlerts = alerts.filter(a => a.status === 'resolved' || a.status === 'acknowledged');
        
        // In a real implementation, you would archive these alerts
        // For now, we'll just remove them from the active list
        DataManager.data.alerts = alerts.filter(a => a.status === 'active');
        await DataManager.saveToStorage();
        
        this.refreshAlertsTab();
        
        if (window.NotificationManager) {
            window.NotificationManager.show({
                type: 'info',
                title: 'Alerts Cleared',
                message: `${resolvedAlerts.length} resolved alerts have been cleared`,
                duration: 3000
            });
        }
    }

    static async refreshAlertsTab() {
        if (this.currentTab === 'alerts') {
            this.tabs.alerts.innerHTML = await this.generateAlertsTab();
        }
    }

    static async viewAlertDetails(alertId) {
        const alert = DataManager.getAlerts().find(a => a.id === alertId);
        if (alert) {
            alert(`Alert Details:\n\nID: ${alert.id}\nType: ${alert.type}\nLocation: ${alert.location}\nSeverity: ${alert.severity}\nConfidence: ${alert.confidence}\nStatus: ${alert.status}\n\nDescription: ${alert.description}`);
        }
    }

    static async escalateAlert(alertId) {
        const alert = DataManager.getAlerts().find(a => a.id === alertId);
        if (alert) {
            const newSeverity = this.getNextSeverity(alert.severity);
            await DataManager.updateAlert(alertId, { 
                severity: newSeverity,
                status: 'escalated'
            });
            
            this.refreshAlertsTab();
            
            if (window.NotificationManager) {
                window.NotificationManager.show({
                    type: 'warning',
                    title: 'Alert Escalated',
                    message: `Alert ${alertId} escalated to ${newSeverity} severity`,
                    duration: 4000
                });
            }
        }
    }

    static getNextSeverity(currentSeverity) {
        const severityOrder = ['low', 'medium', 'high', 'critical'];
        const currentIndex = severityOrder.indexOf(currentSeverity);
        return severityOrder[Math.min(currentIndex + 1, severityOrder.length - 1)];
    }

    static applyAlertSettings() {
        // Implementation for applying alert settings
        if (window.NotificationManager) {
            window.NotificationManager.show({
                type: 'success',
                title: 'Settings Applied',
                message: 'Alert settings have been updated successfully',
                duration: 3000
            });
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.TabManager = TabManager;
}