import { getStoryById } from '../../data/api';
import { showFormattedDate } from '../../utils/index';
import { getStoryTransitionName } from '../../utils/view-transition';
import L from 'leaflet';
import Map from '../../utils/map';

export default class StoryDetailPresenter {
  constructor(view) {
    this.view = view;
    this.story = null;
    this.isLoading = true;
    this.error = null;
  }

  async fetchStory(id) {
    try {
      this.isLoading = true;
      const response = await getStoryById(id);

      if (!response.error) {
        this.story = response.story;
        this.view.story = this.story;
      } else {
        this.error = response.message || 'Failed to fetch story';
        this.view.error = this.error;
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      this.error = 'An unexpected error occurred';
      this.view.error = this.error;
    } finally {
      this.isLoading = false;
      this.view.isLoading = false;
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
    try {
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
    return this.view.isLoggedIn;
  }

  saveStoryToSessionStorage(story) {
    try {
      const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
      if (!homePageStories.find((s) => s.id === story.id)) {
        homePageStories.push(story);
        sessionStorage.setItem('homePageStories', JSON.stringify(homePageStories));
      }
    } catch (e) {
      console.error('Error saving to session storage:', e);
    }
  }
}
