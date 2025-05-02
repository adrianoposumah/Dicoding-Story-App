import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
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
