import StoryDB from '../../data/database';

export default class SaveStoryDetailModel {
  constructor() {
    this.storyCache = null;
  }

  async getStoryById(id) {
    try {
      const story = await StoryDB.getStory(id);
      return story;
    } catch (error) {
      console.error('Error getting saved story:', error);
      return null;
    }
  }

  getUserAuthState() {
    const isLoggedIn = localStorage.getItem('auth') !== null;
    const user = isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    return { isLoggedIn, user };
  }

  async deleteSavedStory(id) {
    try {
      await StoryDB.deleteStory(id);
      return true;
    } catch (error) {
      console.error('Error deleting saved story:', error);
      return false;
    }
  }
}
