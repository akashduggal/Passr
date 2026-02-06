import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { offerService } from '../../../services/OfferService';

function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays} days ago`;
  }
}

export default function ListingOffersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const listing = params.listing ? JSON.parse(params.listing) : null;
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('pending'); // 'accepted' | 'pending' | 'rejected'
  const styles = getStyles(theme);

  const fetchOffers = useCallback(async () => {
    if (!listing?.id) return;
    
    try {
      setIsLoading(true);
      const data = await offerService.getOffersForListing(listing.id);
      
      // Map backend data to UI expected format
      const mappedOffers = data.map(offer => ({
        ...offer,
        // Ensure offerAmount exists (backend might send amount or offerAmount)
        offerAmount: offer.amount || offer.offerAmount || 0,
        createdAt: new Date(offer.createdAt)
      }));
      
      setOffers(mappedOffers);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      Alert.alert('Error', 'Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  }, [listing?.id]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleAcceptOffer = async (offer) => {
    try {
      await offerService.acceptOffer(offer.id);
      Alert.alert('Success', 'Offer accepted!');
      fetchOffers();
    } catch (error) {
      console.error('Accept offer error:', error);
      Alert.alert('Error', 'Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offer) => {
    try {
      await offerService.rejectOffer(offer.id);
      Alert.alert('Success', 'Offer rejected');
      fetchOffers();
    } catch (error) {
      console.error('Reject offer error:', error);
      Alert.alert('Error', 'Failed to reject offer');
    }
  };

  const handleChat = (offer) => {
    router.push({
      pathname: '/chat',
      params: {
        isSeller: 'true',
        buyerName: offer.buyerName || 'Buyer',
        buyerId: offer.buyerId || '',
        listingId: (listing?.id ?? '').toString(),
        offerId: offer.id,
        productTitle: listing?.title || 'Product',
        productPrice: (listing?.price ?? 0).toString(),
        offerAmount: offer.offerAmount.toString(),
        offerAccepted: 'true',
      },
    });
  };

  const isListingSold = listing?.sold === true;
  const showOpenChat = (offer) => !isListingSold && offer.status === 'accepted';

  // Sort offers by createdAt (newest first) and filter by selected status
  const sortedOffers = [...offers].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const filteredOffers = sortedOffers.filter(
    (offer) => offer.status === selectedStatus,
  );

  const getOriginalTotal = (offer) => {
    if (!offer.items || offer.items.length === 0) return 0;
    return offer.items.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'ios' ? 44 : 56) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Listing Info */}
        {listing && (
          <View style={styles.listingInfo}>
            <View style={styles.listingTitleRow}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              {isListingSold && (
                <View style={styles.soldChip}>
                  <Text style={styles.soldChipText}>Sold</Text>
                </View>
              )}
            </View>
            <Text style={styles.listingPrice}>${listing.price}</Text>
          </View>
        )}

        {/* Offers Tabs */}
        <View style={styles.tabsContainer}>
          {['accepted', 'pending', 'rejected'].map((statusKey) => (
            <TouchableOpacity
              key={statusKey}
              style={[
                styles.tabButton,
                selectedStatus === statusKey && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedStatus(statusKey)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedStatus === statusKey && styles.tabTextActive,
                ]}
              >
                {statusKey === 'accepted'
                  ? 'Accepted'
                  : statusKey === 'pending'
                  ? 'Pending'
                  : 'Rejected'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers List (by status tab) */}
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={ASU.maroon} />
          </View>
        ) : filteredOffers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>
              {selectedStatus === 'accepted'
                ? 'No Accepted Offers'
                : selectedStatus === 'pending'
                ? 'No Pending Offers'
                : 'No Rejected Offers'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'accepted'
                ? 'Accepted offers for this listing will appear here'
                : selectedStatus === 'pending'
                ? 'Pending offers for this listing will appear here'
                : 'Rejected offers for this listing will appear here'}
            </Text>
          </View>
        ) : (
          filteredOffers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View style={styles.buyerInfo}>
                  <View style={styles.buyerAvatar}>
                    <Ionicons name="person" size={20} color={ASU.white} />
                  </View>
                  <View style={styles.buyerDetails}>
                    <Text style={styles.buyerName}>{offer.buyerName}</Text>
                    <Text style={styles.offerDate}>{formatDate(offer.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  {(offer.isBundle || (offer.items && offer.items.length > 1)) && (
                    <View style={styles.bundleBadge}>
                      <Ionicons name="layers" size={10} color={ASU.white} style={{ marginRight: 4 }} />
                      <Text style={styles.bundleBadgeText}>Bundle</Text>
                    </View>
                  )}
                  {offer.status === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pending</Text>
                    </View>
                  )}
                  {offer.status === 'accepted' && (
                    <View style={styles.acceptedBadge}>
                      <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                  )}
                  {offer.status === 'rejected' && (
                    <View style={styles.rejectedBadge}>
                      <Text style={styles.rejectedText}>Rejected</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.offerAmountSection}>
                <View>
                  <Text style={styles.offerAmountLabel}>Offer Amount</Text>
                  <Text style={styles.offerAmount}>${offer.offerAmount}</Text>
                </View>
                {(offer.isBundle || (offer.items && offer.items.length > 1)) && (
                  <View style={styles.bundlePriceContainer}>
                     <Text style={styles.bundleOriginalLabel}>Bundle Value</Text>
                     <Text style={styles.bundleOriginalPrice}>
                       ${getOriginalTotal(offer)}
                     </Text>
                  </View>
                )}
              </View>

              {(offer.isBundle || (offer.items && offer.items.length > 1)) && (
                <View style={styles.bundleItemsContainer}>
                  <Text style={styles.bundleItemsTitle}>Items in this bundle:</Text>
                  {offer.items.map((item, index) => (
                    <View key={index} style={styles.bundleItemRow}>
                      <Ionicons name="ellipse" size={6} color={theme.textSecondary} style={{ marginTop: 6, marginRight: 8 }} />
                      <Text style={styles.bundleItemText} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.price && (
                        <Text style={styles.bundleItemPrice}>${item.price}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {offer.message && (
                <View style={styles.messageSection}>
                  <Text style={styles.messageText}>{offer.message}</Text>
                </View>
              )}

              {offer.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectOffer(offer)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptOffer(offer)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showOpenChat(offer) && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => handleChat(offer)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={ASU.white} />
                  <Text style={styles.chatButtonText}>Open Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listingInfo: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  listingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  soldChip: {
    backgroundColor: ASU.maroon,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASU.white,
  },
  listingPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: ASU.maroon,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 999,
    padding: 4,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: ASU.maroon,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: ASU.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  offerCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  buyerInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  buyerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ASU.maroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buyerDetails: {
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  offerDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  pendingBadge: {
    backgroundColor: ASU.gold + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASU.gold,
  },
  acceptedBadge: {
    backgroundColor: ASU.green + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  acceptedText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASU.green,
  },
  rejectedBadge: {
    backgroundColor: ASU.maroon + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rejectedText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASU.maroon,
  },
  offerAmountSection: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerAmountLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: ASU.maroon,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  bundleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ASU.maroon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bundleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ASU.white,
  },
  bundlePriceContainer: {
    alignItems: 'flex-end',
  },
  bundleOriginalLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  bundleOriginalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    textDecorationLine: 'line-through',
  },
  bundleItemsContainer: {
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bundleItemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  bundleItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bundleItemText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    marginRight: 8,
  },
  bundleItemPrice: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  messageSection: {
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: ASU.gray6,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ASU.white,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ASU.white,
  },
});
