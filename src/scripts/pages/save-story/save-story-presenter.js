import SaveStoryModel from './save-story-model';
import { getStoryTransitionName } from '../../utils/view-transition';

export default class SaveStoryPresenter {
  constructor(view) {
    this.view = view;
    this.model = new SaveStoryModel();
    this.stories = [];
    this.error = null;
  }

  async fetchSavedStories() {
    try {
      const { isLoggedIn, user } = this.model.getUserAuthState();
      this.view.updateAuthState(isLoggedIn, user);

      if (!isLoggedIn) return;

      const result = await this.model.fetchSavedStories();

      if (!result.error) {
        this.stories = result.stories;
        this.view.updateStories(this.stories);
      } else {
        this.error = result.message || 'Failed to fetch saved stories';
        this.view.showError(this.error);
      }
    } catch (error) {
      console.error('Error in presenter fetching saved stories:', error);
      this.error = 'An unexpected error occurred';
      this.view.showError(this.error);
    }
  }

  truncateText(text, maxLength = 120) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }

  getStoryTransitionName(storyId) {
    return getStoryTransitionName(storyId);
  }

  getUserData() {
    const { isLoggedIn, user } = this.model.getUserAuthState();
    return { isLoggedIn, user };
  }
}
