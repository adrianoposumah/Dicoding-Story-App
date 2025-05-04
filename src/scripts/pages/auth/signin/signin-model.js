import { login } from '../../../data/api';

export default class SignInModel {
  async performLogin(email, password) {
    try {
      const response = await login({ email, password });

      if (response.error) {
        return {
          success: false,
          message: response.message,
        };
      } else {
        const authData = {
          userId: response.loginResult.userId,
          name: response.loginResult.name,
          token: response.loginResult.token,
        };

        this.saveAuthData(authData);

        return {
          success: true,
          message: 'Login successful!',
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'Network error, please try again.',
      };
    }
  }

  saveAuthData(authData) {
    localStorage.setItem('auth', JSON.stringify(authData));
  }
}
