import { getStoryTransitionName, isViewTransitionSupported } from '../../utils/view-transition';
import feather from 'feather-icons';
import HomePresenter from './home-presenter';
import HomeModel from './home-model';

export default class HomePage {
  constructor() {
    this.isLoggedIn = false;
    this.user = null;
    this.stories = [];
    this.supportsViewTransition = isViewTransitionSupported();

    // Initialize MVP components
    this.model = new HomeModel();
    this.presenter = new HomePresenter(this, this.model);
  }

  updateAuthState(isLoggedIn, user) {
    this.isLoggedIn = isLoggedIn;
    this.user = user;
  }

  updateStories(stories) {
    this.stories = stories;
    this.updateStoriesUI();
  }

  updateStoriesUI() {
    const storiesContainer = document.getElementById('stories-container');
    if (!storiesContainer) return;

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
                <p class="text-secondary h-[4.5em] overflow-hidden">${this.presenter.truncateText(story.description)}</p>
                <a href="#/stories/${story.id}" class="inline-flex items-center gap-1 mt-4 text-sm text-primary font-semibold hover:text-secondary" aria-label="Read the full story from ${story.name}">
                  Read more <i data-feather="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
                </a>
              </div>
            </article>
          `,
        )
        .join('');
    } else {
      storiesContainer.innerHTML = '<p class="col-span-3 text-center py-8">No stories found</p>';
    }

    // Initialize Feather icons
    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  async render() {
    if (!this.isLoggedIn) {
      return `
        <transition-wrapper animation-type="fade" duration="500">
          <section class="container mx-auto px-8 py-10 min-h-[80vh] flex flex-col justify-center">
            <div class="text-center max-w-4xl mx-auto">
              <h1 class="text-4xl font-bold mb-6 text-primary">Selamat Datang!</h1>
              <p class="text-lg text-secondary mb-8">Bagikan momen dan ceritamu di komunitas Dicoding!</p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="#/auth/signin" class="border font-semibold border-primary text-primary text-sm w-40 py-3 rounded-md hover:bg-primary hover:text-white transition-colors duration-300">
                  Sign In
                </a>
                <a href="#/auth/signup" class="inline-block font-semibold bg-primary text-white text-sm w-40 py-3 rounded-md hover:bg-secondary transition-colors duration-300">
                  Sign Up
                </a>
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
              <a href="#/add" class="inline-flex items-center gap-2 font-semibold bg-primary text-white text-sm px-4 py-3 rounded-md hover:bg-secondary transition-colors duration-300 mt-4 md:mt-0" aria-label="Add a new story">
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
                      <p class="text-secondary h-[4.5em] overflow-hidden">${this.presenter.truncateText(story.description)}</p>
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
      await this.presenter.fetchStories();
      // Feather icons are initialized in updateStoriesUI
    }
  }
}
