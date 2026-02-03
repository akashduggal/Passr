import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import ProductTile from '../../../components/ProductTile';
import { listingService } from '../../../services/ListingService';

export default function MyListingsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const styles = getStyles(theme);

  const fetchMyListings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Hardcoded user-1 for now, similar to Dashboard logic
      const data = await listingService.getMyListings('user-1');
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch my listings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyListings();
    }, [fetchMyListings])
  );

  const handleViewOffers = (listing) => {
    router.push({
      pathname: '/profile/listing-offers',
      params: {
        listing: JSON.stringify(listing),
      },
    });
  };

  const handleEditListing = (listing) => {
    router.push({
      pathname: '/edit-listing',
      params: {
        listingData: JSON.stringify(listing),
      },
    });
  };

  const handleToggleSold = async (listing) => {
    try {
      const newSoldStatus = !listing.sold;
      
      // Optimistic update
      setListings(currentListings => 
        currentListings.map(item => 
          item.id === listing.id 
            ? { ...item, sold: newSoldStatus } 
            : item
        )
      );

      // Call service
      await listingService.updateListing({ 
        id: listing.id, 
        sold: newSoldStatus 
      });

    } catch (error) {
      console.error('Failed to update sold status:', error);
      // Revert on failure
      fetchMyListings();
      // Optional: Show error toast
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'ios' ? 44 : 56) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ASU.maroon} />
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No Listings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first listing to start selling
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/dashboard/add-listing')}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((listing) => (
              <View key={listing.id} style={styles.listingWrapper}>
                <ProductTile 
                  product={listing} 
                  style={styles.productTileFullWidth} 
                  onPress={() => handleEditListing(listing)}
                  disabled={false} // Allow pressing even if sold to edit
                />
                
                <View style={styles.actionsContainer}>
                  {!listing.sold ? (
                    <>
                      {listing.offerCount > 0 ? (
                        <TouchableOpacity
                          style={styles.offersButton}
                          onPress={() => handleViewOffers(listing)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="cash" size={16} color={ASU.white} />
                          <Text style={styles.offersButtonText}>
                            {listing.offerCount} Offer{listing.offerCount > 1 ? 's' : ''}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.noOffersBadge}>
                          <Text style={styles.noOffersText}>No offers yet</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={styles.markSoldButton}
                        onPress={() => handleToggleSold(listing)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color={ASU.maroon} />
                        <Text style={styles.markSoldText}>Mark as Sold</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.relistButton}
                      onPress={() => handleToggleSold(listing)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="refresh-outline" size={16} color={theme.text} />
                      <Text style={[styles.relistText, { color: theme.text }]}>Mark as Available</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: ASU.maroon,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: ASU.white,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  productTileFullWidth: {
    width: '100%',
    marginBottom: 0,
  },
  actionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  offersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    width: '100%',
  },
  offersButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: ASU.white,
  },
  noOffersBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.gray6,
    borderRadius: 8,
    paddingVertical: 8,
    width: '100%',
  },
  noOffersText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  markSoldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    width: '100%',
  },
  markSoldText: {
    fontSize: 13,
    fontWeight: '600',
    color: ASU.maroon,
  },
  relistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    width: '100%',
  },
  relistText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
