import auth from './firebaseAuth';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = 'api_base_url';

// Default URL
const DEFAULT_URL = 'https://passr-dev-akash-v3.loca.lt';

class UserService {
  constructor() {
    this._baseUrl = DEFAULT_URL;
    this.init();
  }

  async init() {
    try {
      const storedUrl = await AsyncStorage.getItem(API_URL_KEY);
      if (storedUrl) {
        this._baseUrl = storedUrl;
        console.log('Restored API URL:', this._baseUrl);
      }
    } catch (e) {
      console.error('Failed to load API URL', e);
    }
  }

  get baseUrl() {
    return this._baseUrl;
  }

  async setBaseUrl(url) {
    // Remove trailing slash if present
    const cleanUrl = url.replace(/\/$/, '');
    this._baseUrl = cleanUrl;
    try {
      await AsyncStorage.setItem(API_URL_KEY, cleanUrl);
      console.log('Saved new API URL:', cleanUrl);
    } catch (e) {
      console.error('Failed to save API URL', e);
    }
  }

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
      'Bypass-Tunnel-Reminder': 'true', // Required for localtunnel
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
      const response = await fetch(`${this.baseUrl}/api/users/sync`, {
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
      const response = await fetch(`${this.baseUrl}/api/users/me`, {
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
      const response = await fetch(`${this.baseUrl}/api/users/me`, {
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
      const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
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
      const response = await fetch(`${this.baseUrl}/api/users/me`, {
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
      const user = auth().currentUser;
      if (!user) {
        console.log('User already logged out, skipping token removal');
        return;
      }
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
