import feather from 'feather-icons';
import { getSubscriptionStatus, subscribe, unsubscribe } from '../utils/notification-helper';

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.subscriptionStatus = {
      isAvailable: false,
      isPermissionGranted: false,
      isSubscribed: false,
    };
  }

  async connectedCallback() {
    await this.updateSubscriptionStatus();
    this.render();
    this.setupEventListeners();
  }

  async updateSubscriptionStatus() {
    try {
      this.subscriptionStatus = await getSubscriptionStatus();
    } catch (error) {
      console.error('Failed to get subscription status:', error);
    }
  }

  async handleNotificationButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.subscriptionStatus.isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }

    await this.updateSubscriptionStatus();
    this.render();
    this.setupEventListeners();
  }

  render() {
    const isLoggedIn = localStorage.getItem('auth') !== null;
    const user = isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
    const { isAvailable, isSubscribed } = this.subscriptionStatus;

    this.innerHTML = `
      <header class="sticky top-0 z-40 bg-background shadow-md">
        <div class="container mx-auto px-8 py-4 flex justify-between items-center">
          <a class="text-2xl py-2 font-bold text-primary transition-colors duration-300" href="#/" aria-label="Story App Home">Story App</a>

          <button id="drawer-button" 
            class="text-secondary hover:text-primary text-2xl lg:hidden transition-colors duration-300"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
            aria-controls="navigation-drawer">☰</button>

          <nav id="navigation-drawer" 
            class="fixed top-0 left-0 right-0 z-40 h-screen bg-background p-6 shadow-lg transform transition-transform duration-300 translate-x-[-100%] lg:transform-none lg:translate-x-0 lg:relative lg:h-auto lg:w-auto lg:p-0 lg:shadow-none"
            aria-label="Main navigation"
            role="navigation">
            <div class="flex justify-end lg:hidden mb-4">
              <button id="close-drawer" class="text-2xl" aria-label="Close navigation menu">✕</button>
            </div>
            <ul id="nav-list" class="flex flex-col lg:flex-row gap-6 items-center">
              <li><a href="#/" class="text-secondary hover:text-primary transition-colors duration-300">Home</a></li>
              ${isLoggedIn ? '<li><a href="#/save" class="text-secondary hover:text-primary transition-colors duration-300">Saved Stories</a></li>' : ''}
              ${
                isLoggedIn
                  ? `
                <li class="lg:ml-4 flex items-center gap-3">
                  ${
                    isAvailable
                      ? `<button id="notification-button" class="h-11 inline-flex items-center gap-2 ${isSubscribed ? 'bg-secondary text-white' : 'border border-primary text-primary'} text-sm px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-colors duration-300" aria-label="${isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}">
                      <i data-feather="${isSubscribed ? 'bell-off' : 'bell'}" class="w-4 h-4" aria-hidden="true"></i> 
                      ${isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </button>`
                      : ''
                  }
                  <button id="logout-button" class="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-300" aria-label="Logout from account">
                    <i data-feather="log-out" class="w-4 h-4" aria-hidden="true"></i> Logout <span class="sr-only">from account</span> (${user ? user.name : ''})
                  </button>
                </li>
              `
                  : `
                <div class="flex flex-col lg:flex-row items-center gap-4">
                <li>
                    <a href="#/auth/signin" class="border font-semibold border-primary text-primary text-base px-3 py-2.5 rounded-md hover:bg-primary hover:text-white transition-colors duration-300">Sign In</a>
                </li>
                <li>
                  <a href="#/auth/signup" class="inline-block font-semibold bg-primary text-white text-base px-3 py-2.5 rounded-md hover:bg-secondary transition-colors duration-300">Sign Up</a>
                </li>
                </div>
              `
              }
            </ul>
          </nav>
        </div>
      </header>
    `;

    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
  }

  setupEventListeners() {
    const logoutButton = this.querySelector('#logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('auth');
        window.location.hash = '#/';
        window.location.reload();
      });
    }

    const notificationButton = this.querySelector('#notification-button');
    if (notificationButton) {
      notificationButton.addEventListener('click', this.handleNotificationButtonClick.bind(this));
    }

    const drawerButton = this.querySelector('#drawer-button');
    const navigationDrawer = this.querySelector('#navigation-drawer');
    const closeDrawerButton = this.querySelector('#close-drawer');

    if (drawerButton && navigationDrawer) {
      // Open drawer
      drawerButton.addEventListener('click', (event) => {
        navigationDrawer.classList.remove('translate-x-[-100%]');
        drawerButton.setAttribute('aria-expanded', 'true');
        event.stopPropagation();
      });

      // Close drawer with X button
      if (closeDrawerButton) {
        closeDrawerButton.addEventListener('click', () => {
          navigationDrawer.classList.add('translate-x-[-100%]');
          drawerButton.setAttribute('aria-expanded', 'false');
        });
      }

      // Close drawer when clicking on links
      const navLinks = navigationDrawer.querySelectorAll('a');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 1024) {
            navigationDrawer.classList.add('translate-x-[-100%]');
            drawerButton.setAttribute('aria-expanded', 'false');
          }
        });
      });

      // Close drawer when clicking outside
      document.addEventListener('click', (event) => {
        if (
          !navigationDrawer.contains(event.target) &&
          !drawerButton.contains(event.target) &&
          !navigationDrawer.classList.contains('translate-x-[-100%]')
        ) {
          navigationDrawer.classList.add('translate-x-[-100%]');
          drawerButton.setAttribute('aria-expanded', 'false');
        }
      });

      // Close drawer on escape key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !navigationDrawer.classList.contains('translate-x-[-100%]')) {
          navigationDrawer.classList.add('translate-x-[-100%]');
          drawerButton.setAttribute('aria-expanded', 'false');
          drawerButton.focus();
        }
      });
    }
  }
}

customElement('nav-bar', NavBar);

function customElement(name, constructor) {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}
