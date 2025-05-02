import { getStoryById } from '../../data/api';
import { showFormattedDate } from '../../utils/index';
import { getStoryTransitionName, isViewTransitionSupported } from '../../utils/view-transition';

export default class StoryDetailPage {
  constructor() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    this.story = null;
    this.isLoading = true;
    this.error = null;
    this.supportsViewTransition = isViewTransitionSupported();
    this.storyId = null;
  }

  async fetchStory(id) {
    try {
      this.isLoading = true;
      const response = await getStoryById(id);

      if (!response.error) {
        this.story = response.story;
      } else {
        this.error = response.message || 'Failed to fetch story';
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      this.error = 'An unexpected error occurred';
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  async render() {
    if (!this.isLoggedIn) {
      window.location.hash = '#/auth/signin';
      return '';
    }

    // Extract story ID from URL at render time
    this.storyId = window.location.hash.split('/')[2];
    const storyTransitionName = getStoryTransitionName(this.storyId);
    const cachedImageUrl = this.getImageUrlFromCache();

    return `
      <section class="container mx-auto px-8 py-10">
        <div id="story-detail-container" class="max-w-4xl mx-auto">
          <div class="page-transition">
            <a href="#/" class="inline-block mb-6 text-primary hover:underline">
              &larr; Back to stories
            </a>
            
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
              <!-- Image is rendered immediately for transition purposes without loading overlay -->
              <div class="relative h-[40vh] overflow-hidden bg-gray-100">
                <img 
                  src="${cachedImageUrl || ''}" 
                  alt="Story image" 
                  class="w-full h-full object-cover image-fade-in ${cachedImageUrl ? 'loaded' : ''}"
                  id="story-image"
                  data-story-id="${this.storyId}"
                  ${this.supportsViewTransition ? `style="view-transition-name: ${storyTransitionName}"` : ''}
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              
              <!-- Content area loads separately -->
              <div id="story-content" class="p-6">
                <div class="flex flex-col items-center py-8">
                  <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p class="mt-4 text-lg text-secondary">Loading story details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Helper method to try to get the image URL from cache
  getImageUrlFromCache() {
    try {
      // Try to find the story in localStorage or sessionStorage if you've saved it there
      // Or if you have a list of stories already loaded in the home page
      const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
      const cachedStory = homePageStories.find((story) => story.id === this.storyId);

      if (cachedStory && cachedStory.photoUrl) {
        return cachedStory.photoUrl;
      }

      // If there's no cached data, return an empty placeholder image
      return '';
    } catch (error) {
      console.error('Error getting cached image:', error);
      return '';
    }
  }

  async afterRender() {
    if (!this.isLoggedIn) return;

    // Get the story ID from the URL
    const storyId = this.storyId || window.location.hash.split('/')[2];

    if (storyId) {
      // Fetch the story data
      await this.fetchStory(storyId);

      // Update only the content area, not the entire container
      const storyContent = document.getElementById('story-content');
      const storyImage = document.getElementById('story-image');

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

      // Update the image source if it wasn't available before
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

      // Update content area
      if (storyContent) {
        const hasLocation = this.story.lat !== null && this.story.lon !== null;

        storyContent.innerHTML = `
          <h1 class="text-3xl font-bold text-secondary mb-4">
            ${this.story.name}'s Story
          </h1>
          <p class="text-sm text-gray-500 mb-6">
            ${showFormattedDate(this.story.createdAt)}
          </p>
          ${
            hasLocation
              ? `
          <div class="mb-4 pb-4 border-b">
            <p class="text-sm text-secondary">
              <span class="font-semibold">Location:</span> 
              <a href="https://maps.google.com/?q=${this.story.lat},${this.story.lon}" 
                 target="_blank" 
                 class="text-primary hover:underline">
                View on map (${this.story.lat.toFixed(4)}, ${this.story.lon.toFixed(4)})
              </a>
            </p>
          </div>
          `
              : ''
          }
          
          <div class="prose max-w-none">
            <p>${this.story.description}</p>
          </div>
        `;
      }

      // Add fade-in effect for the image
      if (storyImage) {
        storyImage.onload = () => {
          storyImage.classList.add('loaded');
        };

        // If image is already loaded from cache
        if (storyImage.complete) {
          storyImage.classList.add('loaded');
        }
      }

      // Save the story data to session storage for faster loading next time
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
  }
}
