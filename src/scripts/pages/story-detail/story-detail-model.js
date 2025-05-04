import { getStoryById } from '../../data/api';

export default class StoryDetailModel {
  constructor() {
    this.storyCache = null;
  }

  async getStoryById(id) {
    try {
      const response = await getStoryById(id);
      return response;
    } catch (error) {
      console.error('Error in model fetching story:', error);
      throw error;
    }
  }

  getImageUrlFromCache(storyId) {
    try {
      const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
      const cachedStory = homePageStories.find((story) => story.id === storyId);

      if (cachedStory && cachedStory.photoUrl) {
        return cachedStory.photoUrl;
      }
      return '';
    } catch (error) {
      console.error('Error getting cached image:', error);
      return '';
    }
  }

  saveStoryToSessionStorage(story) {
    try {
      const homePageStories = JSON.parse(sessionStorage.getItem('homePageStories') || '[]');
      if (!homePageStories.find((s) => s.id === story.id)) {
        homePageStories.push(story);
        sessionStorage.setItem('homePageStories', JSON.stringify(homePageStories));
      }
    } catch (e) {
      console.error('Error saving to session storage:', e);
    }
  }

  getUserAuthState() {
    const isLoggedIn = localStorage.getItem('auth') !== null;
    const user = isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    return { isLoggedIn, user };
  }
}
