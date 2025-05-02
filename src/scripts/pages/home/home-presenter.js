import { getStories } from '../../data/api';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.stories = [];
  }

  async fetchStories() {
    try {
      if (this.view.isLoggedIn) {
        const response = await getStories();
        if (!response.error) {
          this.stories = response.listStory;
          this.view.stories = this.stories;

          try {
            sessionStorage.setItem('homePageStories', JSON.stringify(this.stories));
          } catch (e) {
            console.error('Error saving to session storage:', e);
          }

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching stories:', error);
      return false;
    }
  }

  truncateText(text, maxLength = 120) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }

  getUserData() {
    return this.view.isLoggedIn ? this.view.user : null;
  }
}
