import { isViewTransitionSupported } from '../../utils/view-transition';
import { showFormattedDate } from '../../utils/index';
import 'leaflet/dist/leaflet.css';
import feather from 'feather-icons';
import StoryDetailPresenter from './story-detail-presenter';

export default class StoryDetailPage {
  constructor() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    this.story = null;
    this.isLoading = true;
    this.error = null;
    this.supportsViewTransition = isViewTransitionSupported();
    this.storyId = null;
    this.map = null;
    this.presenter = new StoryDetailPresenter(this);
  }

  async fetchStory(id) {
    await this.presenter.fetchStory(id);
  }

  formatDate(dateString) {
    return this.presenter.formatDate(dateString);
  }

  async render() {
    if (!this.isLoggedIn) {
      window.location.hash = '#/auth/signin';
      return '';
    }

    this.storyId = window.location.hash.split('/')[2];
    const storyTransitionName = this.presenter.getStoryTransitionName(this.storyId);
    const cachedImageUrl = this.getImageUrlFromCache();

    return `
      <section class="container mx-auto px-8 py-10">
        <div id="story-detail-container" class="max-w-4xl mx-auto">
          <div class="page-transition">
            <a href="#/" class="inline-flex items-center gap-1 mb-6 text-primary hover:underline">
              <i data-feather="arrow-left" class="w-4 h-4"></i> Back to stories
            </a>
            
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
              <div class="relative h-[40vh] overflow-hidden bg-gray-100">
                <img 
                  src="${cachedImageUrl || ''}" 
                  alt="Story image" 
                  class="w-full h-full object-cover image-fade-in ${cachedImageUrl ? 'loaded' : ''}"
                  id="story-image"
                  data-story-id="${this.storyId}"
                  ${this.supportsViewTransition ? `style="view-transition-name: ${storyTransitionName};"` : ''}
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              
              <div id="story-content" class="p-6">
                <div class="flex flex-col items-center py-8">
                  <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p class="mt-4 text-lg text-secondary">Loading story details...</p>
                </div>
              </div>
              
              <div id="map-container" class="hidden">
                <div id="story-map" class="h-[300px] w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  getImageUrlFromCache() {
    return this.presenter.getImageUrlFromCache(this.storyId);
  }

  async afterRender() {
    if (!this.isLoggedIn) return;

    const storyId = this.storyId || window.location.hash.split('/')[2];

    if (storyId) {
      await this.fetchStory(storyId);

      const storyContent = document.getElementById('story-content');
      const storyImage = document.getElementById('story-image');
      const mapContainer = document.getElementById('map-container');

      if (this.error) {
        if (storyContent) {
          storyContent.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>${this.error}</p>
            </div>
          `;
        }
        return;
      }

      if (!this.story) {
        if (storyContent) {
          storyContent.innerHTML = `
            <div class="text-center">
              <p class="text-lg text-secondary mb-4">Story not found</p>
            </div>
          `;
        }
        return;
      }

      if (
        storyImage &&
        (!storyImage.src ||
          storyImage.src === 'null' ||
          storyImage.src === 'undefined' ||
          storyImage.src === window.location.href)
      ) {
        storyImage.src = this.story.photoUrl;
        storyImage.alt = `${this.story.name}'s story`;
      }

      if (storyContent) {
        const hasLocation = this.story.lat !== null && this.story.lon !== null;

        storyContent.innerHTML = `
          <h1 class="text-3xl font-bold text-secondary mb-4">
            ${this.story.name}'s Story
          </h1>
          <p class="text-sm text-gray-500 mb-6">
            ${showFormattedDate(this.story.createdAt)}
          </p>
          
          <div class="prose max-w-none mb-6">
            <p>${this.story.description}</p>
          </div>
          
          ${
            hasLocation
              ? `
          <div class="mb-4">
            <h2 class="inline-flex items-center gap-2 text-xl font-semibold text-secondary mb-2">
              <i data-feather="map-pin" class="w-5 h-5"></i> Location
            </h2>
            <p class="text-sm text-secondary mb-2">
              Coordinates: ${this.story.lat.toFixed(4)}, ${this.story.lon.toFixed(4)}
            </p>
          </div>
          `
              : ''
          }
        `;
      }

      if (storyImage) {
        storyImage.onload = () => {
          storyImage.classList.add('loaded');
        };

        if (storyImage.complete) {
          storyImage.classList.add('loaded');
        }
      }

      if (this.story.lat !== null && this.story.lon !== null && mapContainer) {
        mapContainer.classList.remove('hidden');

        setTimeout(() => {
          this.initializeMap(this.story.lat, this.story.lon, this.story.name);
        }, 100);
      }

      feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

      try {
        const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
        if (!homePageStories.find((s) => s.id === this.story.id)) {
          homePageStories.push(this.story);
          sessionStorage.setItem('homePageStories', JSON.stringify(homePageStories));
        }
      } catch (e) {
        console.error('Error saving to session storage:', e);
      }
    }

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  initializeMap(lat, lon, name) {
    const mapElement = document.getElementById('story-map');
    this.map = this.presenter.initializeMap(lat, lon, name, mapElement);

    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);
    }
  }

  fixLeafletIconPaths() {
    this.presenter.fixLeafletIconPaths();
  }
}
