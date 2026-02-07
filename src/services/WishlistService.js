import userService from './UserService';

class WishlistService {
  constructor() {
    this.userService = userService;
  }

  async getWishlist() {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/wishlist`, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('WishlistService.getWishlist error:', error);
      return [];
    }
  }

  async addToWishlist(listingId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/wishlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ listingId })
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('WishlistService.addToWishlist error:', error);
      throw error;
    }
  }

  async removeFromWishlist(listingId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/wishlist/${listingId}`, {
        method: 'DELETE',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('WishlistService.removeFromWishlist error:', error);
      throw error;
    }
  }

  async checkWishlistStatus(listingId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/wishlist/check/${listingId}`, {
        method: 'GET',
        headers
      });
      
      const data = await userService.handleResponse(response);
      return data.isInWishlist;
    } catch (error) {
      console.error('WishlistService.checkWishlistStatus error:', error);
      return false;
    }
  }
}

export default new WishlistService();
