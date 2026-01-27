/**
 * Mock current user. Used to determine buyer vs seller context (e.g. hide "Make an Offer" on own listings).
 */
export const CURRENT_USER_ID = 'user-1';
export const CURRENT_USER_NAME = 'John doe';

const SELLER_NAMES = {
  'user-1': 'John doe',
  'user-2': 'ASU Student',
};

/** Display name for sellerId. Defaults to "ASU Student" when unknown. */
export function getSellerName(sellerId) {
  return (sellerId && SELLER_NAMES[sellerId]) || 'ASU Student';
}
