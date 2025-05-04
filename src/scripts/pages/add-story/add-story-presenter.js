import Map from '../../utils/map';
import L from 'leaflet';
import AddStoryModel from './add-story-model';

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.model = new AddStoryModel();
  }

  async initializeMap() {
    try {
      this.fixLeafletIconPaths();

      const map = await Map.build('#map', {
        locate: true,
        zoom: 13,
      });

      return map;
    } catch (error) {
      console.error('Error initializing map:', error);
      return null;
    }
  }

  fixLeafletIconPaths() {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }

  setDescription(description) {
    this.model.setDescription(description);
  }

  setPhoto(photoFile) {
    this.model.setPhoto(photoFile);
  }

  setLocation(lat, lon) {
    this.model.setLocation(lat, lon);
  }

  getLocation() {
    return this.model.getLocation();
  }

  isUserLoggedIn() {
    return this.model.isUserLoggedIn();
  }

  getUserData() {
    return this.model.getUserData();
  }

  async submitStory() {
    if (!this.validateStoryData()) {
      return {
        success: false,
        message: this.getValidationErrorMessage(),
      };
    }

    return await this.model.submitStory();
  }

  validateStoryData() {
    return this.model.isDataValid();
  }

  getValidationErrorMessage() {
    const { description, photo } = this.model.storyData;

    if (!description) return 'Please enter a story description.';
    if (!photo) return 'Please upload or capture a photo.';

    // Removed location validation since it's optional

    return '';
  }

  redirectToHome() {
    window.location.hash = '#/';
  }

  async startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      return {
        success: true,
        stream: mediaStream,
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      return {
        success: false,
        message: 'Cannot access camera. Please check permissions or use file upload instead.',
      };
    }
  }

  stopCamera(mediaStream) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  }

  resetData() {
    this.model.resetData();
  }
}
