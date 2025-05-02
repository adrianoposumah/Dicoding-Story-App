export const ANIMATION_TYPES = {
  FADE: 'fade',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SCALE: 'scale',
  FLIP: 'flip',
};

const LOADING_SELECTORS = [
  '[role="status"]',
  '[aria-busy="true"]',
  '.animate-spin',
  '[aria-live="polite"]',
  '[aria-live="assertive"]',
];

export function animateEntrance(element, type = ANIMATION_TYPES.FADE, duration = 1000) {
  if (!element || !window.Animation) return null;

  let keyframes = [];
  let options = {
    duration,
    fill: 'forwards',
    easing: 'ease-out',
  };

  switch (type) {
    case ANIMATION_TYPES.FADE:
      keyframes = [{ opacity: 0 }, { opacity: 1 }];
      break;
    case ANIMATION_TYPES.SLIDE_LEFT:
      keyframes = [
        { transform: 'translateX(20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ];
      break;
    case ANIMATION_TYPES.SLIDE_RIGHT:
      keyframes = [
        { transform: 'translateX(-20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ];
      break;
    case ANIMATION_TYPES.SCALE:
      keyframes = [
        { transform: 'scale(0.95)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ];
      break;
    case ANIMATION_TYPES.FLIP:
      keyframes = [
        { transform: 'perspective(400px) rotateX(10deg)', opacity: 0 },
        { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
      ];
      options.easing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      break;
    default:
      keyframes = [{ opacity: 0 }, { opacity: 1 }];
  }

  return element.animate(keyframes, options);
}

export function animateExit(element, type = ANIMATION_TYPES.FADE, duration = 1000) {
  if (!element || !window.Animation) return null;

  let keyframes = [];
  let options = {
    duration,
    fill: 'forwards',
    easing: 'ease-in',
  };

  switch (type) {
    case ANIMATION_TYPES.FADE:
      keyframes = [{ opacity: 1 }, { opacity: 0 }];
      break;
    case ANIMATION_TYPES.SLIDE_LEFT:
      keyframes = [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(-20px)', opacity: 0 },
      ];
      break;
    case ANIMATION_TYPES.SLIDE_RIGHT:
      keyframes = [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(20px)', opacity: 0 },
      ];
      break;
    case ANIMATION_TYPES.SCALE:
      keyframes = [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.95)', opacity: 0 },
      ];
      break;
    case ANIMATION_TYPES.FLIP:
      keyframes = [
        { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
        { transform: 'perspective(400px) rotateX(-10deg)', opacity: 0 },
      ];
      options.easing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      break;
    default:
      keyframes = [{ opacity: 1 }, { opacity: 0 }];
  }

  return element.animate(keyframes, options);
}

export async function pageAnimationTransition(
  oldPage,
  newPage,
  type = ANIMATION_TYPES.FADE,
  duration = 1000,
) {
  if (!oldPage || !newPage || !window.Animation) {
    return Promise.resolve();
  }

  oldPage.getBoundingClientRect();
  newPage.getBoundingClientRect();

  preserveLoadingContent(oldPage, newPage);

  newPage.style.opacity = '0';

  const fadeOutAnimation = oldPage.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration,
    fill: 'forwards',
    easing: 'ease-out',
  });

  await new Promise((resolve) => {
    fadeOutAnimation.onfinish = resolve;
  });

  const fadeInAnimation = newPage.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration,
    fill: 'forwards',
    easing: 'ease-in',
  });

  await new Promise((resolve) => {
    fadeInAnimation.onfinish = resolve;
  });

  newPage.style.opacity = '';

  return Promise.resolve();
}

function getExitKeyframes(type) {
  switch (type) {
    case ANIMATION_TYPES.FADE:
      return [{ opacity: 1 }, { opacity: 0 }];
    case ANIMATION_TYPES.SLIDE_LEFT:
      return [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(-20px)', opacity: 0 },
      ];
    case ANIMATION_TYPES.SLIDE_RIGHT:
      return [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(20px)', opacity: 0 },
      ];
    case ANIMATION_TYPES.SCALE:
      return [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.95)', opacity: 0 },
      ];
    case ANIMATION_TYPES.FLIP:
      return [
        { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
        { transform: 'perspective(400px) rotateX(-10deg)', opacity: 0 },
      ];
    default:
      return [{ opacity: 1 }, { opacity: 0 }];
  }
}

function getEntranceKeyframes(type) {
  switch (type) {
    case ANIMATION_TYPES.FADE:
      return [{ opacity: 0 }, { opacity: 1 }];
    case ANIMATION_TYPES.SLIDE_LEFT:
      return [
        { transform: 'translateX(20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ];
    case ANIMATION_TYPES.SLIDE_RIGHT:
      return [
        { transform: 'translateX(-20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ];
    case ANIMATION_TYPES.SCALE:
      return [
        { transform: 'scale(0.95)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ];
    case ANIMATION_TYPES.FLIP:
      return [
        { transform: 'perspective(400px) rotateX(10deg)', opacity: 0 },
        { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
      ];
    default:
      return [{ opacity: 0 }, { opacity: 1 }];
  }
}

function preserveLoadingContent(oldPage, newPage) {
  const hasNewPageLoaders = LOADING_SELECTORS.some(
    (selector) => newPage.querySelector(selector) !== null,
  );

  if (hasNewPageLoaders) return;

  LOADING_SELECTORS.forEach((selector) => {
    const loaders = oldPage.querySelectorAll(selector);
    if (loaders.length > 0) {
      let container =
        newPage.querySelector('#stories-container') ||
        newPage.querySelector('main') ||
        newPage.querySelector('section') ||
        newPage;

      loaders.forEach((loader) => {
        const clone = loader.cloneNode(true);
        clone.classList.add('preserved-loader');
        container.appendChild(clone);
      });
    }
  });
}

export function getAnimationTypeForNavigation(currentPath, targetPath) {
  const sections = ['/', '/auth', '/stories', '/add'];

  const getCurrentSectionIndex = (path) => {
    return sections.findIndex((section) => path === section || path.startsWith(`${section}/`));
  };

  const currentIdx = getCurrentSectionIndex(currentPath);
  const targetIdx = getCurrentSectionIndex(targetPath);

  if (
    targetPath.startsWith('/stories/') &&
    (currentPath === '/' || currentPath.startsWith('/stories/'))
  ) {
    return null;
  }

  if (currentIdx < targetIdx) {
    return ANIMATION_TYPES.SLIDE_LEFT;
  } else if (currentIdx > targetIdx) {
    return ANIMATION_TYPES.SLIDE_RIGHT;
  } else if (currentPath.includes('/auth/') && targetPath.includes('/auth/')) {
    return ANIMATION_TYPES.SCALE;
  } else if (targetPath === '/' || currentPath === '/') {
    return ANIMATION_TYPES.FADE;
  }

  return ANIMATION_TYPES.FADE;
}
