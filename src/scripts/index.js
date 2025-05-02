// CSS imports
import '../styles/styles.css';
import '../scripts/components/index.js';

import App from './pages/app';
import { isViewTransitionSupported } from './utils/view-transition';

document.addEventListener('DOMContentLoaded', async () => {
  // Log a message if View Transition API is not supported
  if (!isViewTransitionSupported()) {
    console.log(
      'View Transition API is not supported in this browser. Using fallback transitions.',
    );
  }

  // Initialize the application
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // Initial page render
  await app.renderPage();

  // Listen for navigation changes
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
