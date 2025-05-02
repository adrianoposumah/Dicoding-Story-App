import { getStories } from '../../data/api';
import { getStoryTransitionName, isViewTransitionSupported } from '../../utils/view-transition';

export default class HomePage {
  constructor() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    this.stories = [];
    this.supportsViewTransition = isViewTransitionSupported();
  }

  truncateText(text, maxLength = 120) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }

  async fetchStories() {
    try {
      if (this.isLoggedIn) {
        const response = await getStories();
        if (!response.error) {
          this.stories = response.listStory;

          // Cache story data for smooth transitions
          try {
            sessionStorage.setItem('homePageStories', JSON.stringify(this.stories));
          } catch (e) {
            console.error('Error saving to session storage:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  }

  async render() {
    if (!this.isLoggedIn) {
      return `
        <section class="container mx-auto px-8 py-10 min-h-[80vh] flex flex-col justify-center">
          <div class="text-center max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold mb-6 text-primary">Selamat Datang!</h1>
            <p class="text-lg text-secondary mb-8">Share your stories with the world and connect with other storytellers.</p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#/auth/signin" class="border font-semibold border-primary text-primary text-sm px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-colors duration-300">
                Sign In
              </a>
              <a href="#/auth/signup" class="inline-block font-semibold bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-300">
                Sign Up
              </a>
            </div>
          </div>
          
          <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h2 class="text-xl font-bold mb-4 text-secondary">Share Your Journey</h2>
              <p class="text-secondary">Create and share your unique stories with our community.</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h2 class="text-xl font-bold mb-4 text-secondary">Connect with Others</h2>
              <p class="text-secondary">Read and engage with stories from people around the world.</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h2 class="text-xl font-bold mb-4 text-secondary">Safe & Secure</h2>
              <p class="text-secondary">Your privacy and data security are our top priorities.</p>
            </div>
          </div>
        </section>
      `;
    } else {
      return `
        <section class="container mx-auto px-8 py-10">
          <div class="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 class="text-2xl font-bold text-primary">Welcome, ${this.user.name}!</h1>
            <a href="#/add" class="inline-block font-semibold bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-300 mt-4 md:mt-0">
              Add New Story
            </a>
          </div>
          
          <div id="stories-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${
              this.stories.length > 0
                ? this.stories
                    .map(
                      (story) => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                  <div class="relative w-full h-48 overflow-hidden">
                    <img 
                      src="${story.photoUrl}" 
                      alt="${story.name}'s story" 
                      class="w-full h-full object-cover"
                      data-story-id="${story.id}"
                      ${this.supportsViewTransition ? `style="view-transition-name: ${getStoryTransitionName(story.id)}"` : ''}
                    >
                  </div>
                  <div class="p-4">
                    <h2 class="text-xl font-bold text-secondary mb-2">${story.name}</h2>
                    <p class="text-secondary h-[4.5em] overflow-hidden">${this.truncateText(story.description)}</p>
                    <a href="#/stories/${story.id}" class="inline-block mt-4 text-sm text-primary font-semibold hover:text-secondary">
                      Read more →
                    </a>
                  </div>
                </div>
              `,
                    )
                    .join('')
                : '<p class="col-span-3 text-center py-8">Loading stories...</p>'
            }
          </div>
        </section>
      `;
    }
  }

  async afterRender() {
    if (this.isLoggedIn) {
      await this.fetchStories();
      const storiesContainer = document.getElementById('stories-container');
      if (storiesContainer) {
        storiesContainer.innerHTML =
          this.stories.length > 0
            ? this.stories
                .map(
                  (story) => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="relative w-full h-48 overflow-hidden">
                <img 
                  src="${story.photoUrl}" 
                  alt="${story.name}'s story" 
                  class="w-full h-full object-cover"
                  data-story-id="${story.id}"
                  ${this.supportsViewTransition ? `style="view-transition-name: ${getStoryTransitionName(story.id)}"` : ''}
                >
              </div>
              <div class="p-4">
                <h2 class="text-xl font-bold text-secondary mb-2">${story.name}</h2>
                <p class="text-secondary h-[4.5em] overflow-hidden">${this.truncateText(story.description)}</p>
                <a href="#/stories/${story.id}" class="inline-block mt-4 text-sm text-primary font-semibold hover:text-secondary">
                  Read more →
                </a>
              </div>
            </div>
          `,
                )
                .join('')
            : '<p class="col-span-3 text-center py-8">No stories found</p>';
      }
    }
  }
}
