import getPage from '../routes/routes';
import {
  pageTransition,
  shouldUseCustomAnimation,
  getRecommendedAnimationType,
} from '../utils/view-transition';
import { getActivePathname } from '../routes/url-parser';

export default class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this.content = content;
    this.drawerButton = drawerButton;
    this.navigationDrawer = navigationDrawer;
    this.page = null;
    this.currentPath = getActivePathname();
    this.isTransitioning = false;

    this.initialize();
  }

  initialize() {
    this.updateSkipLinkTarget();
  }

  async renderPage() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    document.body.classList.add('transitioning');

    try {
      this.page = getPage();
      const targetPath = getActivePathname();
      const useCustomAnimation = shouldUseCustomAnimation(this.currentPath, targetPath);
      const animationType = getRecommendedAnimationType(this.currentPath, targetPath);

      const scrollPosition = window.scrollY;

      const contentRect = this.content.getBoundingClientRect();
      const contentHeight = contentRect.height;

      if (useCustomAnimation) {
        this.content.style.minHeight = `${contentHeight}px`;
      }

      await pageTransition(
        async () => {
          const content = await this.page.render();
          this.content.innerHTML = content;
        },
        useCustomAnimation,
        animationType,
      );

      this.content.style.minHeight = '';

      setTimeout(() => {
        this.content.focus();

        this.updateSkipLinkTarget();
      }, 100);

      await this.page.afterRender();

      const preservedLoaders = document.querySelectorAll('.preserved-loader');
      preservedLoaders.forEach((loader) => loader.remove());

      this.currentPath = targetPath;

      if (!targetPath.includes('/stories/')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, scrollPosition);
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      this.content.innerHTML = `
        <div class="container mx-auto px-8 py-10" role="alert" aria-live="assertive">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>An error occurred while loading the page. Please try again later.</p>
          </div>
        </div>
      `;
    } finally {
      this.isTransitioning = false;
      this.content.style.minHeight = '';

      document.body.classList.remove('transitioning');
    }
  }

  updateSkipLinkTarget() {
    const skipLink = document.getElementById('skip-link');
    if (!skipLink) return;

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
    } else if (currentPath === '/save') {
      targetId = 'saved-stories-container';
    } else if (currentPath.startsWith('/savestories/')) {
      targetId = 'story-detail-container';
    }

    skipLink.setAttribute('href', `#${targetId}`);

    setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement && targetId !== 'main-content') {
        targetElement.setAttribute('tabindex', '-1');
      }
    }, 200);
  }
}
