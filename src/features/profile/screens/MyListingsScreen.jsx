import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import ProductTile from '../../../components/ProductTile';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';

// Mock listings data - listings created by the current user (seller)
const BASE_LISTINGS = [
  {
    id: 1,
    sellerId: 'user-1',
    title: 'Office Desk Chair',
    price: 45,
    condition: 'Like New',
    category: 'Furniture',
    brand: 'IKEA',
    livingCommunity: 'Tooker',
    images: null,
    offerCount: 3,
    sold: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    sellerId: 'user-1',
    title: 'Coffee Table',
    price: 80,
    condition: 'Good',
    category: 'Furniture',
    brand: 'Wayfair',
    livingCommunity: 'Paseo on University',
    images: null,
    offerCount: 1,
    sold: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    sellerId: 'user-1',
    title: 'MacBook Pro 13"',
    price: 850,
    condition: 'Like New',
    category: 'Electronics',
    brand: 'Apple',
    livingCommunity: 'The Hyve',
    images: null,
    offerCount: 0,
    sold: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

const TICKET_LISTINGS = [
  {
    id: 4,
    sellerId: 'user-1',
    title: 'Taylor Swift – Eras Tour',
    price: 185,
    condition: 'New',
    category: 'Tickets',
    brand: 'Concert',
    livingCommunity: 'Tooker',
    eventDate: 'Sat, Mar 15 · 7:00 PM',
    venue: 'State Farm Stadium, Glendale',
    images: null,
    offerCount: 1,
    sold: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const MOCK_LISTINGS = ENABLE_TICKETS ? [...BASE_LISTINGS, ...TICKET_LISTINGS] : BASE_LISTINGS;

export default function MyListingsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [listings] = useState(MOCK_LISTINGS);
  const styles = getStyles(theme);

  const handleViewOffers = (listing) => {
    router.push({
      pathname: '/profile/listing-offers',
      params: {
        listing: JSON.stringify(listing),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {listings.length === 0 ? (
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
                <ProductTile product={listing} style={styles.productTileFullWidth} />
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
  offersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
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
    marginTop: 8,
    width: '100%',
  },
  noOffersText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },
});
