import { useState, useMemo, useEffect } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useWishlist } from '../../../context/WishlistContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import { CURRENT_USER_ID, getSellerName } from '../../../constants/currentUser';
import ProductTile from '../../../components/ProductTile';
import SellerInfoCard from '../../../components/SellerInfoCard';
import MakeOfferModal from '../components/MakeOfferModal';
import { listingService } from '../../../services/ListingService';

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;

// Detail item: icon + value (for horizontal row layout).
function DetailRow({ value, icon, theme }) {
  if (value == null || value === '') return null;
  return (
    <View style={[detailStyles.row, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      {icon && (
        <Ionicons name={icon} size={16} color={ASU.maroon} />
      )}
      <Text style={[detailStyles.value, { color: theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const topPadding = insets.top + headerHeight;

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
  const imageSlots = images.length > 0 ? [...images] : [null];
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
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(null);
  const [fullScreenViewedIndex, setFullScreenViewedIndex] = useState(0);

  const openFullScreenImage = (index) => {
    setFullScreenImageIndex(index);
    setFullScreenViewedIndex(index);
  };

  const closeFullScreenImage = () => {
    setFullScreenImageIndex(null);
  };

  const handleOfferSubmit = (offerData) => {
    // In a real app, you would send this to the backend
    console.log('Offer submitted:', offerData);
    
    // For demo purposes, we'll just show an alert or toast logic if we had one.
    // Navigate to chat or show success message
    router.push({
      pathname: '/chat',
      params: { 
        productId: product.id,
        offerData: JSON.stringify(offerData)
      }
    });
  };

  // Get seller's other listings (same sellerId, exclude current product)
  const [allSellerListings, setAllSellerListings] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (!sellerId) {
      setAllSellerListings([]);
      return;
    }
    
    listingService.getAllListings().then((listings) => {
      if (!isMounted) return;
      const filtered = listings.filter(
        (p) =>
          p.id !== product.id &&
          p.sellerId === sellerId &&
          (ENABLE_TICKETS || p.category !== 'Tickets')
      );
      setAllSellerListings(filtered);
    });
    
    return () => { isMounted = false; };
  }, [product.id, sellerId]);

  /** Resolve detail-view URI for carousel (WebP detail variant or legacy string). */
  const getDetailUri = (slot) => {
    if (!slot) return null;
    if (typeof slot === 'string') return slot;
    return slot.detail?.uri ?? slot.thumbnail?.uri ?? null;
  };

  /** Lazy load: only load image when within one page of current to save memory/bandwidth. */
  const isPageNearVisible = (index) => Math.abs(index - currentPage) <= 1;

  const renderCarouselPage = (index) => {
    const slot = imageSlots[index];
    const detailUri = getDetailUri(slot);
    const shouldLoad = detailUri && isPageNearVisible(index);
    const hasImage = !!detailUri;
    return (
      <Pressable
        key={index}
        style={styles.carouselPage}
        onPress={() => detailUri && openFullScreenImage(index)}
      >
        {shouldLoad ? (
          <Image source={{ uri: detailUri }} style={styles.carouselImage} resizeMode="contain" />
        ) : (
          <View style={styles.carouselPlaceholder}>
            <Ionicons name="image-outline" size={60} color={ASU.gray4} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: topPadding, backgroundColor: theme.surface }} />
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
              {product.category === 'Tickets' && (
                <>
                  <DetailRow value={product.eventDate} icon="calendar-outline" theme={theme} />
                  <DetailRow value={product.venue} icon="business-outline" theme={theme} />
                </>
              )}
            </View>
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
            otherItemCount={allSellerListings.length}
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
          />
          {/* Bundle & Save Promo */}
          {/* {allSellerListings.length > 0 && (
            <TouchableOpacity
              style={styles.bundlePromo}
              onPress={() => {
                router.push({
                  pathname: '/seller-profile',
                  params: {
                    sellerId: sellerId || '',
                    sellerName,
                    livingCommunity: livingCommunity || '',
                    autoSelectId: product.id,
                    initialMode: 'selection',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.bundleIconCircle}>
                <Ionicons name="layers" size={24} color={ASU.maroon} />
              </View>
              <View style={styles.bundlePromoContent}>
                <Text style={styles.bundleTitle}>Bundle & Save</Text>
                <Text style={styles.bundleSubtitle}>
                  Shop {allSellerListings.length} other items from {sellerName} to save.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )} */}
        </View>
      </ScrollView>

      {/* Actions — Make an Offer and Wishlist only for buyers; sellers see neither on own listings */}
      {(showMakeOffer || showWishlist) && (
        <View style={styles.actions}>
          {showMakeOffer && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => setOfferModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={20} color={ASU.white} />
              <Text style={styles.messageButtonText}>Make Offer</Text>
            </TouchableOpacity>
          )}
          {showWishlist && (
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={() => toggleWishlist(product)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isInWishlist(product.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={isInWishlist(product.id) ? ASU.maroon : theme.text} 
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Bundle Offer Modal */}
      <MakeOfferModal
        visible={offerModalVisible}
        onClose={() => setOfferModalVisible(false)}
        product={product}
        sellerListings={allSellerListings}
        onSubmit={handleOfferSubmit}
      />

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={fullScreenImageIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreenImage}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={[styles.fullScreenCloseButton, { top: insets.top + 10 }]}
            onPress={closeFullScreenImage}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          <PagerView
            style={styles.fullScreenPager}
            initialPage={fullScreenImageIndex || 0}
            onPageSelected={(e) => setFullScreenViewedIndex(e.nativeEvent.position)}
          >
            {imageSlots.map((slot, index) => {
              const uri = getDetailUri(slot);
              if (!uri) return null;
              return (
                <View key={index} style={styles.fullScreenImageContainer}>
                  <Image
                    source={{ uri }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                </View>
              );
            })}
          </PagerView>
          
          <View style={[styles.fullScreenPagination, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.fullScreenPaginationText}>
              {fullScreenViewedIndex + 1} / {imageSlots.length}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: ASU.maroon,
    borderRadius: 8,
  },
  backButtonText: {
    color: ASU.white,
    fontWeight: '600',
  },
  photosSection: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  carouselContainer: {
    height: CAROUSEL_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  pagerView: {
    flex: 1,
  },
  carouselPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: ASU.white,
  },
  hero: {
    padding: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 28,
  },
  urgentBadge: {
    backgroundColor: ASU.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASU.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: ASU.maroon,
  },
  conditionChip: {
    backgroundColor: theme.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  section: {
    backgroundColor: theme.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  sectionTitleInRow: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  descriptionCard: {
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  listingsScrollContent: {
    gap: 16,
    paddingRight: 20,
  },
  horizontalTile: {
    width: 160,
  },
  bundlePromo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceHighlight || '#F9F9F9',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ASU.gold,
  },
  bundleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${ASU.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bundlePromoContent: {
    flex: 1,
    marginRight: 8,
  },
  bundleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  bundleSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ASU.white,
  },
  wishlistButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  fullScreenPager: {
    flex: 1,
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: '100%',
  },
  fullScreenPagination: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fullScreenPaginationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
