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
    if (this.drawerButton && this.navigationDrawer) {
      this.drawerButton.addEventListener('click', (event) => {
        this.navigationDrawer.classList.toggle('translate-x-[-100%]');
        const isExpanded = !this.navigationDrawer.classList.contains('translate-x-[-100%]');
        this.drawerButton.setAttribute('aria-expanded', isExpanded);
        event.stopPropagation();
      });

      document.addEventListener('click', (event) => {
        if (
          this.navigationDrawer &&
          !this.navigationDrawer.contains(event.target) &&
          !this.drawerButton.contains(event.target) &&
          !this.navigationDrawer.classList.contains('translate-x-[-100%]')
        ) {
          this.navigationDrawer.classList.add('translate-x-[-100%]');
          this.drawerButton.setAttribute('aria-expanded', false);
        }
      });

      document.addEventListener('keydown', (event) => {
        if (
          event.key === 'Escape' &&
          this.navigationDrawer &&
          !this.navigationDrawer.classList.contains('translate-x-[-100%]')
        ) {
          this.navigationDrawer.classList.add('translate-x-[-100%]');
          this.drawerButton.setAttribute('aria-expanded', false);
          this.drawerButton.focus();
        }
      });
    }
  }

  async renderPage() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.page = getPage();
    const targetPath = getActivePathname();
    const useCustomAnimation = shouldUseCustomAnimation(this.currentPath, targetPath);
    const animationType = getRecommendedAnimationType(this.currentPath, targetPath);

    try {
      // Store current scroll position
      const scrollPosition = window.scrollY;

      // Measure content container dimensions to prevent layout shifts
      const contentRect = this.content.getBoundingClientRect();
      const contentHeight = contentRect.height;

      // Create a temporary placeholder to maintain layout during transition
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

      // Reset min-height after transition
      this.content.style.minHeight = '';

      this.content.focus();
      await this.page.afterRender();

      // Clean up any preserved loaders
      const preservedLoaders = document.querySelectorAll('.preserved-loader');
      preservedLoaders.forEach((loader) => loader.remove());

      // Update current path
      this.currentPath = targetPath;

      // Scroll handling
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
    }
  }
}
