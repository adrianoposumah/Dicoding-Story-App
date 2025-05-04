import 'leaflet/dist/leaflet.css';

export default class LocationPicker {
  constructor() {
    this.map = null;
    this.marker = null;
    this.selectedLocation = {
      lat: null,
      lon: null,
    };
    this.onLocationChanged = null;
    this.leaflet = null;
  }

  render() {
    return `
      <fieldset class="space-y-4">
        <legend class="block text-sm font-medium text-secondary mb-2">
          Location 
        </legend>
        <div id="map" class="h-[300px] w-full rounded-lg shadow-md" aria-label="Interactive map for selecting location - this is optional" tabindex="0"></div>
        <div id="location-info" class="text-sm text-gray-600 hidden" aria-live="polite">
          <p>Selected coordinates: <span id="coordinates-display">None</span></p>
          <button 
            type="button" 
            id="clear-location-button"
            class="text-red-500 hover:underline mt-1"
            aria-label="Clear selected location"
          >
            Clear location
          </button>
        </div>
        <p class="text-xs text-gray-500">Klik di map untuk membagikan lokasi yang anda pilih, atau biarkan jika tidak ingin.</p>
      </fieldset>
    `;
  }

  async afterRender() {
    await this.initializeMap();

    const clearLocationButton = document.getElementById('clear-location-button');

    if (clearLocationButton) {
      clearLocationButton.addEventListener('click', () => {
        this.clearLocation();
      });
    }

    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const alertContainer = document.getElementById('alert-container');
          const alertElement = document.getElementById('alert');
          if (alertContainer && alertElement) {
            alertContainer.classList.remove('hidden');
            alertElement.textContent =
              'Use mouse or touch to interact with the map to select a location.';
            alertElement.className = 'p-4 rounded bg-blue-100 text-blue-700';
          }
        }
      });
    }
  }

  async initializeMap() {
    if (!document.getElementById('map')) return;

    if (!this.leaflet) {
      this.leaflet = await import(/* webpackChunkName: "leaflet" */ 'leaflet');
    }

    this.fixLeafletIconPaths();

    this.map = this.leaflet.map('map').setView([-6.2, 106.816666], 13);

    this.leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
      .addTo(this.map);

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      this.selectedLocation = {
        lat: lat,
        lon: lng,
      };

      const coordinatesDisplay = document.getElementById('coordinates-display');
      const locationInfo = document.getElementById('location-info');

      if (coordinatesDisplay && locationInfo) {
        coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        locationInfo.classList.remove('hidden');
      }

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = this.leaflet.marker([lat, lng]).addTo(this.map);
      }

      if (this.onLocationChanged) {
        this.onLocationChanged(this.selectedLocation);
      }
    });

    return this.map;
  }

  async fixLeafletIconPaths() {
    if (!this.leaflet) {
      this.leaflet = await import(/* webpackChunkName: "leaflet" */ 'leaflet');
    }

    delete this.leaflet.Icon.Default.prototype._getIconUrl;
    this.leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }

  clearLocation() {
    this.selectedLocation = {
      lat: null,
      lon: null,
    };

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
      locationInfo.classList.add('hidden');
    }

    if (this.onLocationChanged) {
      this.onLocationChanged(this.selectedLocation);
    }
  }

  reset() {
    this.clearLocation();
  }
}
