// Map Manager
class MapManager {
    static map = null;
    static markers = [];
    static layers = {};
    static isInitialized = false;

    static async init() {
        console.log('Initializing Map Manager...');
        
        if (this.isInitialized) return true;
        
        // Wait for DOM to be ready
        await this.waitForElement('#map');
        
        // Initialize map
        this.initializeMap();
        
        // Add layers
        this.addBaseLayers();
        
        // Add markers
        await this.addMarkers();
        
        this.isInitialized = true;
        console.log('Map Manager initialized');
        return true;
    }

    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    static initializeMap() {
        // Initialize main dashboard map
        const mapElement = document.getElementById('map');
        if (mapElement && !this.map) {
            this.map = L.map('map').setView(
                Config.map.defaultCenter, 
                Config.map.defaultZoom
            );

            // Add tile layer
            L.tileLayer(Config.map.tileLayer, {
                attribution: Config.map.tileAttribution,
                maxZoom: Config.map.maxZoom,
                minZoom: Config.map.minZoom
            }).addTo(this.map);

            // Add scale control
            L.control.scale().addTo(this.map);
        }

        // Initialize full map if on map tab
        const fullMapElement = document.getElementById('full-map');
        if (fullMapElement) {
            this.fullMap = L.map('full-map').setView(
                Config.map.defaultCenter, 
                Config.map.defaultZoom
            );

            L.tileLayer(Config.map.tileLayer, {
                attribution: Config.map.tileAttribution,
                maxZoom: Config.map.maxZoom,
                minZoom: Config.map.minZoom
            }).addTo(this.fullMap);

            L.control.scale().addTo(this.fullMap);
        }
    }

    static addBaseLayers() {
        // Add traffic layer (mock)
        this.layers.traffic = L.layerGroup().addTo(this.map);
        
        // Add risk heatmap layer
        this.layers.risk = L.layerGroup().addTo(this.map);
        
        // Add alert markers layer
        this.layers.alerts = L.layerGroup().addTo(this.map);
        
        // Add resource markers layer
        this.layers.resources = L.layerGroup().addTo(this.map);
    }

    static async addMarkers() {
        // Clear existing markers
        this.clearMarkers();

        // Add alert markers
        const alerts = DataManager.getAlerts();
        alerts.forEach(alert => {
            this.addAlertMarker(alert);
        });

        // Add resource markers
        const resources = DataManager.getResources();
        resources.forEach(resource => {
            this.addResourceMarker(resource);
        });

        // Add random traffic markers (mock data)
        this.addTrafficMarkers();
        
        // Add risk heatmap (mock data)
        this.addRiskHeatmap();
    }

