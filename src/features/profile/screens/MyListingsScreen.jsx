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
import { useSellerListings } from '../../../hooks/queries/useListingQueries';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import auth from '../../../services/firebaseAuth';

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
  const currentUser = auth().currentUser;
  
  const { 
    data: listings = [], 
    isLoading, 
    isRefetching,
    refetch 
  } = useSellerListings(currentUser?.uid);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active'); // 'active' | 'sold'
  const styles = getStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      title: `My Listings ${listings.length > 0 ? `(${listings.length})` : ''}`,
    });
  }, [navigation, listings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const activeListings = listings.filter(l => !l.sold);
  const soldListings = listings.filter(l => l.sold);
  const displayedListings = selectedTab === 'active' ? activeListings : soldListings;

  const handleViewOffers = (listing) => {
    router.push({
      pathname: '/profile-listing-offers',
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
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'active' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
            Active ({activeListings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'sold' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('sold')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, selectedTab === 'sold' && styles.tabTextActive]}>
            Sold ({soldListings.length})
          </Text>
        </TouchableOpacity>
      </View>

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
        ) : displayedListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'active' ? 'No Active Listings' : 'No Sold Listings'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'active' 
                ? 'Create your first listing to start selling' 
                : 'Items you mark as sold will appear here'}
            </Text>
            {selectedTab === 'active' && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/dashboard/add-listing')}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>Create Listing</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {displayedListings.map((listing) => (
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
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tabButtonActive: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: ASU.white,
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
