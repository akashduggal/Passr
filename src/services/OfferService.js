import userService from './UserService';

class OfferService {
  async makeOffer(offerData) {
    try {
      const headers = await userService.getHeaders();
      const user = await userService.getCurrentUser();
      
      const payload = {
        ...offerData,
        buyerName: user.name || 'Anonymous',
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch(`${userService.baseUrl}/api/offers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('OfferService.makeOffer error:', error);
      throw error;
    }
  }

  async getMyOffers() {
    try {
      const headers = await userService.getHeaders();
      // "My Offers" means offers I made as a buyer
      const response = await fetch(`${userService.baseUrl}/api/offers/my-offers`, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('OfferService.getMyOffers error:', error);
      return [];
    }
  }

  async getOfferById(offerId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/offers/${offerId}`, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('OfferService.getOfferById error:', error);
      return null;
    }
  }

  async getOffersForListing(listingId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/offers/listing/${listingId}`, {
        method: 'GET',
        headers
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('OfferService.getOffersForListing error:', error);
      return [];
    }
  }

  /**
   * Accept an offer
   */
  async acceptOffer(offerId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/offers/${offerId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'accepted' })
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('OfferService.acceptOffer error:', error);
      throw error;
    }
  }

  /**
   * Reject an offer
   */
  async rejectOffer(offerId) {
    try {
      const headers = await userService.getHeaders();
      const response = await fetch(`${userService.baseUrl}/api/offers/${offerId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'rejected' })
      });
      
      return await userService.handleResponse(response);
    } catch (error) {
      console.error('OfferService.rejectOffer error:', error);
      throw error;
    }
  }
}

export const offerService = new OfferService();
