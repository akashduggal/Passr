import userService from './UserService';
import { supabase } from './supabase';

class ChatService {
  /**
   * Map database message to app model
   * @param {object} dbMessage 
   */
  _mapMessage(dbMessage) {
    if (!dbMessage) return null;
    const {
      chat_id,
      sender_id,
      image_url,
      message_type,
      schedule_data,
      created_at,
      user_data, // If joined
      ...rest
    } = dbMessage;

    return {
      ...rest,
      _id: dbMessage.id,
      id: dbMessage.id,
      text: dbMessage.content,
      chatId: chat_id,
      senderId: sender_id,
      image: image_url,
      type: message_type,
      schedule: schedule_data,
      createdAt: created_at,
      // For GiftedChat or UI, we might need 'user' object. 
      // Since Realtime only gives the row, we might need to construct it 
      // or fetch it. For now, we'll rely on the caller to enrich it if needed,
      // or we can assume the senderId is enough to determine "me" vs "them".
      user: {
          _id: sender_id
      }
    };
  }

  /**
   * Subscribe to new messages for a chat
   * @param {string} chatId 
   * @param {function} onMessage - Callback(message)
   * @returns {object} Subscription object with unsubscribe method
   */
  subscribeToMessages(chatId, onMessage) {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = this._mapMessage(payload.new);
          onMessage(newMessage);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }

  /**
   * Create a new chat or get existing one
   * @param {string} otherUserId - ID of the other user
   * @param {string} listingId - ID of the listing
   * @param {string} offerId - ID of the offer
   */
  async createOrGetChat(otherUserId, listingId, offerId) {
    try {
      const headers = await userService.getHeaders();
      const payload = {
        otherUserId,
        listingId,
        offerId
      };
      
      const response = await fetch(`${userService.baseUrl}/api/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ChatService.createOrGetChat error:', error);
      throw error;
    }
  }

  /**
   * Get all chats for current user
   */
  async getChats() {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/chats`, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ChatService.getChats error:', error);
      return [];
    }
  }

  /**
   * Get messages for a specific chat
   * @param {string} chatId 
   */
  async getMessages(chatId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/chats/${chatId}/messages`, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ChatService.getMessages error:', error);
      return [];
    }
  }

  /**
   * Update user presence in chat
   * @param {string|null} activeChatId 
   */
  async updatePresence(activeChatId) {
    try {
      const headers = await userService.getHeaders();
      await fetch(`${userService.baseUrl}/api/chats/presence`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ activeChatId })
      });
    } catch (error) {
      console.error('ChatService.updatePresence error:', error);
    }
  }

  /**
   * Send a message
   * @param {string} chatId 
   * @param {string} text 
   * @param {string} image - Optional base64 or URL
   * @param {string} type - Optional 'text' or 'schedule'
   * @param {object} schedule - Optional schedule object { date, location }
   */
  async sendMessage(chatId, text, image = null, type = 'text', schedule = null) {
    try {
      const headers = await userService.getHeaders();
      const payload = {
        text,
        image,
        type,
        schedule
      };
      
      const response = await fetch(`${userService.baseUrl}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ChatService.sendMessage error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
