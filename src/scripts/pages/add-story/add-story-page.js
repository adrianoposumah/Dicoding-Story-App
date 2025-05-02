import { addStory, addStoryAsGuest } from '../../data/api';
import feather from 'feather-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddStoryPresenter from './add-story-presenter';

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.isLoggedIn = this.presenter.isUserLoggedIn();
    this.user = this.presenter.getUserData();
    this.photoFile = null;
    this.photoPreview = null;
    this.mediaStream = null;
    this.videoElement = null;
    this.map = null;
    this.marker = null;
    this.selectedLocation = {
      lat: null,
      lon: null,
    };
  }

  async render() {
    return `
      <section class="container mx-auto px-8 py-10">
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-2xl font-bold text-secondary">Add New Story</h1>
            <a href="#/" class="inline-flex items-center gap-2 text-primary hover:underline">
              <i data-feather="arrow-left" class="w-4 h-4"></i> Back to stories
            </a>
          </div>
          
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div id="alert-container" class="mb-6 hidden">
              <div id="alert" class="p-4 rounded"></div>
            </div>
            
            <form id="add-story-form" class="space-y-6">
              <!-- Story Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-secondary mb-2">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows="4" 
                  required
                  placeholder="Share your story..." 
                  class="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
              
              <!-- Photo Upload -->
              <div class="space-y-4">
                <label class="block text-sm font-medium text-secondary mb-2">
                  Photo <span class="text-red-500">*</span>
                </label>
                
                <div class="flex flex-col md:flex-row gap-4">
                  <!-- Camera Capture -->
                  <div class="w-full md:w-1/2 space-y-3">
                    <div class="bg-gray-100 rounded-lg overflow-hidden">
                      <video 
                        id="camera-preview" 
                        autoplay 
                        playsinline 
                        muted
                        class="w-full h-52 object-cover hidden"
                      ></video>
                      <div 
                        id="camera-placeholder" 
                        class="w-full h-52 flex items-center justify-center"
                      >
                        <p class="text-gray-500 text-center">Camera preview will appear here</p>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <button 
                        type="button" 
                        id="start-camera-button"
                        class="flex-1 inline-flex justify-center items-center gap-2 py-2 px-4 bg-secondary text-white text-sm rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        <i data-feather="video" class="w-4 h-4"></i> Start Camera
                      </button>
                      <button 
                        type="button" 
                        id="capture-photo-button"
                        class="flex-1 inline-flex justify-center items-center gap-2 py-2 px-4 bg-primary text-white text-sm rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled
                      >
                        <i data-feather="camera" class="w-4 h-4"></i> Capture
                      </button>
                    </div>
                  </div>
                  
                  <!-- File Upload or Preview -->
                  <div class="w-full md:w-1/2 space-y-3">
                    <div 
                      id="photo-preview-container" 
                      class="hidden bg-gray-100 rounded-lg overflow-hidden h-52 relative"
                    >
                      <img 
                        id="photo-preview" 
                        src="#" 
                        alt="Photo preview" 
                        class="w-full h-full object-cover"
                      >
                      <button 
                        type="button" 
                        id="remove-photo-button"
                        class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <i data-feather="x" class="w-4 h-4"></i>
                      </button>
                    </div>
                    <div 
                      id="upload-placeholder" 
                      class="border-2 border-dashed border-gray-300 rounded-lg p-4 h-52 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <i data-feather="upload" class="w-8 h-8 text-gray-400 mb-2"></i>
                      <p class="text-sm text-gray-500 text-center">Click to upload or drag and drop</p>
                      <p class="text-xs text-gray-400 mt-1">Max 1MB, JPEG, PNG</p>
                      <input 
                        type="file" 
                        id="photo-upload" 
                        name="photo" 
                        accept="image/*" 
                        class="hidden"
                      >
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Location (Map) -->
              <div class="space-y-4">
                <label class="block text-sm font-medium text-secondary mb-2">
                  Location (Optional)
                </label>
                <div id="map" class="h-[300px] w-full rounded-lg shadow-md"></div>
                <div id="location-info" class="text-sm text-gray-600 hidden">
                  <p>Selected coordinates: <span id="coordinates-display">None</span></p>
                  <button 
                    type="button" 
                    id="clear-location-button"
                    class="text-red-500 hover:underline mt-1"
                  >
                    Clear location
                  </button>
                </div>
              </div>
              
              <!-- Submit Button -->
              <div>
                <button 
                  type="submit" 
                  id="submit-button"
                  class="w-full inline-flex justify-center items-center gap-2 py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-secondary transition-colors"
                >
                  <i data-feather="upload-cloud" class="w-5 h-5"></i>
                  ${this.isLoggedIn ? 'Post Story' : 'Post Story as Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

    const form = document.getElementById('add-story-form');
    const startCameraButton = document.getElementById('start-camera-button');
    const capturePhotoButton = document.getElementById('capture-photo-button');
    const cameraPreview = document.getElementById('camera-preview');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const photoUpload = document.getElementById('photo-upload');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const removePhotoButton = document.getElementById('remove-photo-button');
    const submitButton = document.getElementById('submit-button');
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.getElementById('alert');
    const locationInfo = document.getElementById('location-info');
    const coordinatesDisplay = document.getElementById('coordinates-display');
    const clearLocationButton = document.getElementById('clear-location-button');

    await this.initializeMap();

    const showAlert = (message, isError = false) => {
      alertContainer.classList.remove('hidden');
      alertElement.textContent = message;
      alertElement.className = `p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;

      alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    startCameraButton.addEventListener('click', async () => {
      try {
        await this.stopCamera();

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        cameraPreview.classList.remove('hidden');
        cameraPlaceholder.classList.add('hidden');

        cameraPreview.srcObject = this.mediaStream;
        this.videoElement = cameraPreview;

        capturePhotoButton.disabled = false;

        startCameraButton.innerHTML =
          '<i data-feather="video-off" class="w-4 h-4"></i> Stop Camera';
        feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
      } catch (error) {
        console.error('Error accessing camera:', error);
        showAlert(
          'Cannot access camera. Please check permissions or use file upload instead.',
          true,
        );
      }
    });

    capturePhotoButton.addEventListener('click', () => {
      if (!this.videoElement || !this.mediaStream) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            this.photoFile = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

            const imageUrl = URL.createObjectURL(blob);
            photoPreview.src = imageUrl;
            this.photoPreview = imageUrl;

            photoPreviewContainer.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');

            this.stopCamera();

            startCameraButton.innerHTML =
              '<i data-feather="video" class="w-4 h-4"></i> Start Camera';
            feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
          },
          'image/jpeg',
          0.8,
        );
      } catch (error) {
        console.error('Error capturing photo:', error);
        showAlert('Failed to capture photo. Please try again.', true);
      }
    });

    uploadPlaceholder.addEventListener('click', () => {
      photoUpload.click();
    });

    photoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.match('image.*')) {
        showAlert('Please select an image file.', true);
        return;
      }

      if (file.size > 1024 * 1024) {
        showAlert('Image size exceeds 1MB. Please select a smaller image.', true);
        return;
      }

      this.photoFile = file;

      const imageUrl = URL.createObjectURL(file);
      photoPreview.src = imageUrl;
      this.photoPreview = imageUrl;

      photoPreviewContainer.classList.remove('hidden');
      uploadPlaceholder.classList.add('hidden');
    });

    removePhotoButton.addEventListener('click', () => {
      this.photoFile = null;
      this.photoPreview = null;
      photoPreview.src = '';

      photoPreviewContainer.classList.add('hidden');
      uploadPlaceholder.classList.remove('hidden');

      photoUpload.value = '';
    });

    clearLocationButton.addEventListener('click', () => {
      this.selectedLocation = {
        lat: null,
        lon: null,
      };

      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }

      locationInfo.classList.add('hidden');
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.getElementById('description').value.trim();

      if (!description) {
        showAlert('Please enter a story description.', true);
        return;
      }

      if (!this.photoFile) {
        showAlert('Please upload or capture a photo.', true);
        return;
      }

      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="animate-spin mr-2">⟳</span> Posting...';

      try {
        const storyData = {
          description,
          photo: this.photoFile,
          lat: this.selectedLocation.lat,
          lon: this.selectedLocation.lon,
        };

        const response = this.isLoggedIn
          ? await addStory(storyData)
          : await addStoryAsGuest(storyData);

        if (response.error) {
          showAlert(response.message || 'Failed to submit story. Please try again.', true);
        } else {
          showAlert('Story posted successfully!', false);

          form.reset();
          this.photoFile = null;
          this.photoPreview = null;
          photoPreview.src = '';
          photoPreviewContainer.classList.add('hidden');
          uploadPlaceholder.classList.remove('hidden');

          this.selectedLocation = {
            lat: null,
            lon: null,
          };

          if (this.marker) {
            this.marker.remove();
            this.marker = null;
          }

          locationInfo.classList.add('hidden');

          setTimeout(() => {
            window.location.hash = '#/';
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting story:', error);
        showAlert('An unexpected error occurred. Please try again.', true);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = `<i data-feather="upload-cloud" class="w-5 h-5"></i> ${this.isLoggedIn ? 'Post Story' : 'Post Story as Guest'}`;
        feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
      }
    });

    window.addEventListener('hashchange', () => {
      this.stopCamera();

      if (this.photoPreview) {
        URL.revokeObjectURL(this.photoPreview);
      }
    });
  }

  async initializeMap() {
    this.map = await this.presenter.initializeMap();

    if (this.map) {
      const leafletMap = this.map._map;

      leafletMap.on('click', (e) => {
        const { lat, lng } = e.latlng;

        this.selectedLocation = {
          lat: lat,
          lon: lng,
        };

        const coordinatesDisplay = document.getElementById('coordinates-display');
        const locationInfo = document.getElementById('location-info');

        if (coordinatesDisplay && locationInfo) {
          coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          locationInfo.classList.remove('hidden');
        }

        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng]).addTo(leafletMap);
        }
      });
    }
  }

  fixLeafletIconPaths() {
    this.presenter.fixLeafletIconPaths();
  }

  async stopCamera() {
    if (this.mediaStream) {
      this.presenter.stopCamera(this.mediaStream);
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.classList.add('hidden');

      const cameraPlaceholder = document.getElementById('camera-placeholder');
      if (cameraPlaceholder) {
        cameraPlaceholder.classList.remove('hidden');
      }

      const captureButton = document.getElementById('capture-photo-button');
      if (captureButton) {
        captureButton.disabled = true;
      }
    }
  }
}