    static addAlertMarker(alert) {
        // Generate random coordinates near Johannesburg for demo
        const lat = Config.map.defaultCenter[0] + (Math.random() * 0.1 - 0.05);
        const lng = Config.map.defaultCenter[1] + (Math.random() * 0.1 - 0.05);
        
        const severityColors = {
            critical: '#ef4444',
            high: '#f97316',
            medium: '#f59e0b',
            low: '#10b981'
        };

        const color = severityColors[alert.severity] || '#6b7280';
        
        const icon = L.divIcon({
            html: `<div class="map-marker alert-marker" style="background-color: ${color};">
                     <i class="fas fa-exclamation-triangle"></i>
                   </div>`,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([lat, lng], { icon: icon })
            .addTo(this.layers.alerts)
            .bindPopup(`
                <div class="map-popup">
                    <h3>${alert.type}</h3>
                    <p><strong>Location:</strong> ${alert.location}</p>
                    <p><strong>Severity:</strong> <span class="severity-${alert.severity}">${alert.severity}</span></p>
                    <p><strong>Confidence:</strong> ${alert.confidence}</p>
                    <p><strong>Time:</strong> ${alert.time}</p>
                    <button class="btn btn-sm btn-primary" onclick="MapManager.focusOnAlert('${alert.id}')">
                        View Details
                    </button>
                </div>
            `);

        this.markers.push(marker);
    }

    static addResourceMarker(resource) {
        const lat = Config.map.defaultCenter[0] + (Math.random() * 0.08 - 0.04);
        const lng = Config.map.defaultCenter[1] + (Math.random() * 0.08 - 0.04);
        
        const typeIcons = {
            vehicle: 'car',
            camera: 'camera',
            team: 'users',
            drone: 'drone',
            sign: 'sign'
        };

        const iconName = typeIcons[resource.type] || 'question';
        const statusColors = {
            available: '#10b981',
            active: '#3b82f6',
            'on-duty': '#8b5cf6',
            charging: '#f59e0b',
            maintenance: '#6b7280'
        };

        const color = statusColors[resource.status] || '#6b7280';

        const icon = L.divIcon({
            html: `<div class="map-marker resource-marker" style="background-color: ${color};">
                     <i class="fas fa-${iconName}"></i>
                   </div>`,
            className: 'custom-div-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker([lat, lng], { icon: icon })
            .addTo(this.layers.resources)
            .bindPopup(`
                <div class="map-popup">
                    <h3>${resource.name}</h3>
                    <p><strong>Type:</strong> ${resource.type}</p>
                    <p><strong>Status:</strong> <span class="status-${resource.status}">${resource.status}</span></p>
                    <p><strong>Location:</strong> ${resource.location}</p>
                    ${resource.capacity ? `<p><strong>Capacity:</strong> ${resource.capacity}</p>` : ''}
                    ${resource.battery ? `<p><strong>Battery:</strong> ${resource.battery}%</p>` : ''}
                    <button class="btn btn-sm btn-secondary" onclick="MapManager.deployResource('${resource.id}')">
                        Deploy
                    </button>
                </div>
            `);

        this.markers.push(marker);
    }

    static addTrafficMarkers() {
        // Add mock traffic markers
        for (let i = 0; i < 20; i++) {
            const lat = Config.map.defaultCenter[0] + (Math.random() * 0.15 - 0.075);
            const lng = Config.map.defaultCenter[1] + (Math.random() * 0.15 - 0.075);
            
            const trafficLevel = Math.random();
            const color = trafficLevel > 0.7 ? '#ef4444' : 
                         trafficLevel > 0.4 ? '#f59e0b' : '#10b981';
            const size = Math.max(5, trafficLevel * 15);

            const icon = L.divIcon({
                html: `<div class="traffic-marker" style="width: ${size}px; height: ${size}px; background-color: ${color};"></div>`,
                className: 'custom-div-icon',
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });

            const marker = L.marker([lat, lng], { icon: icon })
                .addTo(this.layers.traffic);

            this.markers.push(marker);
        }
    }

    static addRiskHeatmap() {
        // Add mock risk heatmap points
        const heatPoints = [];
        
        for (let i = 0; i < 50; i++) {
            const lat = Config.map.defaultCenter[0] + (Math.random() * 0.2 - 0.1);
            const lng = Config.map.defaultCenter[1] + (Math.random() * 0.2 - 0.1);
            const intensity = Math.random(); // 0 to 1
            
            heatPoints.push([lat, lng, intensity]);
        }

        // In a real implementation, you would use a heatmap library
        // For now, we'll just add circle markers
        heatPoints.forEach(point => {
            const [lat, lng, intensity] = point;
            const radius = 100 + intensity * 200;
            const color = intensity > 0.7 ? '#ef4444' : 
                         intensity > 0.4 ? '#f59e0b' : 
                         intensity > 0.2 ? '#fbbf24' : '#10b981';
            const opacity = 0.3 + intensity * 0.3;

            const circle = L.circle([lat, lng], {
                radius: radius,
                color: color,
                fillColor: color,
                fillOpacity: opacity,
                weight: 1
            }).addTo(this.layers.risk);

            this.markers.push(circle);
        });
    }

    static clearMarkers() {
        this.markers.forEach(marker => {
            if (this.map && marker.remove) {
                marker.remove();
            }
        });
        this.markers = [];
        
        // Clear all layers
        Object.values(this.layers).forEach(layer => {
            if (layer && layer.clearLayers) {
                layer.clearLayers();
            }
        });
    }

    static zoomToJohannesburg() {
        if (this.map) {
            this.map.setView(Config.map.defaultCenter, Config.map.defaultZoom);
        }
    }

    static zoomToCity(city) {
        const cities = {
            johannesburg: [-26.2041, 28.0473],
            pretoria: [-25.7479, 28.2293],
            capetown: [-33.9249, 18.4241],
            durban: [-29.8587, 31.0218]
        };

        const coords = cities[city] || Config.map.defaultCenter;
        
        if (this.map) {
            this.map.setView(coords, Config.map.defaultZoom);
        }
        
        if (this.fullMap) {
            this.fullMap.setView(coords, Config.map.defaultZoom);
        }
    }

    static toggleTrafficLayer() {
        if (this.layers.traffic) {
            if (this.map.hasLayer(this.layers.traffic)) {
                this.map.removeLayer(this.layers.traffic);
            } else {
                this.map.addLayer(this.layers.traffic);
            }
        }
    }

    static toggleRiskLayer() {
        if (this.layers.risk) {
            if (this.map.hasLayer(this.layers.risk)) {
                this.map.removeLayer(this.layers.risk);
            } else {
                this.map.addLayer(this.layers.risk);
            }
        }
    }

    static toggleLayer(layerName) {
        const layer = this.layers[layerName];
        if (layer && this.map) {
            if (this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
            } else {
                this.map.addLayer(layer);
            }
        }
    }

    static refreshMapData() {
        this.clearMarkers();
        this.addMarkers();
        
        // Update map stats
        this.updateMapStats();
        
        if (window.NotificationManager) {
            window.NotificationManager.show({
                type: 'success',
                title: 'Map Refreshed',
                message: 'Map data has been updated',
                duration: 2000
            });
        }
    }

    static updateMapData() {
        // Update with new data
        this.refreshMapData();
    }

    static updateMapStats() {
        const alerts = DataManager.getAlerts();
        const alertCount = alerts.length;
        const highRiskCount = alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;
        
        const alertCountElement = document.getElementById('map-alert-count');
        const highRiskElement = document.getElementById('high-risk-zones');
        const updateTimeElement = document.getElementById('map-update-time');
        
        if (alertCountElement) alertCountElement.textContent = alertCount;
        if (highRiskElement) highRiskElement.textContent = highRiskCount;
        if (updateTimeElement) {
            const now = new Date();
            updateTimeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    static focusOnAlert(alertId) {
        const alert = DataManager.getAlerts().find(a => a.id === alertId);
        if (alert) {
            // Find the marker for this alert
            // In a real implementation, you would track marker-alert associations
            // For now, we'll just zoom to a random location
            const lat = Config.map.defaultCenter[0] + (Math.random() * 0.05 - 0.025);
            const lng = Config.map.defaultCenter[1] + (Math.random() * 0.05 - 0.025);
            
            if (this.map) {
                this.map.setView([lat, lng], 15);
            }
            
            // Show popup
            alert(`Focusing on alert: ${alert.type}\nLocation: ${alert.location}`);
        }
    }

    static deployResource(resourceId) {
        const resource = DataManager.getResources().find(r => r.id === resourceId);
        if (resource) {
            if (window.NotificationManager) {
                window.NotificationManager.show({
                    type: 'info',
                    title: 'Resource Deployment',
                    message: `Deploying ${resource.name} to selected location...`,
                    duration: 3000
                });
            }
            
            // Simulate deployment
            setTimeout(() => {
                if (window.NotificationManager) {
                    window.NotificationManager.show({
                        type: 'success',
                        title: 'Deployment Complete',
                        message: `${resource.name} has been deployed successfully`,
                        duration: 3000
                    });
                }
            }, 2000);
        }
    }

    static getStatus() {
        return {
            initialized: this.isInitialized,
            map: this.map ? 'Loaded' : 'Not loaded',
            layers: Object.keys(this.layers),
            markers: this.markers.length
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MapManager = MapManager;
}