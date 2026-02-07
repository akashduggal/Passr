import userService from './UserService';

class ListingService {
  constructor() {
    this.userService = userService;
  }

  /**
   * Fetch listings from the backend with pagination, filtering, and sorting
   */
  async getAllListings(page = 1, limit = 10, category = null, sortBy = 'newest', searchQuery = '') {
    try {
      const headers = await userService.getHeaders();
      let url = `${userService.baseUrl}/api/listings?page=${page}&limit=${limit}&sortBy=${sortBy}&excludeSold=true`;
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
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
   * Manually expire a listing (Test Only)
   */
  async expireListing(id) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/listings/${id}/expire`, {
        method: 'PATCH',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.expireListing error:', error);
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

  /**
   * Get a presigned URL for uploading an image
   * @param {string} fileType - MIME type of the file (e.g., 'image/jpeg')
   */
  async getPresignedUrl(fileType) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/upload/presigned-url`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fileType, folder: 'listings' })
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('ListingService.getPresignedUrl error:', error);
      throw error;
    }
  }

  /**
   * Upload an image to S3 using a presigned URL
   * @param {string} uri - Local file URI
   * @param {string} presignedUrl - URL to upload to
   * @param {string} fileType - MIME type
   */
  async uploadImageToS3(uri, presignedUrl, fileType) {
    try {
      // Fetch the file from the local URI to get a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': fileType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 Upload failed with status ${uploadResponse.status}`);
      }

      return true;
    } catch (error) {
      console.error('ListingService.uploadImageToS3 error:', error);
      throw error;
    }
  }
}

export const listingService = new ListingService();
