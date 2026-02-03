import { ENABLE_TICKETS } from '../constants/featureFlags';

// Helper to create dates relative to today
const getDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const BASE_PRODUCTS = [
  // Furniture — 1,2 current user
  { id: 1, sellerId: 'user-1', category: 'Furniture', brand: 'IKEA', title: 'Office Desk Chair', price: 45, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), sold: true, description: 'Comfortable ergonomic office chair in excellent condition. Perfect for studying or working from home. Adjustable height and back support.', images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80'] },
  { id: 2, sellerId: 'user-1', category: 'Furniture', brand: 'Wayfair', title: 'Coffee Table', price: 80, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), urgent: true, description: 'Modern coffee table with storage shelf. Some minor scratches but overall in good condition. Great for dorm or apartment.', images: ['https://i.etsystatic.com/27345902/r/il/b3617d/3499677642/il_1588xN.3499677642_j8nk.jpg'] },
  { id: 3, sellerId: 'user-2', category: 'Furniture', brand: 'Target', title: 'Bookshelf', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(2), description: '5-shelf wooden bookshelf. Shows some wear but still functional. Perfect for organizing textbooks and supplies.', images: ['https://i.etsystatic.com/12885773/r/il/d151fd/2966519585/il_570xN.2966519585_30f1.jpg'] },
  { id: 4, sellerId: 'user-2', category: 'Furniture', brand: 'West Elm', title: 'Dining Table Set', price: 120, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(5), description: 'Complete dining table with 4 chairs. Barely used, in excellent condition. Perfect for shared living spaces.', images: ['https://stevesilver.com/wp-content/uploads/2022/11/SteveSilverFurniture_Napa_NP500-D5PC-S_LS1.jpg'] },
  { id: 5, sellerId: 'user-2', category: 'Furniture', brand: 'Other', title: 'Study Lamp', price: 15, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(7), urgent: true, description: 'Adjustable desk lamp with LED lighting. Great for late-night study sessions.', images: ['https://static.truemed.com/product_images/twilight-red-light-sleep-lamp/a1b2831b-a73e-42b8-a774-35ef1412ab0b.jpg'] },
  { id: 6, sellerId: 'user-2', category: 'Furniture', brand: 'IKEA', title: 'Desk Organizer', price: 20, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(14), description: 'Brand new desk organizer with multiple compartments. Keep your workspace tidy and organized.', images: ['https://m.media-amazon.com/images/S/al-na-9d5791cf-3faf/16c27b48-8225-429f-9d50-818bbc2ed798._CR0%2C0%2C1500%2C1500_.jpg'] },
  { id: 101, sellerId: 'user-3', category: 'Furniture', brand: 'IKEA', title: 'Kallax Shelf Unit', price: 60, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(1), description: 'White 4x4 Kallax shelf unit. Some scratches on the side.', images: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80'] },
  { id: 102, sellerId: 'user-3', category: 'Furniture', brand: 'Target', title: 'Bean Bag Chair', price: 25, condition: 'Like New', location: 'West Campus', livingCommunity: 'Casa de Oro', postedAt: getDate(2), description: 'Large grey bean bag chair. Very comfortable.', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'] },
  { id: 103, sellerId: 'user-4', category: 'Furniture', brand: 'Amazon', title: 'Bed Frame Queen', price: 90, condition: 'Fair', location: 'Polytechnic', livingCommunity: 'Century Hall', postedAt: getDate(3), description: 'Metal bed frame, queen size. Easy to assemble.', images: ['https://images.unsplash.com/photo-1505693416388-b0346efee539?auto=format&fit=crop&w=800&q=80'] },
  { id: 104, sellerId: 'user-4', category: 'Furniture', brand: 'IKEA', title: 'Malm Dresser', price: 70, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'University House', postedAt: getDate(4), description: '3-drawer dresser in black-brown. Fully functional.', images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'] },
  { id: 105, sellerId: 'user-5', category: 'Furniture', brand: 'Wayfair', title: 'Nightstand', price: 30, condition: 'Like New', location: 'Downtown Phoenix', livingCommunity: 'Taylor Place', postedAt: getDate(5), description: 'Small wooden nightstand with one drawer.', images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80'] },
  { id: 106, sellerId: 'user-5', category: 'Furniture', brand: 'Other', title: 'Floor Mirror', price: 40, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Vista del Sol', postedAt: getDate(6), description: 'Full length floor mirror. Black frame.', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80'] },
  { id: 107, sellerId: 'user-3', category: 'Furniture', brand: 'IKEA', title: 'Poang Chair', price: 50, condition: 'Good', location: 'Tempe Campus', livingCommunity: '922 Place', postedAt: getDate(7), description: 'Classic IKEA Poang chair with beige cushion.', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'] },
  { id: 108, sellerId: 'user-4', category: 'Furniture', brand: 'Walmart', title: 'TV Stand', price: 35, condition: 'Fair', location: 'West Campus', livingCommunity: 'Las Casas', postedAt: getDate(8), description: 'Simple TV stand for up to 50 inch TV.', images: ['https://images.unsplash.com/photo-1601760562234-9814eea66632?auto=format&fit=crop&w=800&q=80'] },
  { id: 109, sellerId: 'user-5', category: 'Furniture', brand: 'Target', title: 'Floor Lamp', price: 20, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Adelphi Commons', postedAt: getDate(9), description: 'Silver floor lamp with reading light.', images: ['https://images.unsplash.com/photo-1513506003011-3b03c8a35918?auto=format&fit=crop&w=800&q=80'] },
  { id: 110, sellerId: 'user-3', category: 'Furniture', brand: 'Other', title: 'Shoe Rack', price: 15, condition: 'Good', location: 'Polytechnic', livingCommunity: 'Falcon Hall', postedAt: getDate(10), description: 'Bamboo shoe rack, holds 8 pairs.', images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80'] },
  { id: 111, sellerId: 'user-4', category: 'Furniture', brand: 'IKEA', title: 'Lack Side Table', price: 10, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'Hassayampa', postedAt: getDate(11), description: 'White side table. Has some coffee rings.', images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80'] },
  { id: 112, sellerId: 'user-5', category: 'Furniture', brand: 'Amazon', title: 'Gaming Chair', price: 85, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Gordon Commons', postedAt: getDate(12), description: 'Red and black gaming chair. Very ergonomic.', images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80'] },
  { id: 113, sellerId: 'user-3', category: 'Furniture', brand: 'Wayfair', title: 'Area Rug', price: 45, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Barrett', postedAt: getDate(13), description: '5x7 grey area rug. Recently cleaned.', images: ['https://images.unsplash.com/photo-1575414723300-0d0ae4710265?auto=format&fit=crop&w=800&q=80'] },
  { id: 114, sellerId: 'user-4', category: 'Furniture', brand: 'Other', title: 'Bar Stools (2)', price: 55, condition: 'Good', location: 'West Campus', livingCommunity: 'Verde', postedAt: getDate(14), description: 'Set of 2 counter height bar stools.', images: ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'] },
  { id: 115, sellerId: 'user-5', category: 'Furniture', brand: 'IKEA', title: 'Futon', price: 100, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'Villas at Vista', postedAt: getDate(15), description: 'Grey futon sofa bed. Comfortable for guests.', images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'] },
  // Electronics — 7 current user
  { id: 7, sellerId: 'user-1', category: 'Electronics', brand: 'Apple', title: 'MacBook Pro 13"', price: 850, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(0), sold: true, description: '2020 MacBook Pro 13" with M1 chip. Excellent condition, barely used. Includes charger and original box. Perfect for students.', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80'] },
  { id: 8, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'iPhone 13', price: 450, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), description: 'iPhone 13 in good working condition. Minor scratches on screen protector. Battery health at 87%. Includes charger.', images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'] },
  { id: 9, sellerId: 'user-2', category: 'Electronics', brand: 'Samsung', title: 'Samsung Monitor 27"', price: 180, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(3), description: '27" Samsung 4K monitor. Excellent for coding, design work, or gaming. Like new condition with original packaging.', images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'] },
  { id: 10, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'AirPods Pro', price: 120, condition: 'New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(8), urgent: true, description: 'Brand new AirPods Pro, still sealed in box. Perfect for studying or commuting around campus.', images: ['https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80'] },
  { id: 11, sellerId: 'user-2', category: 'Electronics', brand: 'Other', title: 'Gaming Keyboard', price: 65, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(15), description: 'Mechanical gaming keyboard with RGB lighting. Great for gaming or coding. Some keycaps show light wear.', images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'] },
  { id: 12, sellerId: 'user-2', category: 'Electronics', brand: 'Dell', title: 'Wireless Mouse', price: 25, condition: 'Fair', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(21), description: 'Wireless mouse in working condition. Some cosmetic wear but fully functional. Great for laptops.', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'] },
  // Escooters
  { id: 13, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi Mi Electric Scooter', price: 350, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Xiaomi Mi Electric Scooter in excellent condition. Perfect for getting around campus quickly. Max speed 15.5 mph, 18.6 mile range.', images: ['https://bloximages.chicago2.vip.townnews.com/tucson.com/content/tncms/assets/v3/editorial/c/81/c815e58d-3b6c-5ca2-b7ff-d016b5af231a/5bd393cb35943.image.jpg?resize=1200%2C767'] },
  { id: 14, sellerId: 'user-2', category: 'Escooters', brand: 'Segway', title: 'Segway Ninebot E25', price: 420, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'The Villas on Apache', postedAt: getDate(1), description: 'Segway Ninebot E25 electric scooter. Great condition with some minor scuffs. Reliable transportation for campus.', images: ['https://snworksceo.imgix.net/asp/7abce7f6-9717-4964-83b5-49427ec092b3.sized-1000x1000.jpg?w=800&dpr=2&ar=16%3A9&fit=crop&crop=faces'] },
  { id: 15, sellerId: 'user-2', category: 'Escooters', brand: 'Razor', title: 'Razor E300', price: 180, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(4), description: 'Razor E300 electric scooter. Shows some wear but runs well. Good starter scooter for campus commuting.', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTJnn2ROeyQ1OwSO8LicpgK6dkDlGLFZBKug&s'] },
  { id: 16, sellerId: 'user-2', category: 'Escooters', brand: 'Gotrax', title: 'Gotrax GXL V2', price: 280, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(9), description: 'Gotrax GXL V2 in like-new condition. Powerful motor, good battery life. Perfect for longer commutes.', images: ['https://gotrax.com/cdn/shop/files/g4-electric-scooter-399416.jpg?v=1767202135&width=1200'] },
  { id: 17, sellerId: 'user-2', category: 'Escooters', brand: 'Hiboy', title: 'Hiboy S2 Pro', price: 320, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(16), description: 'Brand new Hiboy S2 Pro electric scooter. Never used, still in original packaging. Great deal!', images: ['https://gotrax.com/cdn/shop/files/g4-electric-scooter-399416.jpg?v=1767202135&width=1200'] },
  { id: 18, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi M365', price: 250, condition: 'Good', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(30), description: 'Xiaomi M365 electric scooter in good working condition. Reliable and efficient for daily campus use.', images: ['https://gotrax.com/cdn/shop/files/g4-electric-scooter-399416.jpg?v=1767202135&width=1200'] },
  // Kitchen
  { id: 19, sellerId: 'user-2', category: 'Kitchen', brand: 'Instant Pot', title: 'Instant Pot Duo', price: 80, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Instant Pot Duo 6-quart pressure cooker. Barely used, in excellent condition. Perfect for dorm cooking.', images: ['https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=800&q=80'] },
  { id: 20, sellerId: 'user-2', category: 'Kitchen', brand: 'KitchenAid', title: 'KitchenAid Stand Mixer', price: 200, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), description: 'KitchenAid stand mixer in good condition. Works perfectly, some cosmetic wear. Great for baking enthusiasts.', images: ['https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=800&q=80'] },
  { id: 21, sellerId: 'user-2', category: 'Kitchen', brand: 'Hamilton Beach', title: 'Coffee Maker', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(6), description: 'Basic coffee maker in working condition. Perfect for morning coffee before class. Shows some wear but functional.', images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'] },
  { id: 22, sellerId: 'user-2', category: 'Kitchen', brand: 'Ninja', title: 'Air Fryer', price: 60, condition: 'Like New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(10), description: 'Air fryer in like-new condition. Healthy cooking option for dorm or apartment. Barely used.', images: ['https://images.unsplash.com/photo-1626135805563-329432f83134?auto=format&fit=crop&w=800&q=80'] },
  { id: 23, sellerId: 'user-2', category: 'Kitchen', brand: 'Cuisinart', title: 'Blender', price: 40, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(18), description: 'Blender in good working condition. Perfect for smoothies and shakes. Some cosmetic wear but fully functional.', images: ['https://images.unsplash.com/photo-1570222094114-28a9d88a2b64?auto=format&fit=crop&w=800&q=80'] },
  { id: 24, sellerId: 'user-2', category: 'Kitchen', brand: 'Other', title: 'Cutting Board Set', price: 25, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(60), description: 'Brand new cutting board set with multiple sizes. Never used, still in packaging. Essential kitchen accessory.', images: ['https://images.unsplash.com/photo-1530914442223-38933400a406?auto=format&fit=crop&w=800&q=80'] },
];


const TICKET_PRODUCTS = [
  { id: 25, sellerId: 'user-1', category: 'Tickets', brand: 'Concert', title: 'Taylor Swift – Eras Tour', price: 185, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), eventDate: 'Sat, Mar 15 · 7:00 PM', venue: 'State Farm Stadium, Glendale', description: '2 GA floor tickets for Eras Tour. Can’t make it anymore. Face value. Transfer via Ticketmaster.', images: ['https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80'] },
  { id: 26, sellerId: 'user-2', category: 'Tickets', brand: 'Music Festival', title: 'INnings Festival 2-Day Pass', price: 120, condition: 'New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(1), eventDate: 'Feb 28–Mar 1', venue: 'Tempe Beach Park', description: 'Selling one 2-day GA pass. Price negotiable. Meet on campus for handoff.', images: ['https://images.unsplash.com/photo-1459749411177-0473ef7161a9?auto=format&fit=crop&w=800&q=80'] },
  { id: 27, sellerId: 'user-2', category: 'Tickets', brand: 'Stand-up Comedy', title: 'John Mulaney – Phoenix', price: 75, condition: 'New', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), eventDate: 'Fri, Apr 4 · 8:00 PM', venue: 'Arizona Financial Theatre', description: 'Single ticket, lower bowl. Selling at face. E-transfer or Venmo.', images: ['https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80'] },
  { id: 28, sellerId: 'user-2', category: 'Tickets', brand: 'Sports', title: 'Suns vs Lakers – 2 Tickets', price: 95, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(3), eventDate: 'Sun, Mar 9 · 6:00 PM', venue: 'Footprint Center, Phoenix', description: 'Pair of upper bowl tickets. Great view. Digital transfer.', images: ['https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80'] },
  { id: 29, sellerId: 'user-2', category: 'Tickets', brand: 'Theater', title: 'Hamilton – Gammage', price: 110, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(5), eventDate: 'Sat, May 10 · 2:00 PM', venue: 'ASU Gammage', description: 'One orchestra seat. Must-see show. DM to coordinate.', images: ['https://images.unsplash.com/photo-1503095392237-7362402049e5?auto=format&fit=crop&w=800&q=80'] },
];

const INITIAL_DATA = ENABLE_TICKETS ? [...BASE_PRODUCTS, ...TICKET_PRODUCTS] : BASE_PRODUCTS;

class ListingService {
  constructor() {
    this.listings = [...INITIAL_DATA];
  }

  getAllListings(page = 1, limit = 10, category = null, sortBy = 'newest') {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        let filtered = [...this.listings];

        // Filter by category if provided
        if (category) {
          filtered = filtered.filter(p => p.category === category);
        }

        // Filter out sold items (mimicking Dashboard logic)
        filtered = filtered.filter(p => !p.sold);

        // Sort
        switch (sortBy) {
          case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
          default:
            filtered.sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
            break;
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedListings = filtered.slice(start, end);
        resolve(paginatedListings);
      }, 500);
    });
  }

  getMyListings(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const myListings = this.listings.filter(l => l.sellerId === userId);
        // Calculate offer counts (mock logic)
        const listingsWithOffers = myListings.map(l => ({
          ...l,
          offerCount: Math.floor(Math.random() * 4) // Mock offer count 0-3
        }));
        resolve(listingsWithOffers);
      }, 500);
    });
  }

  addListing(listing) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newListing = {
          ...listing,
          id: Date.now(), // Generate a unique ID
          sellerId: 'user-1', // Assume current user
          postedAt: new Date().toISOString(),
          sold: false,
        };
        this.listings.unshift(newListing);
        resolve(newListing);
      }, 1000);
    });
  }

  updateListing(updatedListing) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.listings.findIndex(l => l.id === updatedListing.id);
        if (index !== -1) {
          this.listings[index] = { ...this.listings[index], ...updatedListing };
          resolve(this.listings[index]);
        } else {
          reject(new Error('Listing not found'));
        }
      }, 1000);
    });
  }

  deleteListing(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.listings = this.listings.filter(l => l.id !== id);
        resolve(true);
      }, 1000);
    });
  }
}

// Singleton instance
export const listingService = new ListingService();
