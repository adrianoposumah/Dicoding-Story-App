import { showFormattedDate } from '../../utils/index';
import { getStoryTransitionName } from '../../utils/view-transition';
import L from 'leaflet';
import Map from '../../utils/map';
import SaveStoryDetailModel from './save-story-detail-model';

export default class SaveStoryDetailPresenter {
  constructor(view) {
    this.view = view;
    this.model = new SaveStoryDetailModel();
    this.story = null;
    this.isLoading = true;
    this.error = null;
  }

  async fetchStory(id) {
    try {
      this.isLoading = true;
      this.view.updateLoadingState(true);

      const story = await this.model.getStoryById(id);

      if (story) {
        this.story = story;

        // Make sure we have a valid photoUrl
        if (!story.photoUrl || story.photoUrl === 'null' || story.photoUrl === 'undefined') {
          // Try to get image from sessionStorage if the database doesn't have it
          try {
            const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
            const cachedStory = homePageStories.find((s) => s.id === id);
            if (cachedStory && cachedStory.photoUrl) {
              story.photoUrl = cachedStory.photoUrl;
            }
          } catch (e) {
            console.error('Error getting cached image:', e);
          }
        }

        this.view.updateStoryData(this.story);
      } else {
        this.error = 'Saved story not found';
        this.view.showError(this.error);
      }
    } catch (error) {
      console.error('Error fetching saved story:', error);
      this.error = 'An unexpected error occurred';
      this.view.showError(this.error);
    } finally {
      this.isLoading = false;
      this.view.updateLoadingState(false);
    }
  }

  async toggleSaveStory(storyId) {
    try {
      await this.model.deleteSavedStory(storyId);
      this.view.updateSaveState(false);
      return { success: true, isSaved: false };
    } catch (error) {
      console.error('Error unsaving story:', error);
      return { success: false, isSaved: true };
    }
  }

  formatDate(dateString) {
    return showFormattedDate(dateString, 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStoryTransitionName(storyId) {
    return getStoryTransitionName(storyId);
  }

  async initializeMap(lat, lon, name, mapElement) {
    if (!mapElement) return null;

    this.fixLeafletIconPaths();

    try {
      const mapInstance = await Map.build('#story-map', {
        center: [lat, lon],
        zoom: 13,
      });

      const marker = L.marker([lat, lon]).addTo(mapInstance._map);
      marker
        .bindPopup(`<b>${name}'s Story</b><br>Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        .openPopup();

      return mapInstance._map;
    } catch (error) {
      console.error('Error initializing story map:', error);
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

  checkUserAuthentication() {
    const { isLoggedIn } = this.model.getUserAuthState();
    return isLoggedIn;
  }

  getUserData() {
    return this.model.getUserAuthState();
  }

  getImageUrlFromCache(storyId) {
    try {
      const savedStories = JSON.parse(sessionStorage.getItem('savedStories') || '[]');
      const savedStory = savedStories.find((story) => story.id === storyId);
      if (savedStory && savedStory.photoUrl) {
        return savedStory.photoUrl;
      }

      const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
      const cachedStory = homePageStories.find((story) => story.id === storyId);
      if (cachedStory && cachedStory.photoUrl) {
        return cachedStory.photoUrl;
      }

      return '';
    } catch (error) {
      console.error('Error getting cached image:', error);
      return '';
    }
  }
}
