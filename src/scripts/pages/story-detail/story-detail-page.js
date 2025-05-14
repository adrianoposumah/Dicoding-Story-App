import { isViewTransitionSupported } from '../../utils/view-transition';
import { showFormattedDate } from '../../utils/index';
import 'leaflet/dist/leaflet.css';
import feather from 'feather-icons';
import StoryDetailPresenter from './story-detail-presenter';

export default class StoryDetailPage {
  constructor() {
    this.presenter = new StoryDetailPresenter(this);
    const { isLoggedIn, user } = this.presenter.getUserData();
    this.isLoggedIn = isLoggedIn;
    this.user = user;
    this.story = null;
    this.isLoading = true;
    this.error = null;
    this.supportsViewTransition = isViewTransitionSupported();
    this.storyId = null;
    this.map = null;
    this.isSaved = false;
  }

  async fetchStory(id) {
    await this.presenter.fetchStory(id);
  }

  updateStoryData(story) {
    this.story = story;
    this.renderStoryContent();
    this.updateStoryUI();
  }

  updateLoadingState(isLoading) {
    this.isLoading = isLoading;
  }

  showError(errorMessage) {
    this.error = errorMessage;
    this.renderStoryContent();
  }

  formatDate(dateString) {
    return this.presenter.formatDate(dateString);
  }

  updateSaveState(isSaved) {
    this.isSaved = isSaved;
    this.updateSaveButtonUI();
  }

