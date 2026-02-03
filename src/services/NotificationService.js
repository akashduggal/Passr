// Mock notifications – marketplace‑relevant events
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'offer',
    title: 'New offer on your listing',
    body: 'Jane Smith sent an offer of $42.',
    listingTitle: 'Office Desk Chair',
    listingId: '1',
    buyerName: 'Jane Smith',
    productPrice: 50,
    offerAmount: 42,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'offer_accepted',
    title: 'Offer accepted',
    body: 'ASU Student accepted your $70 offer.',
    listingTitle: 'Coffee Table',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New message',
    body: 'John Doe: "I can pick up tomorrow afternoon. Is that okay?"',
    listingTitle: 'Office Desk Chair',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: '4',
    type: 'pickup_scheduled',
    title: 'Pickup scheduled',
    body: 'Jan 26, 2026 at 3:00 PM — Tooker House lobby.',
    listingTitle: 'Coffee Table',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: '5',
    type: 'offer_rejected',
    title: 'Offer declined',
    body: 'Your $38 offer was declined.',
    listingTitle: 'Bookshelf',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

class NotificationService {
  constructor() {
    this.notifications = [...MOCK_NOTIFICATIONS];
  }

  async getNotifications() {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.notifications]);
      }, 500);
    });
  }

  async addNotification(notification) {
    this.notifications.unshift(notification);
    return Promise.resolve(notification);
  }

  async markAsRead(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.notifications = this.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        resolve(true);
      }, 200);
    });
  }

  async markAllAsRead() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        resolve(true);
      }, 200);
    });
  }

  async getUnreadCount() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = this.notifications.filter(n => !n.read).length;
        resolve(count);
      }, 200);
    });
  }
}

export const notificationService = new NotificationService();
