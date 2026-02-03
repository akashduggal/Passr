import auth from './firebaseAuth';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use localhost for development, can be configured via environment variables
// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':')[0];

  if (!localhost) {
    // If running in a standalone app or simulator without Expo CLI
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
  }

  // If running with Expo CLI, use the host IP
  return `http://${localhost}:3000/api`;
};

const BASE_URL = getBaseUrl();
console.log('UserService initialized with BASE_URL:', BASE_URL);

class UserService {
  /**
   * Helper to get authenticated headers
   */
  async getHeaders() {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Sync user data with backend after Firebase login
   * This is idempotent - handles both registration and login
   * @param {Object} userData - Additional user data to sync (email, displayName, etc)
   */
  async syncUser(userData) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BASE_URL}/users/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('UserService.syncUser error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile from backend
   */
  async getCurrentUser() {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('UserService.getCurrentUser error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - Fields to update (bio, preferences, etc)
   */
  async updateUser(userData) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      // Fallback to mock if backend is unreachable
      if (error.message === 'Network request failed' || error instanceof TypeError) {
        console.warn('Backend unreachable, using mock behavior for updateUser');
        return { ...userData, mock: true };
      }
      console.error('UserService.updateUser error:', error);
      throw error;
    }
  }

  /**
   * Get another user's public profile
   * @param {string} userId - The Firebase UID of the user to fetch
   */
  async getUserProfile(userId) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('UserService.getUserProfile error:', error);
      throw error;
    }
  }

  /**
   * Delete current user account
   */
  async deleteUser() {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'DELETE',
        headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  }

  /**
   * Remove push token from user profile
   * Call this on logout to prevent notifications
   */
  async removePushToken() {
    try {
      console.log('Removing push token...');
      // Set token to null in backend
      await this.updateUser({ expoPushToken: null });
      console.log('Push token removed successfully');
    } catch (error) {
      console.error('Failed to remove push token:', error);
      // Don't throw - we still want to allow logout even if this fails
    }
  }

  /**
   * Helper to handle API responses
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export default new UserService();
