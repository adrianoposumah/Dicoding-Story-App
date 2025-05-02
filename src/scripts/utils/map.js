import { map, tileLayer, control } from 'leaflet';

export default class Map {
  #zoom = 5;
  #map = null;
  #baseLayers = {};
  #overlays = {};

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);

        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;
    this.initializeTileLayers();

    const defaultLayer = this.#baseLayers['OpenStreetMap'];

    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [defaultLayer],
      ...options,
    });

    this.addLayerControl();
  }

  initializeTileLayers() {
    const osmLayer = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const satelliteLayer = tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          '&copy; <a href="https://www.esri.com/" target="_blank">Esri</a> | Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      },
    );

    const darkLayer = tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 20,
      },
    );

    this.#baseLayers = {
      'OpenStreetMap': osmLayer,
      'Satellite': satelliteLayer,
      'Dark Mode': darkLayer,
    };
  }

  addLayerControl() {
    control.layers(this.#baseLayers, this.#overlays, { position: 'topright' }).addTo(this.#map);
  }

  addOverlay(name, layer) {
    this.#overlays[name] = layer;
    layer.addTo(this.#map);
    control.layers(this.#baseLayers, this.#overlays).addTo(this.#map);
    return this;
  }

  get _map() {
    return this.#map;
  }
}
