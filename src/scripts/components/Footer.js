class FooterBar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <footer class="bg-secondary shadow-md py-10 mt-10">
        <div class="container mx-auto px-8 flex justify-between items-center">
          <div class="flex flex-col items-center text-center justify-center">
            <a class="text-2xl flex flex-col font-bold items-center text-primary " href="#/">Story App</a>
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
