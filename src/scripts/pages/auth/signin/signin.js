import { login } from '../../../data/api';
import SignInPresenter from './signin-presenter';

export default class SignInPage {
  constructor() {
    this.presenter = new SignInPresenter(this);
  }

  async render() {
    return `
      <transition-wrapper animation-type="slideLeft" duration="400">
        <div class="container mx-auto px-4 py-10 h-[80vh]">
          <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
            <h1 class="text-2xl font-bold text-center text-secondary mb-6">Sign In</h1>
            
            <div id="alert-container" class="mb-4 hidden" aria-live="assertive">
              <div id="alert" class="p-4 rounded" role="alert"></div>
            </div>
            
            <form id="signin-form" class="space-y-6" novalidate>
              <div>
                <label for="email" class="block text-sm font-medium text-secondary">Email</label>
                <input type="email" id="email" name="email" required 
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                  aria-required="true">
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-secondary">Password</label>
                <input type="password" id="password" name="password" required 
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                  aria-required="true">
              </div>
              
              <div>
                <button type="submit" id="submit-button"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Sign In
                </button>
              </div>
            </form>
            
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">
                Don't have an account? 
                <a href="#/auth/signup" class="font-medium text-primary hover:text-secondary transition-colors duration-300">Sign Up</a>
              </p>
            </div>
          </div>
        </div>
      </transition-wrapper>
    `;
  }

  async afterRender() {
    const form = document.getElementById('signin-form');
    const submitButton = document.getElementById('submit-button');
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.getElementById('alert');

    if (!form || !submitButton || !alertContainer || !alertElement) {
      console.error('Required elements not found for signin form');
      return;
    }

    this.bindEvents(form, submitButton, alertContainer, alertElement);
  }

  bindEvents(form, submitButton, alertContainer, alertElement) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      this.setSubmitButtonState(submitButton, true, 'Signing in...');

      const result = await this.presenter.performLogin(email, password);

      if (!result.success) {
        this.showAlert(alertContainer, alertElement, result.message, true);
      } else {
        this.showAlert(alertContainer, alertElement, result.message, false);

        setTimeout(() => {
          this.presenter.redirectToHome();
        }, 1500);
      }

      this.setSubmitButtonState(submitButton, false, 'Sign In');
    });
  }

  setSubmitButtonState(button, isLoading, text) {
    button.disabled = isLoading;
    button.textContent = text;
    button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  }

  showAlert(container, element, message, isError = false) {
    container.classList.remove('hidden');
    element.textContent = message;
    element.className = `p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    element.setAttribute('role', 'alert');
  }
}
