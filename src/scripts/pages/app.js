import getPage from '../routes/routes';
import { pageTransition } from '../utils/view-transition';

export default class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this.content = content;
    this.drawerButton = drawerButton;
    this.navigationDrawer = navigationDrawer;
    this.page = null;

    this.initialize();
  }

  initialize() {
    // Set up drawer button for mobile
    if (this.drawerButton && this.navigationDrawer) {
      this.drawerButton.addEventListener('click', (event) => {
        this.navigationDrawer.classList.toggle('translate-x-[-100%]');
        event.stopPropagation();
      });

      // Close drawer when clicking outside of it
      document.addEventListener('click', (event) => {
        if (
          this.navigationDrawer &&
          !this.navigationDrawer.contains(event.target) &&
          !this.drawerButton.contains(event.target) &&
          !this.navigationDrawer.classList.contains('translate-x-[-100%]')
        ) {
          this.navigationDrawer.classList.add('translate-x-[-100%]');
        }
      });
    }
  }

  async renderPage() {
    // Get the current page based on the URL
    this.page = getPage();

    try {
      // Use View Transitions API if available
      await pageTransition(async () => {
        const content = await this.page.render();
        this.content.innerHTML = content;
      });

      // Execute the afterRender logic once the content is loaded
      await this.page.afterRender();
    } catch (error) {
      console.error('Error rendering page:', error);
      this.content.innerHTML = `
        <div class="container mx-auto px-8 py-10">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>An error occurred while loading the page. Please try again later.</p>
          </div>
        </div>
      `;
    }

    // Scroll to top when navigating to a new page
    window.scrollTo(0, 0);
  }
}
