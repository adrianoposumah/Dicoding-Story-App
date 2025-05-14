import StoryDB from '../../data/database';

export default class SaveStoryModel {
  constructor() {
    this.savedStories = [];
    this.user = null;
    this.isLoggedIn = false;
  }

  getUserAuthState() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    return { isLoggedIn: this.isLoggedIn, user: this.user };
  }

  async fetchSavedStories() {
    try {
      this.savedStories = await StoryDB.getAllStories();
      return { stories: this.savedStories, error: false };
    } catch (error) {
      console.error('Error fetching saved stories:', error);
      return { stories: [], error: true, message: error.message };
    }
  }
}
