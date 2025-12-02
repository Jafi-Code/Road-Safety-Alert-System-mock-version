// Prevention Orchestrator Configuration
const Config = {
    // Application Settings
    app: {
        name: 'Prevention Orchestrator',
        version: '1.0.0',
        environment: 'development',
        debug: true
    },

    // API Endpoints (Update these when you have actual endpoints)
    api: {
        mlModel: 'https://your-colab-model-endpoint.com/predict',
        trainingEndpoint: 'https://your-colab-model-endpoint.com/train',
        dataApi: 'https://your-data-api.com/api',
        simulation: 'https://your-simulation-api.com/run'
    },

    // Map Configuration
    map: {
        defaultCenter: [-26.2041, 28.0473], // Johannesburg
        defaultZoom: 12,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 8
    },

    // Simulation Settings
    simulation: {
        enabled: true,
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        maxAlerts: 50,
        alertLifetime: 3600000 // 1 hour
    },

    // ML Model Settings
    ml: {
        enabled: true,
        predictionThreshold: 0.7,
        confidenceThreshold: 0.8,
        retrainInterval: 3600000, // 1 hour
        modelVersion: 'v1.0'
    },

    // UI Settings
    ui: {
        theme: 'dark',
        animations: true,
        compactMode: false,
        sidebarCollapsed: false,
        emergencyMode: false
    },

    // Data Settings
    data: {
        localStorageKey: 'preventionOrchestratorData',
        autoSave: true,
        saveInterval: 60000 // 1 minute
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Config = Config;
}

if (typeof module !== 'undefined') {
    module.exports = Config;
}