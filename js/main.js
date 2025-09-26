// Main application entry point
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Twin Cities Map application starting...');
    
    // Show loading state
    showLoadingState();
    
    try {
        // Initialize the map
        const twinCitiesMap = new TwinCitiesMap();
        await twinCitiesMap.init();
        
        // Hide loading state
        hideLoadingState();
        
        // Make map instance globally available for debugging
        window.twinCitiesMap = twinCitiesMap;
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorState('Failed to load the twin cities map. Please check your internet connection and refresh the page.');
    }
});

// Show loading state
function showLoadingState() {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `
        <div class="loading">
            <div style="text-align: center;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 20px; color: #666;">Loading Bulgarian Twin Cities Map...</p>
            </div>
        </div>
    `;
    
    // Disable controls during loading
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

// Hide loading state
function hideLoadingState() {
    // Enable controls
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

// Show error state
function showErrorState(message) {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: #f8f9fa; border-radius: 10px;">
            <div style="text-align: center; color: #dc3545; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="margin-bottom: 15px;">Unable to Load Map</h3>
                <p style="max-width: 400px; line-height: 1.6;">${message}</p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">Refresh Page</button>
            </div>
        </div>
    `;
    
    // Update info panel
    const infoDiv = document.getElementById('cityInfo');
    infoDiv.innerHTML = '<p style="color: #dc3545;">Map failed to load. Please refresh the page.</p>';
}

// Utility functions for enhanced user experience
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize for responsive map
window.addEventListener('resize', debounce(() => {
    if (window.twinCitiesMap && window.twinCitiesMap.map) {
        window.twinCitiesMap.map.invalidateSize();
    }
}, 250));

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (!window.twinCitiesMap) return;
    
    // Only handle shortcuts when not typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(event.key) {
        case 'a':
        case 'A':
            if (event.ctrlKey || event.metaKey) return; // Don't interfere with Ctrl+A
            window.twinCitiesMap.showAllConnections();
            event.preventDefault();
            break;
        case 'h':
        case 'H':
            window.twinCitiesMap.hideAllConnections();
            event.preventDefault();
            break;
        case 'f':
        case 'F':
            if (event.ctrlKey || event.metaKey) return; // Don't interfere with Ctrl+F
            window.twinCitiesMap.focusOnBulgaria();
            event.preventDefault();
            break;
        case 'Escape':
            window.twinCitiesMap.hideAllConnections();
            break;
    }
});

// Add keyboard shortcuts info to the page
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer');
    if (footer) {
        const keyboardInfo = document.createElement('div');
        keyboardInfo.style.cssText = `
            margin-top: 10px;
            font-size: 0.8rem;
            color: #888;
            text-align: center;
        `;
        keyboardInfo.innerHTML = `
            <details style="display: inline-block;">
                <summary style="cursor: pointer; color: #666;">Keyboard Shortcuts</summary>
                <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px; display: inline-block;">
                    <strong>A</strong> - Show all connections<br>
                    <strong>H</strong> - Hide all connections<br>
                    <strong>F</strong> - Focus on Bulgaria<br>
                    <strong>Esc</strong> - Hide connections
                </div>
            </details>
        `;
        footer.appendChild(keyboardInfo);
    }
});

// Performance monitoring (optional)
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('app-start');
    
    window.addEventListener('load', function() {
        performance.mark('app-loaded');
        performance.measure('app-load-time', 'app-start', 'app-loaded');
        
        const measure = performance.getEntriesByName('app-load-time')[0];
        if (measure) {
            console.log(`Application loaded in ${Math.round(measure.duration)}ms`);
        }
    });
}

// Service worker registration for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Only register service worker in production
        if (location.protocol === 'https:' || location.hostname === 'localhost') {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        }
    });
}
