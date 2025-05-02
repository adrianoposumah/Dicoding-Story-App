import '../styles/styles.css';
import '../scripts/components/index.js';

import { isViewTransitionSupported } from './utils/view-transition';

document.addEventListener('DOMContentLoaded', async () => {
  if (!isViewTransitionSupported()) {
    console.log(
      'View Transition API is not supported in this browser. Using fallback transitions.',
    );
  }

  const { default: App } = await import('./pages/app'); // Lazy load the App class
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
