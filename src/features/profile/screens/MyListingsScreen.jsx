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
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import ProductTile from '../../../components/ProductTile';
import ProductTileSkeleton from '../../../components/ProductTileSkeleton';
import { listingService } from '../../../services/ListingService';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const ButtonSkeleton = () => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={{ marginTop: 8, height: 36, backgroundColor: ASU.gray6, borderRadius: 8, overflow: 'hidden' }}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: ASU.gray5,
          opacity: shimmerOpacity,
        }}
      />
    </View>
  );
};

export default function MyListingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const styles = getStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      title: `My Listings ${listings.length > 0 ? `(${listings.length})` : ''}`,
    });
  }, [navigation, listings]);

  const fetchMyListings = useCallback(async (shouldSetLoading = true) => {
    if (shouldSetLoading) setIsLoading(true);
    try {
      const currentUser = await listingService.userService.getCurrentUser();
      const data = await listingService.getMyListings(currentUser.uid);
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch my listings:', error);
    } finally {
      if (shouldSetLoading) setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyListings(false);
    setRefreshing(false);
  }, [fetchMyListings]);

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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.listingsGrid}>
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <View key={key} style={styles.listingWrapper}>
                <ProductTileSkeleton style={styles.productTileFullWidth} />
                <ButtonSkeleton />
              </View>
            ))}
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
                    </>
                  ) : (
                    <View style={[styles.noOffersBadge, { backgroundColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }]}>
                        <Text style={[styles.noOffersText, { color: '#555', fontWeight: 'bold' }]}>Sold</Text>
                    </View>
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
