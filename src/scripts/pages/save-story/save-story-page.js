import { getStoryTransitionName, isViewTransitionSupported } from '../../utils/view-transition';
import feather from 'feather-icons';
import SaveStoryPresenter from './save-story-presenter';

export default class SaveStoryPage {
  constructor() {
    this.presenter = new SaveStoryPresenter(this);
    const { isLoggedIn, user } = this.presenter.getUserData();
    this.isLoggedIn = isLoggedIn;
    this.user = user;
    this.stories = [];
    this.error = null;
    this.supportsViewTransition = isViewTransitionSupported();
  }

  updateAuthState(isLoggedIn, user) {
    this.isLoggedIn = isLoggedIn;
    this.user = user;
  }

  updateStories(stories) {
    this.stories = stories;
    this.updateStoriesUI();
  }

  showError(errorMessage) {
    this.error = errorMessage;
    const storiesContainer = document.getElementById('saved-stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>${errorMessage}</p>
        </div>
      `;
    }
  }

  updateStoriesUI() {
    const storiesContainer = document.getElementById('saved-stories-container');
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
                  ${this.supportsViewTransition ? `style="view-transition-name: ${this.presenter.getStoryTransitionName(story.id)};"` : ''}
                >
              </div>
              <div class="p-4">
                <h2 class="text-xl font-bold text-secondary mb-2">${story.name}</h2>
                <p class="text-secondary h-[4.5em] overflow-hidden">${this.presenter.truncateText(story.description)}</p>
                <a href="#/savestories/${story.id}" class="inline-flex items-center gap-1 mt-4 text-sm text-primary font-semibold hover:text-secondary" aria-label="Read the full story from ${story.name}">
                  Read more <i data-feather="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
                </a>
              </div>
            </article>
          `,
        )
        .join('');
    } else {
      storiesContainer.innerHTML =
        '<p class="col-span-3 text-center py-8">No saved stories found</p>';
    }

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  async render() {
    if (!this.isLoggedIn) {
      window.location.hash = '#/auth/signin';
      return '';
    }

    return `
      <transition-wrapper animation-type="fade" duration="500">
        <section class="container mx-auto px-8 py-10">
          <div class="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 class="text-2xl font-bold text-primary">Saved Stories</h1>
            <a href="#/" class="inline-flex items-center gap-2 text-primary hover:underline mt-4 md:mt-0" aria-label="Go back to stories list">
              <i data-feather="arrow-left" class="w-4 h-4" aria-hidden="true"></i> Back to all stories
            </a>
          </div>
          
          <div id="saved-stories-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="feed" aria-busy="true">
            <div class="col-span-3 flex justify-center py-8" role="status">
              <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </section>
      </transition-wrapper>
    `;
  }

  async afterRender() {
    if (!this.isLoggedIn) return;

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
    await this.presenter.fetchSavedStories();
  }
}
