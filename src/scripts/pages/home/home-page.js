import { getStoryTransitionName, isViewTransitionSupported } from '../../utils/view-transition';
import feather from 'feather-icons';
import HomePresenter from './home-presenter';

export default class HomePage {
  constructor() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    this.stories = [];
    this.supportsViewTransition = isViewTransitionSupported();
    this.presenter = new HomePresenter(this);
  }

  async fetchStories() {
    return this.presenter.fetchStories();
  }

  truncateText(text, maxLength = 120) {
    return this.presenter.truncateText(text, maxLength);
  }

  async render() {
    if (!this.isLoggedIn) {
      return `
        <transition-wrapper animation-type="fade" duration="500">
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
        </transition-wrapper>
      `;
    } else {
      return `
        <transition-wrapper animation-type="scale" duration="400" preserve-loading="true">
          <section class="container mx-auto px-8 py-10">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
              <h1 class="text-2xl font-bold text-primary">Welcome, ${this.user.name}!</h1>
              <a href="#/add" class="inline-flex items-center gap-2 font-semibold bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-300 mt-4 md:mt-0" aria-label="Add a new story">
                <i data-feather="plus-circle" aria-hidden="true"></i> Add New Story
              </a>
            </div>
            
            <div id="stories-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="feed" aria-busy="${this.stories.length === 0 ? 'true' : 'false'}">
              ${
                this.stories.length > 0
                  ? this.stories
                      .map(
                        (story, index) => `
                  <article class="bg-white rounded-lg shadow-md overflow-hidden" aria-posinset="${index + 1}" aria-setsize="${this.stories.length}">
                    <div class="relative w-full h-48 overflow-hidden">
                      <img 
                        src="${story.photoUrl}" 
                        alt="Story image shared by ${story.name}" 
                        class="w-full h-full object-cover"
                        data-story-id="${story.id}"
                        ${this.supportsViewTransition ? `style="view-transition-name: ${getStoryTransitionName(story.id)};"` : ''}
                      >
                    </div>
                    <div class="p-4">
                      <h2 class="text-xl font-bold text-secondary mb-2">${story.name}</h2>
                      <p class="text-secondary h-[4.5em] overflow-hidden">${this.truncateText(story.description)}</p>
                      <a href="#/stories/${story.id}" class="inline-flex items-center gap-1 mt-4 text-sm text-primary font-semibold hover:text-secondary" aria-label="Read the full story from ${story.name}">
                        Read more <i data-feather="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
                      </a>
                    </div>
                  </article>
                `,
                      )
                      .join('')
                  : '<div class="col-span-3 flex justify-center py-8" role="status"><div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>'
              }
            </div>
          </section>
        </transition-wrapper>
      `;
    }
  }

  async afterRender() {
    if (this.isLoggedIn) {
      const storiesContainer = document.getElementById('stories-container');

      await this.fetchStories();

      if (storiesContainer) {
        storiesContainer.setAttribute('aria-busy', 'false');

        if (this.stories.length > 0) {
          storiesContainer.innerHTML = this.stories
            .map(
              (story, index) => `
                <article class="bg-white rounded-lg shadow-md overflow-hidden" aria-posinset="${index + 1}" aria-setsize="${this.stories.length}">
                  <div class="relative w-full h-48 overflow-hidden">
                    <img 
                      src="${story.photoUrl}" 
                      alt="Story image shared by ${story.name}" 
                      class="w-full h-full object-cover"
                      data-story-id="${story.id}"
                      ${this.supportsViewTransition ? `style="view-transition-name: ${getStoryTransitionName(story.id)};"` : ''}
                    >
                  </div>
                  <div class="p-4">
                    <h2 class="text-xl font-bold text-secondary mb-2">${story.name}</h2>
                    <p class="text-secondary h-[4.5em] overflow-hidden">${this.truncateText(story.description)}</p>
                    <a href="#/stories/${story.id}" class="inline-flex items-center gap-1 mt-4 text-sm text-primary font-semibold hover:text-secondary" aria-label="Read the full story from ${story.name}">
                      Read more <i data-feather="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
                    </a>
                  </div>
                </article>
              `,
            )
            .join('');
        } else {
          storiesContainer.innerHTML =
            '<p class="col-span-3 text-center py-8">No stories found</p>';
        }
      }

      // Initialize Feather icons
      feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
    }
  }
}
