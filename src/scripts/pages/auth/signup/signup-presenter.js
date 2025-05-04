import SignUpModel from './signup-model';

export default class SignUpPresenter {
  constructor(view) {
    this.view = view;
    this.model = new SignUpModel();
  }

  async performRegistration(name, email, password) {
    return await this.model.performRegistration(name, email, password);
  }

  redirectToSignIn() {
    window.location.hash = '#/auth/signin';
  }
}
