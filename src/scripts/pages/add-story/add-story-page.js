import feather from 'feather-icons';
import AddStoryPresenter from './add-story-presenter';
import StoryDescription from '../../components/story/story-description';
import PhotoUpload from '../../components/story/photo-upload';
import LocationPicker from '../../components/story/location-picker';

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.isLoggedIn = this.presenter.isUserLoggedIn();
    this.user = this.presenter.getUserData();

    this.descriptionComponent = new StoryDescription();
    this.photoUploadComponent = new PhotoUpload();
    this.locationPickerComponent = new LocationPicker();
  }

  async render() {
    return `
      <transition-wrapper animation-type="flip" duration="500">
        <section class="container mx-auto px-8 py-10">
          <div class="max-w-3xl mx-auto">
            <div class="flex items-center justify-between mb-8">
              <h1 class="text-2xl font-bold text-secondary">Add New Story</h1>
              <a href="#/" class="inline-flex items-center gap-2 text-primary hover:underline" aria-label="Go back to stories list">
                <i data-feather="arrow-left" class="w-4 h-4" aria-hidden="true"></i> Back to stories
              </a>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6">
              <div id="alert-container" class="mb-6 hidden" aria-live="assertive">
                <div id="alert" class="p-4 rounded" role="alert"></div>
              </div>
              
              <form id="add-story-form" class="space-y-6" novalidate>
                <!-- Story Description Component -->
                ${this.descriptionComponent.render()}
                
                <!-- Photo Upload Component -->
                ${this.photoUploadComponent.render()}
                
                <!-- Location Picker Component -->
                ${this.locationPickerComponent.render()}
                
                <!-- Submit Button -->
                <div>
                  <button 
                    type="submit" 
                    id="submit-button"
                    class="w-full inline-flex justify-center items-center gap-2 py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-secondary transition-colors"
                    aria-label="${this.isLoggedIn ? 'Post story as a logged in user' : 'Post story as a guest'}"
                  >
                    <i data-feather="upload-cloud" class="w-5 h-5" aria-hidden="true"></i>
                    ${this.isLoggedIn ? 'Post Story' : 'Post Story as Guest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </transition-wrapper>
    `;
  }

  async afterRender() {
    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

    const form = document.getElementById('add-story-form');
    const submitButton = document.getElementById('submit-button');
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.getElementById('alert');

    const showAlert = (message, isError = false) => {
      alertContainer.classList.remove('hidden');
      alertElement.textContent = message;
      alertElement.className = `p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
      alertElement.setAttribute('role', 'alert');

      alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Initialize components
    this.descriptionComponent.afterRender();

    this.photoUploadComponent.onPhotoSelected = (photoFile) => {
      this.presenter.setPhoto(photoFile);
    };
    this.photoUploadComponent.afterRender(showAlert);

    this.locationPickerComponent.onLocationChanged = (location) => {
      this.presenter.setLocation(location.lat, location.lon);
    };
    await this.locationPickerComponent.afterRender();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = this.descriptionComponent.value;
      this.presenter.setDescription(description);

      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.innerHTML =
        '<span class="animate-spin mr-2" aria-hidden="true">⟳</span> Posting...';

      try {
        const result = await this.presenter.submitStory();

        if (!result.success) {
          showAlert(result.message, true);
        } else {
          showAlert('Story posted successfully!', false);

          form.reset();
          this.resetForm();

          setTimeout(() => {
            this.presenter.redirectToHome();
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting story:', error);
        showAlert('An unexpected error occurred. Please try again.', true);
      } finally {
        submitButton.disabled = false;
        submitButton.setAttribute('aria-busy', 'false');
        submitButton.innerHTML = `<i data-feather="upload-cloud" class="w-5 h-5" aria-hidden="true"></i> ${this.isLoggedIn ? 'Post Story' : 'Post Story as Guest'}`;
        feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
      }
    });

    window.addEventListener('hashchange', () => {
      this.photoUploadComponent.cleanup();
    });
  }

  resetForm() {
    this.descriptionComponent.value = '';
    this.photoUploadComponent.reset();
    this.locationPickerComponent.reset();
    this.presenter.resetData();
  }

  fixLeafletIconPaths() {
    this.locationPickerComponent.fixLeafletIconPaths();
  }

  async stopCamera() {
    await this.photoUploadComponent.stopCamera();
  }
}
