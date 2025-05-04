class FooterBar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <footer class="bg-secondary shadow-md py-10 mt-10" role="contentinfo">
        <div class="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex flex-col items-center text-center justify-center">
            <h1 class="text-2xl flex flex-col font-bold items-center text-primary">Story App</h1>
          </div>
          <div class="text-sm text-white justify-between flex items-center">
            &copy; ${new Date().getFullYear()} Story App. All rights reserved.
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('footer-bar', FooterBar);
