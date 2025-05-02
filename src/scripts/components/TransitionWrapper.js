import { animateEntrance, ANIMATION_TYPES } from '../utils/animation';

class TransitionWrapper extends HTMLElement {
  constructor() {
    super();
    this.animationType = this.getAttribute('animation-type') || ANIMATION_TYPES.FADE;
    this.duration = parseInt(this.getAttribute('duration') || 300, 10);
    this.animated = false;
    this.preserveLoading = this.hasAttribute('preserve-loading');
  }

  connectedCallback() {
    if (!this.animated) {
      const hasLoadingContent = this.querySelector(
        '[role="status"], [aria-busy="true"], .animate-spin',
      );

      if (this.preserveLoading && hasLoadingContent) {
        this.animated = true;
        return;
      }

      this.style.opacity = '0';
      this.style.visibility = 'visible';

      requestAnimationFrame(() => {
        const animation = animateEntrance(this, this.animationType, this.duration);

        if (animation) {
          animation.onfinish = () => {
            this.style.opacity = '';
          };
        }

        this.animated = true;
      });
    }
  }

  disconnectedCallback() {
    this.animated = false;
  }

  static get observedAttributes() {
    return ['animation-type', 'duration', 'preserve-loading'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'animation-type') {
      this.animationType = newValue || ANIMATION_TYPES.FADE;
    } else if (name === 'duration') {
      this.duration = parseInt(newValue || 300, 10);
    } else if (name === 'preserve-loading') {
      this.preserveLoading = this.hasAttribute('preserve-loading');
    }
  }
}

customElements.define('transition-wrapper', TransitionWrapper);
