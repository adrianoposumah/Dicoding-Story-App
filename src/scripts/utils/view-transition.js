/**
 * @param {Function} updateCallback
 * @returns {Promise}
 */
export function pageTransition(updateCallback) {
  if (!document.startViewTransition) {
    return Promise.resolve(updateCallback());
  }

  // Use View Transition API
  return document.startViewTransition(updateCallback).finished;
}

/**
 * @returns {boolean}
 */
export function isViewTransitionSupported() {
  return !!document.startViewTransition;
}

/**
 * Assigns a view transition name to an element for named transitions
 * @param {HTMLElement} element - Element to assign transition name
 * @param {string} name - Transition name to assign
 */
export function setViewTransitionName(element, name) {
  if (element && isViewTransitionSupported()) {
    element.style.viewTransitionName = name;
  }
}

/**
 * Creates a transition name for a specific story
 * @param {string} storyId - ID of the story
 * @returns {string} - Unique transition name for the story
 */
export function getStoryTransitionName(storyId) {
  return `story-image-${storyId}`;
}
