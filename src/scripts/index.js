import '../styles/styles.css';
import '../scripts/components/index.js';

import { isViewTransitionSupported } from './utils/view-transition';
import { getActivePathname } from './routes/url-parser';

function setupSkipLink() {
  const skipLink = document.getElementById('skip-link');
  if (!skipLink) return;

  function updateSkipLinkTarget() {
    const currentPath = getActivePathname();
    let targetId = 'main-content';

    if (currentPath.startsWith('/auth/signin')) {
      targetId = 'signin-form';
    } else if (currentPath.startsWith('/auth/signup')) {
      targetId = 'signup-form';
    } else if (currentPath.startsWith('/stories/')) {
      targetId = 'story-detail-container';
    } else if (currentPath === '/add') {
      targetId = 'add-story-form';
    }

    skipLink.setAttribute('href', `#${targetId}`);
  }

  skipLink.addEventListener('click', (e) => {
    const href = skipLink.getAttribute('href');
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      e.preventDefault();
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();

      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  window.addEventListener('hashchange', () => {
    updateSkipLinkTarget();
  });

  updateSkipLinkTarget();
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!isViewTransitionSupported()) {
    console.log(
      'View Transition API is not supported in this browser. Using fallback transitions.',
    );
  }

  setupSkipLink();

  const { default: App } = await import('./pages/app');
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async (event) => {
    console.log('Hash changed:', window.location.hash);
    await app.renderPage();
  });
});
