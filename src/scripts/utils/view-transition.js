import { pageAnimationTransition, getAnimationTypeForNavigation } from './animation';

export function pageTransition(updateCallback, useCustomAnimation = false, animationType = null) {
  if (!useCustomAnimation && document.startViewTransition) {
    return document.startViewTransition(updateCallback).finished;
  }

  if (useCustomAnimation) {
    const mainContent = document.querySelector('#main-content');
    if (!mainContent) {
      return Promise.resolve(updateCallback());
    }

    const scrollPosition = window.scrollY;

    const originalContent = mainContent.innerHTML;
    const originalHeight = mainContent.offsetHeight;

    mainContent.style.minHeight = `${originalHeight}px`;

    const tempWrapper = document.createElement('div');
    tempWrapper.style.opacity = '1';
    tempWrapper.innerHTML = originalContent;

    const fadeOutPromise = new Promise((resolve) => {
      const fadeOut = tempWrapper.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        fill: 'forwards',
        easing: 'ease-out',
      });

      fadeOut.onfinish = resolve;
    });

    return fadeOutPromise.then(() => {
      mainContent.style.opacity = '0';
      const updateResult = updateCallback();

      const contentUpdatePromise =
        updateResult && typeof updateResult.then === 'function' ? updateResult : Promise.resolve();

      return contentUpdatePromise.then(() => {
        return new Promise((resolve) => {
          const fadeIn = mainContent.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
            fill: 'forwards',
            easing: 'ease-in',
          });

          fadeIn.onfinish = () => {
            mainContent.style.opacity = '';
            mainContent.style.minHeight = '';
            resolve();
          };
        });
      });
    });
  }

  return Promise.resolve(updateCallback());
}

export function isViewTransitionSupported() {
  return !!document.startViewTransition;
}

export function setViewTransitionName(element, name) {
  if (element && isViewTransitionSupported()) {
    element.style.viewTransitionName = name;
  }
}

export function getStoryTransitionName(storyId) {
  return `story-image-${storyId}`;
}

export function shouldUseCustomAnimation(currentRoute, targetRoute) {
  if (
    targetRoute.startsWith('/stories/') &&
    (currentRoute === '/' || currentRoute.startsWith('/stories/'))
  ) {
    return false;
  }

  return true;
}

export function getRecommendedAnimationType(currentRoute, targetRoute) {
  return getAnimationTypeForNavigation(currentRoute, targetRoute);
}
