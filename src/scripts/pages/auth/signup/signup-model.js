import { register } from '../../../data/api';

export default class SignUpModel {
  async performRegistration(name, email, password) {
    try {
      const response = await register({ name, email, password });

      return {
        success: !response.error,
        message:
          response.message || (response.error ? 'Registration failed' : 'Registration successful!'),
      };
    } catch (error) {
      console.error('Error during registration:', error);
      return {
        success: false,
        message: 'Network error, please try again.',
      };
    }
  }
}
