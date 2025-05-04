import SignInModel from './signin-model';

export default class SignInPresenter {
  constructor(view) {
    this.view = view;
    this.model = new SignInModel();
  }

  async performLogin(email, password) {
    return await this.model.performLogin(email, password);
  }

  redirectToHome() {
    window.location.hash = '#/';
    window.location.reload();
  }
}
