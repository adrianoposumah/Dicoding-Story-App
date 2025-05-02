export default class StoryDescription {
  constructor() {
    this._value = '';
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    this._value = newValue;
  }

  render() {
    return `
      <div>
        <label for="description" class="block text-sm font-medium text-secondary mb-2">
          Description <span class="text-red-500" aria-hidden="true">*</span>
          <span class="sr-only">(required)</span>
        </label>
        <textarea 
          id="description" 
          name="description" 
          rows="4" 
          required
          placeholder="Share your story..." 
          class="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          aria-required="true"
        ></textarea>
      </div>
    `;
  }

  afterRender() {
    const textarea = document.getElementById('description');
    textarea.value = this._value;

    textarea.addEventListener('input', (event) => {
      this._value = event.target.value.trim();
    });

    return textarea;
  }
}
