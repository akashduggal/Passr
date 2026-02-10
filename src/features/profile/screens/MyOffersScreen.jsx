import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { useMyOffers } from '../../../hooks/queries/useOfferQueries';

function formatDate(date) {
  if (!date) return '';
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
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const [activeTab, setActiveTab] = useState('active'); // active, history
  const [activeFilter, setActiveFilter] = useState('All'); // All, Single, Bundle
  const [selectedOffer, setSelectedOffer] = useState(null); // For detail modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);

  const { 
    data: offersData = [], 
    isLoading, 
    refetch, 
    isRefetching 
  } = useMyOffers();

  // Refetch on focus to ensure data is up to date
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Transform backend data to match UI component expectations
  const offers = useMemo(() => {
    return offersData.map(offer => ({
      ...offer,
      type: offer.items.length > 1 ? 'bundle' : 'single',
      totalValue: offer.items.reduce((sum, item) => sum + item.price, 0),
      createdAt: new Date(offer.createdAt)
    }));
  }, [offersData]);

  // Filter offers based on active tab and filter
  const filteredOffers = useMemo(() => {
    let result = offers;

    // 1. Filter by Status (Active vs History)
    if (activeTab === 'active') {
      result = result.filter((o) => o.status === 'pending' || o.status === 'accepted');
    } else {
      result = result.filter((o) => o.status === 'rejected' || o.status === 'completed' || o.status === 'cancelled' || o.status === 'sold');
    }

    // 2. Filter by Type (All vs Single vs Bundle)
    if (activeFilter === 'Single') {
      result = result.filter(o => o.type === 'single');
    } else if (activeFilter === 'Bundle') {
      result = result.filter(o => o.type === 'bundle');
    }

    return result;
  }, [activeTab, activeFilter, offers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return ASU.green;
      case 'sold': return ASU.green;
      case 'rejected': return ASU.maroon;
      default: return ASU.warning;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'sold': return 'Purchased';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const handleBundlePress = (offer) => {
    setSelectedBundle(offer);
    setModalVisible(true);
  };

  const closeBundleModal = () => {
    setModalVisible(false);
    setSelectedBundle(null);
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
        onPress={isBundle ? () => handleBundlePress(offer) : undefined}
        activeOpacity={isBundle ? 0.7 : 1}
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
        {offer.status === 'accepted' || offer.status === 'sold' && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              router.push({
                pathname: '/chat',
                params: {
                  offerAmount: offer.offerAmount.toString(),
                  productTitle: isBundle ? 'Bundle Offer' : mainItem.title,
                  productPrice: offer.totalValue.toString(),
                  listingId: mainItem.id.toString(),
                  sellerId: offer.sellerId || '',
                  offerId: offer.id,
                  offerAccepted: 'true',
                  sellerName: offer.sellerName || 'Seller',
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
      <View style={styles.headerContainer}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Type Filters (All / Single / Bundle) */}
        <View style={styles.filterContainer}>
          {['All', 'Single', 'Bundle'].map(filter => renderFilterTab(filter))}
        </View>
      </View>

      <FlatList
        data={filteredOffers}
        renderItem={renderOfferCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={ASU.maroon} // iOS
            colors={[ASU.maroon]} // Android
          />
        }
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeBundleModal}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeBundleModal}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bundle Offer Details</Text>
              <TouchableOpacity onPress={closeBundleModal}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedBundle && (
              <>
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.bundleSectionTitle}>Items in this bundle</Text>
                  {selectedBundle.items.map((item) => (
                    <View key={item.id} style={styles.bundleItemRow}>
                      <View style={styles.bundleItemImage}>
                         {item.image ? (
                           <Image source={{ uri: item.image }} style={styles.image} />
                         ) : (
                           <View style={styles.imagePlaceholder}>
                             <Ionicons name="image-outline" size={20} color={ASU.gray4} />
                           </View>
                         )}
                      </View>
                      <View style={styles.bundleItemInfo}>
                        <Text style={styles.bundleItemTitle}>{item.title}</Text>
                        <Text style={styles.bundleItemPrice}>${item.price}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={{ height: 20 }} />
                </ScrollView>

                <View style={styles.modalFooter}>
                  <View style={styles.modalFooterRow}>
                    <Text style={styles.modalLabel}>Total Value</Text>
                    <Text style={styles.modalValue}>${selectedBundle.totalValue}</Text>
                  </View>
                  <View style={[styles.modalFooterRow, styles.modalTotalRow]}>
                    <Text style={styles.modalTotalLabel}>Your Offer</Text>
                    <Text style={styles.modalTotalValue}>${selectedBundle.offerAmount}</Text>
                  </View>
                  
                  {selectedBundle.status === 'accepted' && (
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() => {
                        closeBundleModal();
                        router.push({
                          pathname: '/chat',
                          params: {
                            offerAmount: selectedBundle.offerAmount.toString(),
                            productTitle: 'Bundle Offer',
                            productPrice: selectedBundle.totalValue.toString(),
                            listingId: selectedBundle.items[0].id.toString(),
                            sellerId: selectedBundle.sellerId || '',
                            sellerName: selectedBundle.sellerName || 'Seller',
                            offerId: selectedBundle.id,
                            offerAccepted: 'true',
                          },
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color={ASU.white} />
                      <Text style={styles.chatButtonText}>Chat with Seller</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: theme.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: theme.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  modalBody: {
    padding: 20,
  },
  bundleSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
  },
  bundleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  bundleItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: ASU.gray6,
    marginRight: 12,
    overflow: 'hidden',
  },
  bundleItemInfo: {
    flex: 1,
  },
  bundleItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  bundleItemPrice: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : Math.max(20, insets.bottom + 20),
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginBottom: 0,
  },
  modalLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  modalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    textDecorationLine: 'line-through',
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: ASU.maroon,
  },
});
