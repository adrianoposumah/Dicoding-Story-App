import feather from 'feather-icons';

export default class PhotoUpload {
  constructor() {
    this.photoFile = null;
    this.photoPreview = null;
    this.mediaStream = null;
    this.videoElement = null;
    this.onPhotoSelected = null;
  }

  render() {
    return `
      <fieldset class="space-y-4">
        <legend class="block text-sm font-medium text-secondary mb-2">
          Photo <span class="text-red-500" aria-hidden="true">*</span>
          <span class="sr-only">(required)</span>
        </legend>
        
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
                aria-label="Camera video preview"
              ></video>
              <div 
                id="camera-placeholder" 
                class="w-full h-52 flex items-center justify-center"
                aria-label="Camera preview placeholder"
              >
                <p class="text-gray-500 text-center">Camera preview will appear here</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button 
                type="button" 
                id="start-camera-button"
                class="flex-1 inline-flex justify-center items-center gap-2 py-2 px-4 bg-secondary text-white text-sm rounded-md hover:bg-secondary/80 transition-colors"
                aria-label="Start or stop camera"
              >
                <i data-feather="video" class="w-4 h-4" aria-hidden="true"></i> Start Camera
              </button>
              <button 
                type="button" 
                id="capture-photo-button"
                class="flex-1 inline-flex justify-center items-center gap-2 py-2 px-4 bg-primary text-white text-sm rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
                aria-label="Capture photo from camera"
              >
                <i data-feather="camera" class="w-4 h-4" aria-hidden="true"></i> Capture
              </button>
            </div>
          </div>
          
          <!-- File Upload or Preview -->
          <div class="w-full md:w-1/2 space-y-3">
            <div 
              id="photo-preview-container" 
              class="hidden bg-gray-100 rounded-lg overflow-hidden h-52 relative"
              aria-live="polite"
            >
              <img 
                id="photo-preview" 
                src="#" 
                alt="Your selected photo preview" 
                class="w-full h-full object-cover"
              >
              <button 
                type="button" 
                id="remove-photo-button"
                class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove selected photo"
              >
                <i data-feather="x" class="w-4 h-4" aria-hidden="true"></i>
              </button>
            </div>
            <div 
              id="upload-placeholder" 
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 h-52 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
              role="button"
              tabindex="0"
              aria-label="Click to upload a photo from your device"
              aria-controls="photo-upload"
            >
              <i data-feather="upload" class="w-8 h-8 text-gray-400 mb-2" aria-hidden="true"></i>
              <p class="text-sm text-gray-500 text-center">Click to upload or drag and drop</p>
              <p class="text-xs text-gray-400 mt-1">Max 1MB, JPEG, PNG</p>
              <input 
                type="file" 
                id="photo-upload" 
                name="photo" 
                accept="image/*" 
                class="hidden"
                aria-label="Upload photo"
              >
            </div>
          </div>
        </div>
      </fieldset>
    `;
  }

  afterRender(showAlert) {
    feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

    const startCameraButton = document.getElementById('start-camera-button');
    const capturePhotoButton = document.getElementById('capture-photo-button');
    const cameraPreview = document.getElementById('camera-preview');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const photoUpload = document.getElementById('photo-upload');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const removePhotoButton = document.getElementById('remove-photo-button');

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
        capturePhotoButton.setAttribute('aria-disabled', 'false');

        startCameraButton.innerHTML =
          '<i data-feather="video-off" class="w-4 h-4" aria-hidden="true"></i> Stop Camera';
        startCameraButton.setAttribute('aria-label', 'Stop camera');
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
              '<i data-feather="video" class="w-4 h-4" aria-hidden="true"></i> Start Camera';
            startCameraButton.setAttribute('aria-label', 'Start camera');
            feather.replace({ 'class': 'feather-icon', 'stroke-width': 2 });

            if (this.onPhotoSelected) this.onPhotoSelected(this.photoFile);
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

    // Also make it keyboard accessible
    uploadPlaceholder.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        photoUpload.click();
      }
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

      if (this.onPhotoSelected) this.onPhotoSelected(this.photoFile);
    });

    removePhotoButton.addEventListener('click', () => {
      this.photoFile = null;
      this.photoPreview = null;
      photoPreview.src = '';

      photoPreviewContainer.classList.add('hidden');
      uploadPlaceholder.classList.remove('hidden');

      photoUpload.value = '';

      if (this.onPhotoSelected) this.onPhotoSelected(null);
    });
  }

  async stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
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
        captureButton.setAttribute('aria-disabled', 'true');
      }
    }
  }

  cleanup() {
    this.stopCamera();
    if (this.photoPreview) {
      URL.revokeObjectURL(this.photoPreview);
    }
  }

  reset() {
    this.photoFile = null;
    this.photoPreview = null;

    const photoPreview = document.getElementById('photo-preview');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const photoUpload = document.getElementById('photo-upload');

    if (photoPreview) photoPreview.src = '';
    if (photoPreviewContainer) photoPreviewContainer.classList.add('hidden');
    if (uploadPlaceholder) uploadPlaceholder.classList.remove('hidden');
    if (photoUpload) photoUpload.value = '';
  }
}
