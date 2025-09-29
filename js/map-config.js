// Map configuration and data processing
class TwinCitiesMap {
    constructor() {
        this.map = null;
        this.citiesData = null;
        this.markers = {
            bulgarian: [],
            twin: []
        };
        this.connections = [];
        this.activeConnections = [];
        
        // Map configuration
        this.config = {
            center: [42.7339, 25.4858], // Center of Bulgaria
            zoom: 6,
            minZoom: 2,
            maxZoom: 18,
            bulgariaZoom: 7
        };
        
        // Custom icons
        this.icons = {
            bulgarian: L.divIcon({
                className: 'bulgarian-city-marker',
                html: '<div class="marker-pin bulgarian-pin"></div>',
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            }),
            twin: L.divIcon({
                className: 'twin-city-marker',
                html: '<div class="marker-pin twin-pin"></div>',
                iconSize: [14, 14],
                iconAnchor: [5, 5]
            })
        };
    }
    
    // Initialize the map
    async init() {
        try {
            // Create map
            this.map = L.map('map').setView(this.config.center, this.config.zoom);
            
            // Add dark theme tile layer with country outlines only
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                minZoom: this.config.minZoom,
                maxZoom: this.config.maxZoom,
                subdomains: 'abcd'
            }).addTo(this.map);
            
