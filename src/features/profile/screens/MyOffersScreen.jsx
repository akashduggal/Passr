import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
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
    type: 'single',
    items: [
      {
        id: 1,
        title: 'Office Desk Chair',
        image: null,
        price: 45,
      }
    ],
    offerAmount: 40,
    status: 'pending', // pending, accepted, rejected
    sellerName: 'ASU Student',
    totalValue: 45,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: 'single',
    items: [
      {
        id: 2,
        title: 'Coffee Table',
        image: null,
        price: 80,
      }
    ],
    offerAmount: 70,
    status: 'accepted',
    sellerName: 'ASU Student',
    totalValue: 80,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 3,
    type: 'single',
    items: [
      {
        id: 3,
        title: 'MacBook Pro 13"',
        image: null,
        price: 850,
      }
    ],
    offerAmount: 800,
    status: 'rejected',
    sellerName: 'ASU Student',
    totalValue: 850,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 4,
    type: 'bundle',
    items: [
      { id: 101, title: 'Calculus Textbook', image: null, price: 60 },
      { id: 102, title: 'TI-84 Calculator', image: null, price: 80 },
      { id: 103, title: 'Lab Notebook', image: null, price: 15 },
    ],
    offerAmount: 130,
    status: 'pending',
    sellerName: 'John Doe',
    totalValue: 155,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 5,
    type: 'bundle',
    items: [
      { id: 201, title: 'Dorm Lamp', image: null, price: 20 },
      { id: 202, title: 'Mini Fan', image: null, price: 15 },
    ],
    offerAmount: 30,
    status: 'accepted',
    sellerName: 'Jane Smith',
    totalValue: 35,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  }
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
  const [activeFilter, setActiveFilter] = useState('All'); // All, Single, Bundle

  const filteredOffers = useMemo(() => {
    if (activeFilter === 'All') return MOCK_OFFERS;
    return MOCK_OFFERS.filter(offer =>
      activeFilter === 'Single' ? offer.type === 'single' : offer.type === 'bundle'
    );
  }, [activeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return ASU.green;
      case 'rejected': return ASU.maroon;
      default: return ASU.gold;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const handleOfferPress = (offer) => {
    if (offer.type === 'bundle') {
      // For bundle offers, navigate to Seller's Listings Page (Seller Profile)
      router.push({
        pathname: '/seller-profile',
        params: {
          sellerId: 'user-2', // Mock ID since not in offer object yet
          sellerName: offer.sellerName,
        },
      });
    } else {
      // For single offers, navigate to Product Detail
      router.push({
        pathname: '/product-detail',
        params: {
          product: JSON.stringify({
            id: offer.items[0].id,
            title: offer.items[0].title,
            price: offer.items[0].price,
            image: offer.items[0].image,
            sellerId: 'user-2',
          }),
        },
      });
    }
  };

  const renderFilterTab = (label) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.filterTab,
        activeFilter === label && styles.filterTabActive
      ]}
      onPress={() => setActiveFilter(label)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterTabText,
        activeFilter === label && styles.filterTabTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOfferCard = ({ item: offer }) => {
    const isBundle = offer.type === 'bundle';
    const mainItem = offer.items[0];
    const itemCount = offer.items.length;
    const statusColor = getStatusColor(offer.status);

    return (
      <TouchableOpacity
        style={styles.offerCard}
        onPress={() => handleOfferPress(offer)}
        activeOpacity={0.7}
      >
        {/* Header: Type & Date */}
        <View style={styles.cardHeader}>
          <View style={styles.typeTagContainer}>
            {isBundle && (
              <View style={styles.bundleTag}>
                <Ionicons name="layers-outline" size={12} color={ASU.white} />
                <Text style={styles.bundleTagText}>Bundle</Text>
              </View>
            )}
            <Text style={styles.offerDate}>{formatDate(offer.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(offer.status)}
            </Text>
          </View>
        </View>

        {/* Content: Images & Info */}
        <View style={styles.cardContent}>
          {/* Images Section */}
          <View style={styles.imageSection}>
            {isBundle ? (
              <View style={styles.bundleImages}>
                {offer.items.slice(0, 3).map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.bundleImageFrame,
                      { zIndex: 3 - index, marginLeft: index === 0 ? 0 : -15 }
                    ]}
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={16} color={ASU.gray4} />
                      </View>
                    )}
                  </View>
                ))}
                {itemCount > 3 && (
                  <View style={[styles.bundleImageFrame, styles.moreCount, { marginLeft: -15, zIndex: 0 }]}>
                    <Text style={styles.moreCountText}>+{itemCount - 3}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.singleImageFrame}>
                {mainItem.image ? (
                  <Image source={{ uri: mainItem.image }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={24} color={ASU.gray4} />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.title} numberOfLines={2}>
              {isBundle ? `Bundle of ${itemCount} items` : mainItem.title}
            </Text>
            {isBundle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                Includes: {offer.items.map(i => i.title).join(', ')}
              </Text>
            )}
            <Text style={styles.sellerName}>Seller: {offer.sellerName}</Text>
          </View>
        </View>

        {/* Pricing Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.label}>Total Value</Text>
            <Text style={styles.valuePrice}>${offer.totalValue}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Your Offer</Text>
            <Text style={styles.offerPrice}>${offer.offerAmount}</Text>
          </View>
        </View>

        {/* Action Buttons (if accepted) */}
        {offer.status === 'accepted' && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              router.push({
                pathname: '/chat',
                params: {
                  offerAmount: offer.offerAmount.toString(),
                  productTitle: isBundle ? 'Bundle Offer' : mainItem.title,
                  productPrice: offer.totalValue.toString(),
                },
              });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={16} color={ASU.white} />
            <Text style={styles.chatButtonText}>Chat with Seller</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.filterContainer}>
        {['All', 'Single', 'Bundle'].map(filter => renderFilterTab(filter))}
      </View>

      <FlatList
        data={filteredOffers}
        renderItem={renderOfferCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No {activeFilter !== 'All' ? activeFilter : ''} Offers Found</Text>
            <Text style={styles.emptySubtitle}>
              Check back later or browse listings to make an offer.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: theme.background,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterTabActive: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  filterTabTextActive: {
    color: ASU.white,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  offerCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bundleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ASU.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bundleTagText: {
    color: ASU.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  offerDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageSection: {
    marginRight: 12,
    justifyContent: 'center',
  },
  singleImageFrame: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: ASU.gray6,
    overflow: 'hidden',
  },
  bundleImages: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    paddingLeft: 10, // To account for negative margins if needed, or just let them stack
  },
  bundleImageFrame: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circular for bundle stack
    backgroundColor: ASU.gray6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.surface, // Create separation
  },
  moreCount: {
    backgroundColor: ASU.gray5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  label: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  valuePrice: {
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
  arrowContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ASU.white,
  },
});
