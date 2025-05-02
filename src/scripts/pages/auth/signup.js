import { register } from '../../data/api';
import SignUpPresenter from './signup-presenter';

export default class SignUpPage {
  constructor() {
    this.presenter = new SignUpPresenter(this);
  }

  async render() {
    return `
      <transition-wrapper animation-type="slideRight" duration="400">
        <div class="container mx-auto px-4 py-10 h-[80vh]">
          <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
            <h1 class="text-2xl font-bold text-center text-secondary mb-6">Sign Up</h1>
            
            <div id="alert-container" class="mb-4 hidden" aria-live="assertive">
              <div id="alert" class="p-4 rounded" role="alert"></div>
            </div>
            
            <form id="signup-form" class="space-y-6" novalidate>
              <div>
                <label for="name" class="block text-sm font-medium text-secondary">Name</label>
                <input type="text" id="name" name="name" required 
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                  aria-required="true">
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-secondary">Email</label>
                <input type="email" id="email" name="email" required 
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                  aria-required="true">
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-secondary">Password</label>
                <input type="password" id="password" name="password" required minlength="6"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                  aria-required="true">
                <p id="password-hint" class="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>
              
              <div>
                <button type="submit" id="submit-button"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Sign Up
                </button>
              </div>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">
                Already have an account? 
                <a href="#/auth/signin" class="font-medium text-primary hover:text-secondary transition-colors duration-300">Sign In</a>
              </p>
            </div>
          </div>
        </div>
      </transition-wrapper>
    `;
  }

  async afterRender() {
    const form = document.getElementById('signup-form');
    const submitButton = document.getElementById('submit-button');
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.getElementById('alert');

    if (!form || !submitButton || !alertContainer || !alertElement) {
      console.error('Required elements not found');
      return;
    }

    const showAlert = (message, isError = false) => {
      alertContainer.classList.remove('hidden');
      alertElement.textContent = message;
      alertElement.className = `p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      submitButton.disabled = true;
      submitButton.textContent = 'Signing up...';
      submitButton.setAttribute('aria-busy', 'true');

      const result = await this.presenter.performRegistration(name, email, password);

      if (!result.success) {
        showAlert(result.message, true);
      } else {
        showAlert('Registration successful! Redirecting to sign in...', false);
        setTimeout(() => {
          this.presenter.redirectToSignIn();
        }, 2000);
      }

      submitButton.disabled = false;
      submitButton.textContent = 'Sign Up';
      submitButton.setAttribute('aria-busy', 'false');
    });
  }
}
