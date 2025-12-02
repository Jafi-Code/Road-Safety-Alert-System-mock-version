// Data Manager
class DataManager {
    static data = {
        alerts: [],
        resources: [],
        protocols: [],
        metrics: {},
        simulations: [],
        playbook: {},
        settings: {}
    };

    static alerts = [
        {
            id: 'alert-001',
            time: '14:30:22',
            type: 'Speed Violation',
            protocol: 'SP-001',
            location: 'M1 Highway, KM 12.5',
            severity: 'high',
            confidence: 0.92,
            status: 'active',
            description: 'Multiple vehicles exceeding speed limit by 40+ km/h'
        },
        {
            id: 'alert-002',
            time: '14:25:15',
            type: 'Lane Departure',
            protocol: 'LD-003',
            location: 'N1 Northbound, KM 8.2',
            severity: 'medium',
            confidence: 0.85,
            status: 'active',
            description: 'Commercial vehicle drifting between lanes'
        },
        {
            id: 'alert-003',
            time: '14:15:42',
            type: 'Congestion',
            protocol: 'CG-002',
            location: 'CBD Intersection',
            severity: 'low',
            confidence: 0.78,
            status: 'active',
            description: 'Traffic buildup exceeding 1km'
        },
        {
            id: 'alert-004',
            time: '13:45:18',
            type: 'Weather Hazard',
            protocol: 'WH-004',
            location: 'M2 Eastbound',
            severity: 'high',
            confidence: 0.95,
            status: 'active',
            description: 'Heavy rainfall reducing visibility'
        },
        {
            id: 'alert-005',
            time: '13:30:55',
            type: 'Accident Detection',
            protocol: 'AD-001',
            location: 'R24 Highway',
            severity: 'critical',
            confidence: 0.98,
            status: 'active',
            description: 'Two-vehicle collision detected'
        }
    ];

    static resources = [
        { id: 'res-001', name: 'Patrol Unit A1', type: 'vehicle', status: 'available', location: 'Zone 1', capacity: 4 },
        { id: 'res-002', name: 'Traffic Camera 12', type: 'camera', status: 'active', location: 'M1-12.5', lastCheck: '14:25' },
        { id: 'res-003', name: 'Response Team B', type: 'team', status: 'available', location: 'HQ', members: 3 },
        { id: 'res-004', name: 'Drone Unit 3', type: 'drone', status: 'charging', location: 'Station 2', battery: 45 },
        { id: 'res-005', name: 'Variable Signs 8', type: 'sign', status: 'active', location: 'N1-8.2', message: 'Speed Limit 80' },
        { id: 'res-006', name: 'Patrol Unit C2', type: 'vehicle', status: 'on-duty', location: 'Zone 3', capacity: 3 },
        { id: 'res-007', name: 'Traffic Camera 45', type: 'camera', status: 'maintenance', location: 'CBD-5', lastCheck: '13:45' },
        { id: 'res-008', name: 'Response Team D', type: 'team', status: 'available', location: 'Substation', members: 4 }
    ];

    static protocols = [
        { id: 'SP-001', name: 'Speed Enforcement', effectiveness: 92, lastUsed: '14:30', triggers: 45 },
        { id: 'LD-003', name: 'Lane Discipline', effectiveness: 87, lastUsed: '14:25', triggers: 28 },
        { id: 'CG-002', name: 'Congestion Management', effectiveness: 78, lastUsed: '14:15', triggers: 62 },
        { id: 'WH-004', name: 'Weather Response', effectiveness: 95, lastUsed: '13:45', triggers: 15 },
        { id: 'AD-001', name: 'Accident Response', effectiveness: 88, lastUsed: '13:30', triggers: 12 }
    ];

    static metrics = {
        activeTriggers: 5,
        responseTime: '8.2s',
        uptime: '99.8%',
        accidentsPrevented: 42,
        livesSaved: 4.2,
        economicImpact: 'R21M',
        aiEffectiveness: 92.5
    };

