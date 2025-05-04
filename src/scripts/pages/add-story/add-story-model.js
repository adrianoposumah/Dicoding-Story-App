import { addStory, addStoryAsGuest } from '../../data/api';

export default class AddStoryModel {
  constructor() {
    this.storyData = {
      description: '',
      photo: null,
      lat: null,
      lon: null,
    };
    this._isLoggedIn = localStorage.getItem('auth') !== null;
    this._userData = this._isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
  }

  setDescription(description) {
    this.storyData.description = description;
  }

  setPhoto(photoFile) {
    this.storyData.photo = photoFile;
  }

  setLocation(lat, lon) {
    this.storyData.lat = lat;
    this.storyData.lon = lon;
  }

  getLocation() {
    return {
      lat: this.storyData.lat,
      lon: this.storyData.lon,
    };
  }

  isDataValid() {
    return (
      this.storyData.description && this.storyData.photo
      // Location is now optional, so we're removing the lat/lon validation
    );
  }

  isUserLoggedIn() {
    return this._isLoggedIn;
  }

  getUserData() {
    return this._userData;
  }

  async submitStory() {
    try {
      const response = this.isUserLoggedIn()
        ? await addStory(this.storyData)
        : await addStoryAsGuest(this.storyData);

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

  resetData() {
    this.storyData = {
      description: '',
      photo: null,
      lat: null,
      lon: null,
    };
  }
}
