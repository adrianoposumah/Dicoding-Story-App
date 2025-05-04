export default class HomePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.initApplication();
  }

  initApplication() {
    const isLoggedIn = this.model.initializeAuthState();
    this.view.updateAuthState(isLoggedIn, this.model.getUser());
  }

  async fetchStories() {
    try {
      if (this.model.isLoggedIn) {
        const stories = await this.model.fetchStories();
        this.view.updateStories(stories);
        return true;
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
    return this.model.getUser();
  }
}
