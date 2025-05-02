import { addStory, addStoryAsGuest } from '../../data/api';
import Map from '../../utils/map';
import L from 'leaflet';

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
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

  async submitStory(storyData, isLoggedIn) {
    try {
      const response = isLoggedIn ? await addStory(storyData) : await addStoryAsGuest(storyData);

      return {
        success: !response.error,
        message:
          response.message ||
          (response.error ? 'Failed to submit story' : 'Story posted successfully!'),
      };
    } catch (error) {
      console.error('Error submitting story:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
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

  isUserLoggedIn() {
    return localStorage.getItem('auth') !== null;
  }

  getUserData() {
    return this.isUserLoggedIn() ? JSON.parse(localStorage.getItem('auth')) : null;
  }
}