  updateSaveButtonUI() {
    const saveButton = document.getElementById('save-story-button');
    if (!saveButton) return;

    if (this.isSaved) {
      saveButton.innerHTML = `
        <i data-feather="bookmark" class="w-4 h-4" aria-hidden="true"></i> Unsave Story
      `;
      saveButton.classList.remove('border', 'border-primary', 'text-primary');
      saveButton.classList.add('bg-primary', 'text-white');
      saveButton.setAttribute('aria-label', 'Remove this story from saved stories');
    } else {
      saveButton.innerHTML = `
        <i data-feather="bookmark" class="w-4 h-4" aria-hidden="true"></i> Save Story
      `;
      saveButton.classList.remove('bg-primary', 'text-white');
      saveButton.classList.add('border', 'border-primary', 'text-primary');
      saveButton.setAttribute('aria-label', 'Save this story to your collection');
    }

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  async render() {
    if (!this.isLoggedIn) {
      window.location.hash = '#/auth/signin';
      return '';
    }

    this.storyId = window.location.hash.split('/')[2];
    const storyTransitionName = this.presenter.getStoryTransitionName(this.storyId);
    const cachedImageUrl = this.presenter.getImageUrlFromCache(this.storyId);

    return `
      <section class="container mx-auto px-8 py-10">
        <div id="story-detail-container" class="max-w-4xl mx-auto">
          <div class="page-transition">
            <a href="#/" class="inline-flex items-center gap-1 mb-6 text-primary hover:underline" aria-label="Back to stories list">
              <i data-feather="arrow-left" class="w-4 h-4" aria-hidden="true"></i> Back to stories
            </a>
            
            <article class="bg-white rounded-lg shadow-lg overflow-hidden">
              <div class="relative h-[40vh] overflow-hidden bg-gray-100">
                <img 
                  src="${cachedImageUrl || ''}" 
                  alt="Story illustration" 
                  class="w-full h-full object-cover image-fade-in ${cachedImageUrl ? 'loaded' : ''}"
                  id="story-image"
                  data-story-id="${this.storyId}"
                  ${this.supportsViewTransition ? `style="view-transition-name: ${storyTransitionName};"` : ''}
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true"></div>
              </div>
              
              <div id="story-content" class="p-6" aria-live="polite">
                <div class="flex flex-col items-center py-8" role="status" aria-label="Loading story details">
                  <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <p class="mt-4 text-lg text-secondary">Loading story details...</p>
                </div>
              </div>
              
              <div id="map-container" class="hidden">
                <div id="story-map" class="h-[300px] w-full" aria-label="Map showing the story location"></div>
              </div>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  renderStoryContent() {
    const storyContent = document.getElementById('story-content');
    const storyImage = document.getElementById('story-image');
    const mapContainer = document.getElementById('map-container');

    if (!storyContent) return;

    if (this.error) {
      storyContent.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>${this.error}</p>
        </div>
      `;
      return;
    }

    if (!this.story) {
      storyContent.innerHTML = `
        <div class="text-center" role="status">
          <p class="text-lg text-secondary mb-4">Story not found</p>
        </div>
      `;
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
      storyImage.alt = `Story image shared by ${this.story.name}`;
    }

    const hasLocation = this.story.lat !== null && this.story.lon !== null;

    storyContent.innerHTML = `
      <h1 class="text-3xl font-bold text-secondary mb-4">
        ${this.story.name}'s Story
      </h1>
      <p class="text-sm text-gray-500 mb-6">
        <time datetime="${new Date(this.story.createdAt).toISOString()}">${showFormattedDate(this.story.createdAt)}</time>
      </p>
      
      <div class="prose max-w-none mb-6">
        <p>${this.story.description}</p>
      </div>
      
      <div class="story-detail-actions flex justify-end mb-4">
        <button 
          id="save-story-button" 
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          aria-label="Save this story to your collection"
        >
          <i data-feather="bookmark" class="w-4 h-4" aria-hidden="true"></i> Save Story
        </button>
      </div>
      
      ${
        hasLocation
          ? `
      <div class="mb-4">
        <h2 class="inline-flex items-center gap-2 text-xl font-semibold text-secondary mb-2">
          <i data-feather="map-pin" class="w-5 h-5" aria-hidden="true"></i> Location
        </h2>
        <p class="text-sm text-secondary mb-2">
          Coordinates: <span aria-label="Latitude ${this.story.lat.toFixed(4)}, Longitude ${this.story.lon.toFixed(4)}">${this.story.lat.toFixed(4)}, ${this.story.lon.toFixed(4)}</span>
        </p>
      </div>
      `
          : ''
      }
    `;

    if (storyImage) {
      storyImage.onload = () => {
        storyImage.classList.add('loaded');
      };

      if (storyImage.complete) {
        storyImage.classList.add('loaded');
      }
    }

    if (hasLocation && mapContainer) {
      mapContainer.classList.remove('hidden');

      setTimeout(() => {
        this.initializeMap(this.story.lat, this.story.lon, this.story.name);
      }, 100);
    }

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  updateStoryUI() {
    const actionsContainer = document.querySelector('.story-detail-actions');
    if (actionsContainer) {
      let saveButton = document.getElementById('save-story-button');

      if (!saveButton) {
        saveButton = document.createElement('button');
        saveButton.id = 'save-story-button';
        saveButton.className =
          'inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors';
        saveButton.setAttribute('aria-label', 'Save this story to your collection');
        saveButton.innerHTML = `<i data-feather="bookmark" class="w-4 h-4" aria-hidden="true"></i> Save Story`;
        actionsContainer.appendChild(saveButton);
      }

      const newSaveButton = saveButton.cloneNode(true);
      saveButton.parentNode.replaceChild(newSaveButton, saveButton);

      newSaveButton.addEventListener('click', () => this.handleSaveButtonClick());

      this.updateSaveButtonUI();
    }

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  async handleSaveButtonClick() {
    if (!this.story) {
      console.log('No story available to save');
      return;
    }

    console.log('Save button clicked for story:', this.story.id);

    const saveButton = document.getElementById('save-story-button');
    if (!saveButton || saveButton.disabled) return;

    saveButton.disabled = true;
    const originalHTML = saveButton.innerHTML;
    saveButton.innerHTML = `<span class="animate-spin mr-2" aria-hidden="true">⟳</span> Processing...`;

    try {
      const result = await this.presenter.toggleSaveStory(this.story);
      console.log('Toggle save result:', result);
      if (result.success) {
        const message = result.isSaved
          ? 'Story saved successfully!'
          : 'Story removed from saved collection!';
        this.showToast(message);
      } else {
        this.showToast('Failed to update saved status. Please try again.', true);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      this.showToast('An error occurred while saving the story.', true);
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        this.updateSaveButtonUI();
      }
    }
  }

  showToast(message, isError = false) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed bottom-4 right-4 z-50';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-md shadow-md mb-2 ${isError ? 'bg-red-500' : 'bg-green-500'} text-white transform transition-all duration-300 translate-y-full opacity-0`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-full', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-y-full', 'opacity-0');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }

  async afterRender() {
    if (!this.isLoggedIn) return;

    const storyId = this.storyId || window.location.hash.split('/')[2];

    if (storyId) {
      await this.fetchStory(storyId);
    }

    this.updateStoryUI();

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  async initializeMap(lat, lon, name) {
    const mapElement = document.getElementById('story-map');

    if (!mapElement) return;

    try {
      this.map = await this.presenter.initializeMap(lat, lon, name, mapElement);

      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize();
        }, 200);
      }
    } catch (error) {
      console.error('Error initializing map in story detail page:', error);
    }
  }
}
