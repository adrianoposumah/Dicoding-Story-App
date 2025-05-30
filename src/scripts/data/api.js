import { BASE_URL } from '../config';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  STORIES: `${BASE_URL}/stories`,
  STORIES_GUEST: `${BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
};

export async function register({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return await response.json();
}

export async function login({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return await response.json();
}

export async function getStories() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const response = await fetch(ENDPOINTS.STORIES, {
    headers: {
      Authorization: `Bearer ${auth.token || ''}`,
    },
  });

  return await response.json();
}

export async function getStoryById(id) {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${auth.token || ''}`,
    },
  });

  return await response.json();
}

export async function addStory({ description, photo, lat, lon }) {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');

  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);

  if (lat !== null && lon !== null) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }

  const response = await fetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token || ''}`,
    },
    body: formData,
  });

  return await response.json();
}

export async function addStoryAsGuest({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);

  if (lat !== null && lon !== null) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }

  const response = await fetch(ENDPOINTS.STORIES_GUEST, {
    method: 'POST',
    body: formData,
  });

  return await response.json();
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authData.token || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    }),
  });

  return await response.json();
}

export async function unsubscribePushNotification(endpoint) {
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authData.token || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });

  return await response.json();
}
