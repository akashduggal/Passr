import userService from './UserService';

class ChatService {
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
   * Send a message in a chat
   * @param {string} chatId 
   * @param {string} text 
   * @param {string} image - Optional base64 or URL
   */
  async sendMessage(chatId, text, image = null) {
    try {
      const headers = await userService.getHeaders();
      const payload = {
        text,
        image
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
