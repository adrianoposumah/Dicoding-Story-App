import feather from 'feather-icons';

class NavBar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const isLoggedIn = localStorage.getItem('auth') !== null;
    const user = isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;

    this.innerHTML = `
      <header class="sticky top-0 z-40 bg-background shadow-md">
        <div class="container mx-auto px-8 py-4 flex justify-between items-center">
          <a class="text-2xl font-bold text-primary transition-colors duration-300" href="#/" aria-label="Story App Home">Story App</a>

          <button id="drawer-button" 
            class="text-secondary hover:text-primary text-2xl lg:hidden transition-colors duration-300 z-50"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
            aria-controls="navigation-drawer">☰</button>

          <nav id="navigation-drawer" 
            class="fixed top-0 left-0 z-50 h-screen w-64 bg-background p-6 shadow-lg transform transition-transform duration-300 translate-x-[-100%] lg:translate-x-0 lg:relative lg:h-auto lg:w-auto lg:p-0 lg:shadow-none"
            aria-label="Main navigation"
            role="navigation">
            <ul id="nav-list" class="flex flex-col lg:flex-row gap-6 items-center">
              <li><a href="#/" class="text-secondary hover:text-primary transition-colors duration-300">Home</a></li>
              ${
                isLoggedIn
                  ? `
                <li class="lg:ml-4">
                  <button id="logout-button" class="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-300" aria-label="Logout from account">
                    <i data-feather="log-out" class="w-4 h-4" aria-hidden="true"></i> Logout <span class="sr-only">from account</span> (${user ? user.name : ''})
                  </button>
                </li>
              `
                  : `
                <div class="flex items-center gap-4">
                <li>
                    <a href="#/auth/signin" class="border font-semibold border-primary text-primary text-sm px-3 py-2 rounded-md hover:bg-primary hover:text-white transition-colors duration-300">Sign In</a>
                </li>
                <li>
                  <a href="#/auth/signup" class="inline-block font-semibold bg-primary text-white text-sm px-3 py-2 rounded-md hover:bg-secondary transition-colors duration-300">Sign Up</a>
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

    const drawerButton = this.querySelector('#drawer-button');
    const navigationDrawer = this.querySelector('#navigation-drawer');

    if (drawerButton && navigationDrawer) {
      drawerButton.addEventListener('click', (event) => {
        const isExpanded = navigationDrawer.classList.contains('translate-x-[-100%]')
          ? false
          : true;
        navigationDrawer.classList.toggle('translate-x-[-100%]');
        drawerButton.setAttribute('aria-expanded', !isExpanded);
        event.stopPropagation();
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
