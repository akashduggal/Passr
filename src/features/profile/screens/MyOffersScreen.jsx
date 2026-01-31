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

// Mock offers data - offers made by the current user
const MOCK_OFFERS = [
  {
    id: 1,
    productId: 1,
    productTitle: 'Office Desk Chair',
    productImage: null,
    productPrice: 45,
    offerAmount: 40,
    status: 'pending', // pending, accepted, rejected
    sellerName: 'ASU Student',
    listingPrice: 45,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    productId: 2,
    productTitle: 'Coffee Table',
    productImage: null,
    offerAmount: 70,
    status: 'accepted',
    sellerName: 'ASU Student',
    listingPrice: 80,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 3,
    productId: 3,
    productTitle: 'MacBook Pro 13"',
    productImage: null,
    offerAmount: 800,
    status: 'rejected',
    sellerName: 'ASU Student',
    listingPrice: 850,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

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

export default function MyOffersScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  const [offers] = useState(MOCK_OFFERS);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return ASU.green;
      case 'rejected':
        return ASU.maroon;
      default:
        return ASU.gold;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const handleOfferPress = (offer) => {
    router.push({
      pathname: '/product-detail',
      params: {
        product: JSON.stringify({
          id: offer.productId,
          title: offer.productTitle,
          price: offer.listingPrice,
          sellerId: 'user-2',
        }),
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
        {offers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No Offers Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your offers will appear here once you make them
            </Text>
          </View>
        ) : (
          offers.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              onPress={() => handleOfferPress(offer)}
              activeOpacity={0.7}
            >
              <View style={styles.offerHeader}>
                <View style={styles.productInfo}>
                  <View style={styles.productImageContainer}>
                    {offer.productImage ? (
                      <Image
                        source={{ uri: offer.productImage }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="image-outline" size={24} color={ASU.gray4} />
                      </View>
                    )}
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {offer.productTitle}
                    </Text>
                    <Text style={styles.sellerName}>Seller: {offer.sellerName}</Text>
                    <Text style={styles.offerDate}>{formatDate(offer.createdAt)}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(offer.status) }]}>
                    {getStatusLabel(offer.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.offerAmounts}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Listing Price:</Text>
                  <Text style={styles.listingPrice}>${offer.listingPrice}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Your Offer:</Text>
                  <Text style={styles.offerPrice}>${offer.offerAmount}</Text>
                </View>
              </View>

              {offer.status === 'accepted' && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => {
                    router.push({
                      pathname: '/chat',
                      params: {
                        offerAmount: offer.offerAmount.toString(),
                        productTitle: offer.productTitle,
                        productPrice: offer.listingPrice.toString(),
                      },
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={ASU.white} />
                  <Text style={styles.chatButtonText}>Open Chat</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
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
  productInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: ASU.gray6,
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  offerDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  offerAmounts: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  listingPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: ASU.maroon,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ASU.white,
  },
});
