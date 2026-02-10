import userService from './UserService';

class SupportService {
  constructor() {
    this.userService = userService;
  }

  /**
   * Get all support tickets for the current user
   */
  async getMyTickets() {
    try {
      const headers = await userService.getHeaders();
      const url = `${userService.baseUrl}/api/support`;
      
      console.log('[SupportService] Fetching tickets from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('SupportService.getMyTickets error:', error);
      throw error;
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(ticketData) {
    try {
      const headers = await userService.getHeaders();
      const url = `${userService.baseUrl}/api/support`;
      
      console.log('[SupportService] Creating ticket at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(ticketData)
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('SupportService.createTicket error:', error);
      throw error;
    }
  }
}

export const supportService = new SupportService();
