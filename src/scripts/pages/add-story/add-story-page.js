import { addStory, addStoryAsGuest } from '../../data/api';
import Map from '../../utils/map';
import feather from 'feather-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class AddStoryPage {
  constructor() {
    this.isLoggedIn = localStorage.getItem('auth') !== null;
    this.user = this.isLoggedIn ? JSON.parse(localStorage.getItem('auth')) : null;
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
    // Initialize feather icons
    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

    // Get DOM elements
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

    // Initialize map
    await this.initializeMap();

    // Method to show alert messages
    const showAlert = (message, isError = false) => {
      alertContainer.classList.remove('hidden');
      alertElement.textContent = message;
      alertElement.className = `p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;

      // Scroll to alert
      alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Start camera
    startCameraButton.addEventListener('click', async () => {
      try {
        // Stop any existing stream first
        await this.stopCamera();

        // Get camera stream
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // Show video element and hide placeholder
        cameraPreview.classList.remove('hidden');
        cameraPlaceholder.classList.add('hidden');

        // Set stream to video element
        cameraPreview.srcObject = this.mediaStream;
        this.videoElement = cameraPreview;

        // Enable capture button
        capturePhotoButton.disabled = false;

        // Change button text
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

    // Capture photo from camera
    capturePhotoButton.addEventListener('click', () => {
      if (!this.videoElement || !this.mediaStream) return;

      try {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        const ctx = canvas.getContext('2d');

        // Draw video frame to canvas
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            this.photoFile = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

            // Display the captured photo
            const imageUrl = URL.createObjectURL(blob);
            photoPreview.src = imageUrl;
            this.photoPreview = imageUrl;

            // Show preview and hide upload placeholder
            photoPreviewContainer.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');

            // Stop the camera after capturing
            this.stopCamera();

            // Reset camera button
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

    // Handle file upload
    uploadPlaceholder.addEventListener('click', () => {
      photoUpload.click();
    });

    photoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Check file type
      if (!file.type.match('image.*')) {
        showAlert('Please select an image file.', true);
        return;
      }

      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        showAlert('Image size exceeds 1MB. Please select a smaller image.', true);
        return;
      }

      this.photoFile = file;

      // Display the selected image
      const imageUrl = URL.createObjectURL(file);
      photoPreview.src = imageUrl;
      this.photoPreview = imageUrl;

      // Show preview and hide upload placeholder
      photoPreviewContainer.classList.remove('hidden');
      uploadPlaceholder.classList.add('hidden');
    });

    // Remove photo button
    removePhotoButton.addEventListener('click', () => {
      // Clear photo data
      this.photoFile = null;
      this.photoPreview = null;
      photoPreview.src = '';

      // Hide preview and show upload placeholder
      photoPreviewContainer.classList.add('hidden');
      uploadPlaceholder.classList.remove('hidden');

      // Reset file input
      photoUpload.value = '';
    });

    // Clear location button
    clearLocationButton.addEventListener('click', () => {
      // Clear location data
      this.selectedLocation = {
        lat: null,
        lon: null,
      };

      // Remove marker
      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }

      // Update UI
      locationInfo.classList.add('hidden');
    });

    // Form submission
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.getElementById('description').value.trim();

      // Validation
      if (!description) {
        showAlert('Please enter a story description.', true);
        return;
      }

      if (!this.photoFile) {
        showAlert('Please upload or capture a photo.', true);
        return;
      }

      // Disable submit button and show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="animate-spin mr-2">⟳</span> Posting...';

      try {
        // Prepare data
        const storyData = {
          description,
          photo: this.photoFile,
          lat: this.selectedLocation.lat,
          lon: this.selectedLocation.lon,
        };

        // Submit based on authentication status
        const response = this.isLoggedIn
          ? await addStory(storyData)
          : await addStoryAsGuest(storyData);

        if (response.error) {
          showAlert(response.message || 'Failed to submit story. Please try again.', true);
        } else {
          showAlert('Story posted successfully!', false);

          // Clear form
          form.reset();
          this.photoFile = null;
          this.photoPreview = null;
          photoPreview.src = '';
          photoPreviewContainer.classList.add('hidden');
          uploadPlaceholder.classList.remove('hidden');

          // Clear location
          this.selectedLocation = {
            lat: null,
            lon: null,
          };

          if (this.marker) {
            this.marker.remove();
            this.marker = null;
          }

          locationInfo.classList.add('hidden');

          // Redirect after a delay
          setTimeout(() => {
            window.location.hash = '#/';
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting story:', error);
        showAlert('An unexpected error occurred. Please try again.', true);
      } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = `<i data-feather="upload-cloud" class="w-5 h-5"></i> ${this.isLoggedIn ? 'Post Story' : 'Post Story as Guest'}`;
        feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });
      }
    });

    // Cleanup on page navigation
    window.addEventListener('hashchange', () => {
      this.stopCamera();

      // Clean up preview URLs
      if (this.photoPreview) {
        URL.revokeObjectURL(this.photoPreview);
      }
    });
  }

  async initializeMap() {
    try {
      // Fix Leaflet icon paths
      this.fixLeafletIconPaths();

      // Initialize map centered on user location or default
      this.map = await Map.build('#map', {
        locate: true,
        zoom: 13,
      });

      // Get the Leaflet map instance from our Map class
      const leafletMap = this.map._map;

      // Add click event to map
      leafletMap.on('click', (e) => {
        // Get coordinates
        const { lat, lng } = e.latlng;

        // Update selected location
        this.selectedLocation = {
          lat: lat,
          lon: lng,
        };

        // Update UI
        const coordinatesDisplay = document.getElementById('coordinates-display');
        const locationInfo = document.getElementById('location-info');

        if (coordinatesDisplay && locationInfo) {
          coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          locationInfo.classList.remove('hidden');
        }

        // Add or update marker
        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng]).addTo(leafletMap);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  fixLeafletIconPaths() {
    // Fix the Leaflet icon paths that might be broken due to webpack bundling
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }

  async stopCamera() {
    // Stop the camera stream if it exists
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Reset video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.classList.add('hidden');

      // Show placeholder
      const cameraPlaceholder = document.getElementById('camera-placeholder');
      if (cameraPlaceholder) {
        cameraPlaceholder.classList.remove('hidden');
      }

      // Disable capture button
      const captureButton = document.getElementById('capture-photo-button');
      if (captureButton) {
        captureButton.disabled = true;
      }
    }
  }
}
