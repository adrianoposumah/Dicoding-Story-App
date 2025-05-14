// Create an IndexedDB database for storing saved stories
const DATABASE_NAME = 'storyapp';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

// Open the database connection
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const StoryDB = {
  async getAllStories() {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('Error getting all stories:', event.target.error);
          reject(new Error('Failed to retrieve stories'));
        };
      });
    } catch (error) {
      console.error('Error getting all stories:', error);
      return [];
    }
  },

  async getStory(id) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('Error getting story:', event.target.error);
          reject(new Error(`Failed to retrieve story with id ${id}`));
        };
      });
    } catch (error) {
      console.error(`Error getting story ${id}:`, error);
      return null;
    }
  },

  async saveStory(story) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        const request = store.put(story);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error saving story:', event.target.error);
          reject(new Error('Failed to save story'));
        };
      });
    } catch (error) {
      console.error('Error saving story:', error);
      return false;
    }
  },

  async deleteStory(id) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error deleting story:', event.target.error);
          reject(new Error(`Failed to delete story with id ${id}`));
        };
      });
    } catch (error) {
      console.error(`Error deleting story ${id}:`, error);
      return false;
    }
  },

  async isStorySaved(id) {
    try {
      const story = await this.getStory(id);
      return !!story;
    } catch (error) {
      console.error(`Error checking if story ${id} is saved:`, error);
      return false;
    }
  },
};

export default StoryDB;
