import userService from './UserService';

class ListingService {
  constructor() {
    this.userService = userService;
  }

  /**
   * Fetch listings from the backend with pagination, filtering, and sorting
   */
  async getAllListings(page = 1, limit = 10, category = null, sortBy = 'newest') {
    try {
      const headers = await userService.getHeaders();
      let url = `${userService.baseUrl}/api/listings?page=${page}&limit=${limit}&sortBy=${sortBy}&excludeSold=true`;
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.getAllListings error:', error);
      // Fallback to empty array if backend fails, to prevent app crash
      return [];
    }
  }

  /**
   * Get listings for a specific seller
   */
  async getMyListings(sellerId) {
    try {
      const headers = await userService.getHeaders();
      // Don't exclude sold items for my listings
      const url = `${userService.baseUrl}/api/listings?sellerId=${sellerId}&limit=100`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.getMyListings error:', error);
      return [];
    }
  }

  /**
   * Create a new listing
   */
  async addListing(listing) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/listings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(listing)
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.addListing error:', error);
      throw error;
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(updatedListing) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/listings/${updatedListing.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedListing)
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.updateListing error:', error);
      throw error;
    }
  }

  /**
   * Delete a listing
   */
  async deleteListing(id) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/listings/${id}`, {
        method: 'DELETE',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.deleteListing error:', error);
      throw error;
    }
  }
}

export const listingService = new ListingService();