            // Add country labels layer for dark theme
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                minZoom: this.config.minZoom,
                maxZoom: this.config.maxZoom,
                subdomains: 'abcd',
                pane: 'shadowPane'
            }).addTo(this.map);
            
            // Load and process data
            await this.loadCitiesData();
            this.createMarkers();
            this.setupEventHandlers();
            
            console.log('Twin Cities Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
            this.showError('Failed to initialize map. Please refresh the page.');
        }
    }
    
    // Load cities data from JSON
    async loadCitiesData() {
        try {
            const response = await fetch('data/cities.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.citiesData = await response.json();
        } catch (error) {
            console.error('Error loading cities data:', error);
            throw error;
        }
    }
    
    // Create markers for all cities
    createMarkers() {
        if (!this.citiesData || !this.citiesData.bulgarianCities) {
            console.error('No cities data available');
            return;
        }
        
        this.citiesData.bulgarianCities.forEach(city => {
            this.createBulgarianCityMarker(city);
            city.twinCities.forEach(twinCity => {
                this.createTwinCityMarker(twinCity, city);
            });
        });
    }
    
    // Create marker for Bulgarian city
    createBulgarianCityMarker(city) {
        const marker = L.marker(city.coordinates, { icon: this.icons.bulgarian })
            .addTo(this.map);
        
        marker.cityData = city;
        marker.on('click', () => this.onBulgarianCityClick(city));
        
        this.markers.bulgarian.push(marker);
    }
    
    // Create marker for twin city
    createTwinCityMarker(twinCity, parentCity) {
        const marker = L.marker(twinCity.coordinates, { icon: this.icons.twin })
            .addTo(this.map);
        
        marker.twinCityData = twinCity;
        marker.parentCityData = parentCity;
        marker.on('click', () => this.onTwinCityClick(twinCity, parentCity));
        
        this.markers.twin.push(marker);
    }
    
    
    // Handle Bulgarian city click
    onBulgarianCityClick(city) {
        this.clearActiveConnections();
        this.showCityConnections(city);
        this.updateInfoPanel(city);
    }
    
    // Handle twin city click
    onTwinCityClick(twinCity, parentCity) {
        this.clearActiveConnections();
        this.showConnectionToParent(twinCity, parentCity);
        this.updateInfoPanelForTwinCity(twinCity, parentCity);
    }
    
    // Focus map on a specific city
    focusOnCity(coordinates, cityName) {
        this.map.setView(coordinates, 10);
        // Don't update the info panel - preserve the current twin cities list
    }
    
    // Show connections for a specific city
    showCityConnections(city) {
        city.twinCities.forEach(twinCity => {
            const connection = L.polyline(
                [city.coordinates, twinCity.coordinates],
                {
                    color: this.getConnectionColor(city),
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '5, 10'
                }
            ).addTo(this.map);
            
            this.activeConnections.push(connection);
        });
    }
    
    // Get color for connections based on city
    getConnectionColor(city) {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        const index = this.citiesData.bulgarianCities.findIndex(c => c.id === city.id);
        return colors[index % colors.length];
    }
    
    // Show connection from twin city to its Bulgarian parent
    showConnectionToParent(twinCity, parentCity) {
        const connection = L.polyline(
            [twinCity.coordinates, parentCity.coordinates],
            {
                color: this.getConnectionColor(parentCity),
                weight: 2,
                opacity: 0.7,
                dashArray: '5, 10'
            }
        ).addTo(this.map);
        
        this.activeConnections.push(connection);
    }
    
    // Clear active connections
    clearActiveConnections() {
        this.activeConnections.forEach(connection => {
            this.map.removeLayer(connection);
        });
        this.activeConnections = [];
    }
    
    // Show all connections
    showAllConnections() {
        this.clearActiveConnections();
        this.citiesData.bulgarianCities.forEach(city => {
            this.showCityConnections(city);
        });
        this.updateInfoPanel(null, 'Showing all twin city connections.');
    }
    
    // Hide all connections
    hideAllConnections() {
        this.clearActiveConnections();
        this.updateInfoPanel(null, 'All connections hidden. Click on a Bulgarian city to see its twin cities.');
    }
    
    // Focus on Bulgaria
    focusOnBulgaria() {
        this.map.setView(this.config.center, this.config.bulgariaZoom);
    }

    focusOnEurope() {
        this.map.setView([48.210529, 13.472354], 4); // Center of Europe
    }
    
    // Update info panel
    updateInfoPanel(city, message = null) {
        const infoDiv = document.getElementById('cityInfo');
        
        if (message) {
            infoDiv.innerHTML = `<div class="empty-state">${message}</div>`;
            return;
        }
        
        if (!city) {
            infoDiv.innerHTML = `
                <div class="empty-state">
                    All connections hidden. Click on a Bulgarian city to see its twin cities.
                </div>
            `;
            return;
        }
        
        const twinCitiesHtml = city.twinCities.map(twin => `
            <div class="twin-city clickable" onclick="window.twinCitiesMap.focusOnCity([${twin.coordinates[0]}, ${twin.coordinates[1]}], '${twin.name}')">
                <strong>${twin.name}, ${twin.country}</strong>
            </div>
        `).join('');
        
        infoDiv.innerHTML = `
            <h4>${city.name} - ${city.twinCities.length}</h4>
            ${twinCitiesHtml}
        `;
    }
    
    // Update info panel for twin city
    updateInfoPanelForTwinCity(twinCity, parentCity) {
        const infoDiv = document.getElementById('cityInfo');
        
        infoDiv.innerHTML = `
            <h4>${twinCity.name}, ${twinCity.country}</h4>
            <div class="twin-city clickable" onclick="window.twinCitiesMap.focusOnCity([${parentCity.coordinates[0]}, ${parentCity.coordinates[1]}], '${parentCity.name}')">
                <strong>${parentCity.name}, Bulgaria</strong>
            </div>
        `;
    }
    
    // Setup event handlers
    setupEventHandlers() {
        // Control buttons
        document.getElementById('showAllConnections').addEventListener('click', () => {
            this.showAllConnections();
        });
        
        document.getElementById('hideAllConnections').addEventListener('click', () => {
            this.hideAllConnections();
        });
        
        document.getElementById('focusBulgaria').addEventListener('click', () => {
            this.focusOnBulgaria();
        });

        document.getElementById('focusEurope').addEventListener('click', () => {
            this.focusOnEurope();
        });
    }
    
    // Show error message
    showError(message) {
        const mapDiv = document.getElementById('map');
        mapDiv.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: #f8f9fa;">
                <div style="text-align: center; color: #dc3545;">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}

// Add custom CSS for markers
const markerStyles = `
    .marker-pin {
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .bulgarian-pin {
        background-color: #0066ffff;
        width: 14px;
        height: 14px;
    }
    
    .twin-pin {
        background-color: #6a9fddff;
        width: 10px;
        height: 10px;
    }
    
    .bulgarian-city-marker, .twin-city-marker {
        background: none;
        border: none;
    }
`;

// Inject marker styles
const styleSheet = document.createElement('style');
styleSheet.textContent = markerStyles;
document.head.appendChild(styleSheet);
