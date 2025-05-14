import feather from 'feather-icons';
import NotFoundPresenter from './not-found-presenter';

export default class NotFoundPage {
  constructor() {
    this.presenter = new NotFoundPresenter(this);
  }

  async render() {
    return `
      <transition-wrapper animation-type="fade" duration="400">
        <section class="container mx-auto px-8 py-10 min-h-[80vh] flex flex-col justify-center items-center">
          <div class="text-center max-w-2xl bg-white p-8 rounded-lg shadow-lg">
          
            <h1 class="text-4xl font-bold mb-4 text-primary">404</h1>
            <h2 class="text-3xl font-bold text-secondary mb-4">Halaman tidak ditemukan</h2>
            
            <div class="flex justify-center gap-4">
              <a href="#/" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-secondary transition-colors duration-300">
                <i data-feather="home" class="w-5 h-5" aria-hidden="true"></i> Go Home
              </a>
              <button id="back-button" class="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-300">
                <i data-feather="arrow-left" class="w-5 h-5" aria-hidden="true"></i> Go Back
              </button>
            </div>
          </div>
        </section>
      </transition-wrapper>
    `;
  }

  async afterRender() {
    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.history.back();
      });
    }
  }
}