    static async init() {
        console.log('Initializing Data Manager...');
        await this.loadFromStorage();
        await this.initializeData();
        return true;
    }

    static async initializeData() {
        // Initialize with mock data if no stored data
        if (this.data.alerts.length === 0) {
            this.data.alerts = this.alerts;
            this.data.resources = this.resources;
            this.data.protocols = this.protocols;
            this.data.metrics = this.metrics;
            this.data.playbook = {
                effectiveness: 92.5,
                lastTrained: new Date().toISOString(),
                scenariosTested: 42
            };
            
            this.calculateMetrics();
            await this.saveToStorage();
        }
    }

    static calculateMetrics() {
        // Calculate real-time metrics
        this.data.metrics.activeTriggers = this.data.alerts.filter(a => a.status === 'active').length;
        this.data.metrics.aiEffectiveness = this.data.protocols.reduce((acc, p) => acc + p.effectiveness, 0) / this.data.protocols.length;
        
        return this.data.metrics;
    }

    static getAlerts() {
        return this.data.alerts;
    }

    static getResources() {
        return this.data.resources;
    }

    static getProtocols() {
        return this.data.protocols;
    }

    static getMetrics() {
        return this.data.metrics;
    }

    static getPlaybook() {
        return this.data.playbook;
    }

    static async addAlert(alert) {
        alert.id = `alert-${Date.now()}`;
        alert.time = new Date().toLocaleTimeString();
        alert.status = 'active';
        
        this.data.alerts.unshift(alert);
        this.calculateMetrics();
        
        if (Config.data.autoSave) {
            await this.saveToStorage();
        }
        
        return alert;
    }

    static async updateAlert(id, updates) {
        const index = this.data.alerts.findIndex(a => a.id === id);
        if (index !== -1) {
            this.data.alerts[index] = { ...this.data.alerts[index], ...updates };
            this.calculateMetrics();
            
            if (Config.data.autoSave) {
                await this.saveToStorage();
            }
            
            return this.data.alerts[index];
        }
        return null;
    }

    static async simulateRandomAlert() {
        const alertTypes = [
            { type: 'Speed Violation', protocol: 'SP-001', severity: 'high' },
            { type: 'Lane Departure', protocol: 'LD-003', severity: 'medium' },
            { type: 'Congestion', protocol: 'CG-002', severity: 'low' },
            { type: 'Weather Hazard', protocol: 'WH-004', severity: 'high' },
            { type: 'Accident Detection', protocol: 'AD-001', severity: 'critical' }
        ];
        
        const locations = [
            'M1 Highway, KM ' + (Math.random() * 20 + 5).toFixed(1),
            'N1 Highway, KM ' + (Math.random() * 15 + 3).toFixed(1),
            'CBD Intersection ' + Math.floor(Math.random() * 10 + 1),
            'R24 Highway, KM ' + (Math.random() * 12 + 2).toFixed(1),
            'School Zone ' + String.fromCharCode(65 + Math.floor(Math.random() * 5))
        ];
        
        const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const newAlert = {
            type: randomType.type,
            protocol: randomType.protocol,
            location: locations[Math.floor(Math.random() * locations.length)],
            severity: randomType.severity,
            confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
            description: `Simulated ${randomType.type.toLowerCase()} detected`
        };
        
        return await this.addAlert(newAlert);
    }

    static async loadFromStorage() {
        try {
            const saved = localStorage.getItem(Config.data.localStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed };
                console.log('Data loaded from storage');
            }
        } catch (error) {
            console.warn('Could not load data from storage:', error);
        }
    }

    static async saveToStorage() {
        try {
            localStorage.setItem(Config.data.localStorageKey, JSON.stringify(this.data));
            console.log('Data saved to storage');
        } catch (error) {
            console.error('Could not save data to storage:', error);
        }
    }

    static clearData() {
        this.data = {
            alerts: [],
            resources: [],
            protocols: [],
            metrics: {},
            simulations: [],
            playbook: {},
            settings: {}
        };
        
        localStorage.removeItem(Config.data.localStorageKey);
        console.log('All data cleared');
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}