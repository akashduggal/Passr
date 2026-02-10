import auth from './firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = 'api_base_url';
const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL || 'https://passr-dev-akash-v3.loca.lt';

class NotificationService {
  constructor() {
    this._baseUrl = DEFAULT_URL;
    this.init();
  }

  async init() {
    try {
      const storedUrl = await AsyncStorage.getItem(API_URL_KEY);
      if (storedUrl) {
        this._baseUrl = storedUrl;
      }
    } catch (e) {
      console.error('Failed to load API URL', e);
    }
  }

  get baseUrl() {
    return this._baseUrl;
  }

  async getHeaders() {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Bypass-Tunnel-Reminder': 'true',
    };
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return null;
    }
    
    let errorMessage = `Request failed with status ${response.status}`;
    try {
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
            errorMessage = await response.text();
        }
    } catch (e) {
        // Fallback to default message
    }
    throw new Error(errorMessage);
  }

  async getNotifications() {
     try {
       const headers = await this.getHeaders();
       const response = await fetch(`${this.baseUrl}/api/notifications`, {
         method: 'GET',
         headers,
       });
       const data = await this.handleResponse(response);
       if (Array.isArray(data)) {
         return data.map(n => ({
           ...n,
           ...(n.data || {}),
           createdAt: n.created_at || n.createdAt,
           recipientId: n.recipient_id || n.recipientId,
         }));
       }
       return [];
     } catch (error) {
       console.error('NotificationService.getNotifications error:', error);
       return [];
     }
   }

  async markAsRead(id) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('NotificationService.markAsRead error:', error);
      throw error;
    }
  }

  async deleteNotification(id) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/notifications/${id}`, {
        method: 'DELETE',
        headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('NotificationService.deleteNotification error:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/notifications/read-all`, {
        method: 'PATCH',
        headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('NotificationService.markAllAsRead error:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      return 0;
    }
  }

  // Helper to add locally if needed (though backend persists it)
  async addNotification(notification) {
    return Promise.resolve(notification);
  }
}

export const notificationService = new NotificationService();
