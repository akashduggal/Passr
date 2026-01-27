import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { getTheme, ASU } from './theme';
import { ENABLE_TICKETS } from './featureFlags';
import { CURRENT_USER_ID, getSellerName } from './currentUser';
import ProductTile from './components/ProductTile';
import SellerInfoCard from './components/SellerInfoCard';

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;

// Helper to create dates relative to today
const getDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Mock products data (same as dashboard). sellerId 'user-1' = current user.
const ALL_PRODUCTS = [
  { id: 1, sellerId: 'user-1', category: 'Furniture', brand: 'IKEA', title: 'Office Desk Chair', price: 45, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Comfortable ergonomic office chair in excellent condition. Perfect for studying or working from home. Adjustable height and back support.' },
  { id: 2, sellerId: 'user-1', category: 'Furniture', brand: 'Wayfair', title: 'Coffee Table', price: 80, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), urgent: true, description: 'Modern coffee table with storage shelf. Some minor scratches but overall in good condition. Great for dorm or apartment.' },
  { id: 3, sellerId: 'user-2', category: 'Furniture', brand: 'Target', title: 'Bookshelf', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(2), description: '5-shelf wooden bookshelf. Shows some wear but still functional. Perfect for organizing textbooks and supplies.' },
  { id: 4, sellerId: 'user-2', category: 'Furniture', brand: 'West Elm', title: 'Dining Table Set', price: 120, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(5), description: 'Complete dining table with 4 chairs. Barely used, in excellent condition. Perfect for shared living spaces.' },
  { id: 5, sellerId: 'user-2', category: 'Furniture', brand: 'Other', title: 'Study Lamp', price: 15, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(7), urgent: true, description: 'Adjustable desk lamp with LED lighting. Great for late-night study sessions.' },
  { id: 6, sellerId: 'user-2', category: 'Furniture', brand: 'IKEA', title: 'Desk Organizer', price: 20, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(14), description: 'Brand new desk organizer with multiple compartments. Keep your workspace tidy and organized.' },
  { id: 7, sellerId: 'user-1', category: 'Electronics', brand: 'Apple', title: 'MacBook Pro 13"', price: 850, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(0), description: '2020 MacBook Pro 13" with M1 chip. Excellent condition, barely used. Includes charger and original box. Perfect for students.' },
  { id: 8, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'iPhone 13', price: 450, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), description: 'iPhone 13 in good working condition. Minor scratches on screen protector. Battery health at 87%. Includes charger.' },
  { id: 9, sellerId: 'user-2', category: 'Electronics', brand: 'Samsung', title: 'Samsung Monitor 27"', price: 180, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(3), description: '27" Samsung 4K monitor. Excellent for coding, design work, or gaming. Like new condition with original packaging.' },
  { id: 10, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'AirPods Pro', price: 120, condition: 'New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(8), urgent: true, description: 'Brand new AirPods Pro, still sealed in box. Perfect for studying or commuting around campus.' },
  { id: 11, sellerId: 'user-2', category: 'Electronics', brand: 'Other', title: 'Gaming Keyboard', price: 65, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(15), description: 'Mechanical gaming keyboard with RGB lighting. Great for gaming or coding. Some keycaps show light wear.' },
  { id: 12, sellerId: 'user-2', category: 'Electronics', brand: 'Dell', title: 'Wireless Mouse', price: 25, condition: 'Fair', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(21), description: 'Wireless mouse in working condition. Some cosmetic wear but fully functional. Great for laptops.' },
  { id: 13, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi Mi Electric Scooter', price: 350, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Xiaomi Mi Electric Scooter in excellent condition. Perfect for getting around campus quickly. Max speed 15.5 mph, 18.6 mile range.' },
  { id: 14, sellerId: 'user-2', category: 'Escooters', brand: 'Segway', title: 'Segway Ninebot E25', price: 420, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'The Villas on Apache', postedAt: getDate(1), description: 'Segway Ninebot E25 electric scooter. Great condition with some minor scuffs. Reliable transportation for campus.' },
  { id: 15, sellerId: 'user-2', category: 'Escooters', brand: 'Razor', title: 'Razor E300', price: 180, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(4), description: 'Razor E300 electric scooter. Shows some wear but runs well. Good starter scooter for campus commuting.' },
  { id: 16, sellerId: 'user-2', category: 'Escooters', brand: 'Gotrax', title: 'Gotrax GXL V2', price: 280, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(9), description: 'Gotrax GXL V2 in like-new condition. Powerful motor, good battery life. Perfect for longer commutes.' },
  { id: 17, sellerId: 'user-2', category: 'Escooters', brand: 'Hiboy', title: 'Hiboy S2 Pro', price: 320, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(16), description: 'Brand new Hiboy S2 Pro electric scooter. Never used, still in original packaging. Great deal!' },
  { id: 18, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi M365', price: 250, condition: 'Good', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(30), description: 'Xiaomi M365 electric scooter in good working condition. Reliable and efficient for daily campus use.' },
  { id: 19, sellerId: 'user-2', category: 'Kitchen', brand: 'Instant Pot', title: 'Instant Pot Duo', price: 80, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Instant Pot Duo 6-quart pressure cooker. Barely used, in excellent condition. Perfect for dorm cooking.' },
  { id: 20, sellerId: 'user-2', category: 'Kitchen', brand: 'KitchenAid', title: 'KitchenAid Stand Mixer', price: 200, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), description: 'KitchenAid stand mixer in good condition. Works perfectly, some cosmetic wear. Great for baking enthusiasts.' },
  { id: 21, sellerId: 'user-2', category: 'Kitchen', brand: 'Hamilton Beach', title: 'Coffee Maker', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(6), description: 'Basic coffee maker in working condition. Perfect for morning coffee before class. Shows some wear but functional.' },
  { id: 22, sellerId: 'user-2', category: 'Kitchen', brand: 'Ninja', title: 'Air Fryer', price: 60, condition: 'Like New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(10), description: 'Air fryer in like-new condition. Healthy cooking option for dorm or apartment. Barely used.' },
  { id: 23, sellerId: 'user-2', category: 'Kitchen', brand: 'Cuisinart', title: 'Blender', price: 40, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(18), description: 'Blender in good working condition. Perfect for smoothies and shakes. Some cosmetic wear but fully functional.' },
  { id: 24, sellerId: 'user-2', category: 'Kitchen', brand: 'Other', title: 'Cutting Board Set', price: 25, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(60), description: 'Brand new cutting board set with multiple sizes. Never used, still in packaging. Essential kitchen accessory.' },
  { id: 25, sellerId: 'user-1', category: 'Tickets', brand: 'Concert', title: 'Taylor Swift – Eras Tour', price: 185, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), eventDate: 'Sat, Mar 15 · 7:00 PM', venue: 'State Farm Stadium, Glendale', description: '2 GA floor tickets for Eras Tour. Can\'t make it anymore. Face value. Transfer via Ticketmaster.' },
  { id: 26, sellerId: 'user-2', category: 'Tickets', brand: 'Music Festival', title: 'INnings Festival 2-Day Pass', price: 120, condition: 'New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(1), eventDate: 'Feb 28–Mar 1', venue: 'Tempe Beach Park', description: 'Selling one 2-day GA pass. Price negotiable. Meet on campus for handoff.' },
  { id: 27, sellerId: 'user-2', category: 'Tickets', brand: 'Stand-up Comedy', title: 'John Mulaney – Phoenix', price: 75, condition: 'New', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), eventDate: 'Fri, Apr 4 · 8:00 PM', venue: 'Arizona Financial Theatre', description: 'Single ticket, lower bowl. Selling at face. E-transfer or Venmo.' },
  { id: 28, sellerId: 'user-2', category: 'Tickets', brand: 'Sports', title: 'Suns vs Lakers – 2 Tickets', price: 95, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(3), eventDate: 'Sun, Mar 9 · 6:00 PM', venue: 'Footprint Center, Phoenix', description: 'Pair of upper bowl tickets. Great view. Digital transfer.' },
  { id: 29, sellerId: 'user-2', category: 'Tickets', brand: 'Theater', title: 'Hamilton – Gammage', price: 110, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(5), eventDate: 'Sat, May 10 · 2:00 PM', venue: 'ASU Gammage', description: 'One orchestra seat. Must-see show. DM to coordinate.' },
];

/** Detail item: icon + value (for horizontal row layout). */
function DetailRow({ value, icon, theme }) {
  if (value == null || value === '') return null;
  return (
    <View style={detailStyles.row}>
      {icon && (
        <View style={detailStyles.iconWrap}>
          <Ionicons name={icon} size={20} color={ASU.maroon} />
        </View>
      )}
      <Text style={[detailStyles.value, { color: theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  iconWrap: {},
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  const product = params.product ? JSON.parse(params.product) : null;

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.images && Array.isArray(product.images) ? product.images : [];
  const displaySlots = 6;
  const title = product.title || `${product.category || 'Item'}${product.brand ? ` · ${product.brand}` : ''}`;
  const livingCommunity = product.livingCommunity || product.location || null;
  const sellerId = product.sellerId || null;
  const sellerName = getSellerName(sellerId);
  const isViewerSeller = sellerId === CURRENT_USER_ID;
  const isSold = !!product.sold;
  const showMakeOffer = !isViewerSeller && !isSold;
  const showWishlist = !isViewerSeller;

  const [currentPage, setCurrentPage] = useState(0);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerPrice, setOfferPrice] = useState(() => product.price || 0);

  // Get seller's other listings (same sellerId, exclude current product, max 3)
  const sellerListings = useMemo(() => {
    if (!sellerId) return [];
    return ALL_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        p.sellerId === sellerId &&
        (ENABLE_TICKETS || p.category !== 'Tickets')
    ).slice(0, 3);
  }, [product.id, sellerId]);

  // Create array of image slots (up to 6)
  const imageSlots = Array.from({ length: displaySlots }).map((_, i) => images[i] || null);

  const renderCarouselPage = (index) => {
    const uri = imageSlots[index];
    return (
      <View key={index} style={styles.carouselPage}>
        {uri ? (
          <Image source={{ uri }} style={styles.carouselImage} resizeMode="cover" />
        ) : (
          <View style={styles.carouselPlaceholder}>
            <Ionicons name="image-outline" size={60} color={ASU.gray4} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photos – Carousel */}
        <View style={styles.photosSection}>
          <View style={styles.carouselContainer}>
            <PagerView
              style={styles.pagerView}
              initialPage={0}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              {imageSlots.map((_, index) => renderCarouselPage(index))}
            </PagerView>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {imageSlots.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentPage && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Title, Price, Condition */}
        <View style={styles.hero}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {product.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>URGENT</Text>
              </View>
            )}
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price ?? '—'}</Text>
            {product.condition && (
              <View style={styles.conditionChip}>
                <Text style={styles.conditionText}>{product.condition}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details: Category, Brand, Living Community; for Tickets also Event date, Venue */}
        {(product.category || product.brand || livingCommunity) && (
          <View style={styles.section}>
            <View style={styles.detailsRow}>
              <DetailRow value={product.category} icon="grid-outline" theme={theme} />
              <DetailRow value={product.brand} icon="pricetag-outline" theme={theme} />
              <DetailRow value={livingCommunity} icon="location-outline" theme={theme} />
            </View>
            {product.category === 'Tickets' && (product.eventDate || product.venue) && (
              <View style={[styles.detailsRow, { marginTop: 4 }]}>
                <DetailRow value={product.eventDate} icon="calendar-outline" theme={theme} />
                <DetailRow value={product.venue} icon="business-outline" theme={theme} />
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {product.description || 'No description provided.'}
            </Text>
          </View>
        </View>

        {/* Seller */}
        <View style={styles.section}>
          <SellerInfoCard
            sellerName={sellerName}
            location={livingCommunity}
            isVerified={true}
            showSectionTitle={true}
          />
        </View>

        {/* Seller's More Listings */}
        {sellerListings.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderRow}
              onPress={() => {
                router.push({
                  pathname: '/seller-profile',
                  params: {
                    sellerId: sellerId || '',
                    sellerName,
                    livingCommunity: livingCommunity || '',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitleInRow}>{sellerName}'s More listings</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsScrollContent}
            >
              {sellerListings.map((listing) => (
                <ProductTile
                  key={listing.id}
                  product={listing}
                  style={styles.horizontalTile}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Actions — Make an Offer and Wishlist only for buyers; sellers see neither on own listings */}
      {(showMakeOffer || showWishlist) && (
        <View style={styles.actions}>
          {showMakeOffer && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => {
                const price = Number(product.price) || 0;
                setOfferPrice(price);
                setOfferModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="cash-outline" size={20} color={ASU.white} />
              <Text style={styles.messageButtonText}>Make an Offer</Text>
            </TouchableOpacity>
          )}
          {showWishlist && (
            <TouchableOpacity
              style={[styles.wishlistButton, !showMakeOffer && styles.wishlistButtonOnly]}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={22} color={ASU.maroon} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Offer Modal */}
      <Modal
        visible={offerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
        statusBarTranslucent={true}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setOfferModalVisible(false)}
        >
          <Pressable 
            style={styles.modalContent} 
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make an Offer</Text>
              <TouchableOpacity
                onPress={() => setOfferModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.offerPriceContainer}>
              <TouchableOpacity
                style={styles.priceButton}
                onPress={() => {
                  if (offerPrice > 1) {
                    setOfferPrice(offerPrice - 1);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="remove-circle-outline" size={32} color={ASU.maroon} />
              </TouchableOpacity>

              <View style={styles.priceDisplay}>
                <Text style={styles.priceLabel}>Your Offer</Text>
                <Text style={styles.priceValue}>${offerPrice}</Text>
              </View>

              <TouchableOpacity
                style={styles.priceButton}
                onPress={() => setOfferPrice(offerPrice + 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={32} color={ASU.maroon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setOfferModalVisible(false);
                router.push({
                  pathname: '/chat',
                  params: {
                    offerAmount: offerPrice.toString(),
                    productTitle: title,
                    productPrice: (product.price || 0).toString(),
                  },
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: ASU.maroon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: ASU.white,
    fontSize: 16,
    fontWeight: '600',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleInRow: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 0,
    flex: 1,
  },

  photosSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  carouselContainer: {
    position: 'relative',
  },
  pagerView: {
    height: CAROUSEL_HEIGHT,
    width: screenWidth,
  },
  carouselPage: {
    width: screenWidth,
    height: CAROUSEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ASU.gray5,
  },
  paginationDotActive: {
    backgroundColor: ASU.maroon,
    width: 24,
  },

  hero: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: ASU.orange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ASU.white,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: ASU.maroon,
  },
  conditionChip: {
    backgroundColor: ASU.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  detailsRow: {
    flexDirection: 'row',
  },

  descriptionCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
  },

  listingsScrollContent: {
    paddingRight: 20,
  },
  horizontalTile: {
    width: 200,
    marginRight: 12,
    marginBottom: 0,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
  },
  offerPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingVertical: 20,
  },
  priceButton: {
    padding: 8,
  },
  priceDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: ASU.maroon,
  },
  okButton: {
    backgroundColor: ASU.maroon,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: ASU.white,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ASU.maroon,
    borderRadius: 12,
    paddingVertical: 16,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: ASU.white,
  },
  wishlistButton: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: ASU.maroon,
    borderRadius: 12,
  },
  wishlistButtonOnly: {
    flex: 1,
    width: undefined,
  },
});
