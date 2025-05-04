import { getStories } from '../../data/api';

export default class HomeModel {
  constructor() {
    this.stories = [];
    this.user = null;
    this.isLoggedIn = false;
  }

  initializeAuthState() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    return this.isLoggedIn;
  }

  async fetchStories() {
    try {
      if (this.isLoggedIn) {
        const response = await getStories();
        if (!response.error) {
          this.stories = response.listStory;

          try {
            sessionStorage.setItem('homePageStories', JSON.stringify(this.stories));
          } catch (e) {
            console.error('Error saving to session storage:', e);
          }

          return this.stories;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  }

  getUser() {
    return this.user;
  }

  getStories() {
    return this.stories;
  }
}
