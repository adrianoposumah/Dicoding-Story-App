import { showFormattedDate } from '../../utils/index';
import { getStoryTransitionName } from '../../utils/view-transition';
import L from 'leaflet';
import Map from '../../utils/map';
import StoryDetailModel from './story-detail-model';

export default class StoryDetailPresenter {
  constructor(view) {
    this.view = view;
    this.model = new StoryDetailModel();
    this.story = null;
    this.isLoading = true;
    this.error = null;
  }

  async fetchStory(id) {
    try {
      this.isLoading = true;
      this.view.updateLoadingState(true);

      const response = await this.model.getStoryById(id);

      if (!response.error) {
        this.story = response.story;
        this.view.updateStoryData(this.story);
        this.model.saveStoryToSessionStorage(this.story);

        const isSaved = await this.model.isStorySaved(id);
        this.view.updateSaveState(isSaved);
      } else {
        this.error = response.message || 'Failed to fetch story';
        this.view.showError(this.error);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      this.error = 'An unexpected error occurred';
      this.view.showError(this.error);
    } finally {
      this.isLoading = false;
      this.view.updateLoadingState(false);
    }
  }

  async toggleSaveStory(story) {
    try {
      const isSaved = await this.model.isStorySaved(story.id);

      if (isSaved) {
        await this.model.unsaveStory(story.id);
        this.view.updateSaveState(false);
        return { success: true, isSaved: false };
      } else {
        await this.model.saveStory(story);
        this.view.updateSaveState(true);
        return { success: true, isSaved: true };
      }
    } catch (error) {
      console.error('Error toggling save state:', error);
      return { success: false, isSaved: await this.model.isStorySaved(story.id) };
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

  getImageUrlFromCache(storyId) {
    return this.model.getImageUrlFromCache(storyId);
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
}
