import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import ProductTile from '../../../components/ProductTile';
import MakeOfferModal from '../../marketplace/components/MakeOfferModal';
import { listingService } from '../../../services/ListingService';
import { useSellerListings, useListings } from '../../../hooks/queries/useListingQueries';

export default function SellerProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  const sellerId = params.sellerId || '';
  const paramSellerName = params.sellerName;
  const livingCommunity = params.livingCommunity || '';
  const autoSelectId = params.autoSelectId || null;
  const initialMode = params.initialMode === 'selection';

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(initialMode);
  const [selectedIds, setSelectedIds] = useState(autoSelectId ? [autoSelectId] : []);
  const [offerModalVisible, setOfferModalVisible] = useState(false);

  // Fetch listings: either by sellerId or everything (then filter by community locally for now, 
  // though ideally we'd have a useCommunityListings hook)
  
  // Strategy: 
  // 1. If sellerId exists, use useSellerListings.
  // 2. If livingCommunity exists (and no sellerId), we might need to fetch all and filter 
  //    (or add a new query param to backend). 
  //    For now, let's reuse useListings if we can, or just fetch all and filter like before but via RQ.
  
  // Actually, useSellerListings is perfect if we have sellerId.
  // If we have livingCommunity, we should probably fetch all listings (cached) and filter.
  
  const { data: listingsBySeller = [] } = useSellerListings(sellerId);
  const { data: allListingsPages } = useListings({ limit: 100 }); // Fetch a reasonable amount if needed
  
  // Flatten all listings pages if we need to filter by community
  const allListings = useMemo(() => {
    return allListingsPages?.pages.flat() || [];
  }, [allListingsPages]);

  const sellerListings = useMemo(() => {
    if (sellerId) {
      return listingsBySeller.filter(p => ENABLE_TICKETS || p.category !== 'Tickets');
    } 
    if (livingCommunity) {
      return allListings.filter(
        (p) =>
          (p.livingCommunity === livingCommunity || p.location === livingCommunity) &&
          (ENABLE_TICKETS || p.category !== 'Tickets')
      );
    }
    return [];
  }, [sellerId, livingCommunity, listingsBySeller, allListings]);

  // Derive seller name from params or listings
  const sellerName = useMemo(() => {
    if (paramSellerName && paramSellerName !== 'ASU Student') return paramSellerName;
    if (sellerListings.length > 0 && sellerListings[0].sellerName) {
      return sellerListings[0].sellerName;
    }
    return 'ASU Student';
  }, [paramSellerName, sellerListings]);

  // Toggle Selection Mode
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      // Cancel selection
      setIsSelectionMode(false);
      setSelectedIds([]);
    } else {
      setIsSelectionMode(true);
    }
  };

  // Toggle Individual Item
  const toggleItemSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  // Handle Make Bundle Offer
  const handleMakeBundleOffer = () => {
    if (selectedIds.length === 0) return;
    setOfferModalVisible(true);
  };

  // Handle Cancel Selection
  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  // Handle Submit Offer (Legacy/Unused by Modal currently)
  const handleOfferSubmit = (offerData) => {
    console.log('Bundle Offer Submitted:', offerData);
    setOfferModalVisible(false);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleOfferSuccess = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  // Calculate total of selected items
  const selectedTotal = useMemo(() => {
    return sellerListings
      .filter((p) => selectedIds.includes(p.id))
      .reduce((sum, p) => sum + (p.price || 0), 0);
  }, [selectedIds, sellerListings]);

  // Determine main product for modal (just use the first selected one)
  const mainProductForModal = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return sellerListings.find(p => p.id === selectedIds[0]);
  }, [selectedIds, sellerListings]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: `${sellerName}'s More Listings` }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent, 
          isSelectionMode && { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Listings Section */}
        <View style={styles.section}>
          {!isSelectionMode ? (
             sellerListings.length > 1 && (
               <View style={styles.promoContainer}>
                 <View style={styles.promoIconCircle}>
                   <Ionicons name="layers" size={24} color={ASU.maroon} />
                 </View>
                 <View style={styles.promoTextContent}>
                   <Text style={styles.promoTitle}>Bundle & Save</Text>
                   <Text style={styles.promoSubtitle}>Select multiple items to send a combined offer.</Text>
                 </View>
                 <TouchableOpacity onPress={toggleSelectionMode} style={styles.startBundleButton}>
                   <Text style={styles.startBundleButtonText}>Start</Text>
                 </TouchableOpacity>
               </View>
             )
          ) : (
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionTitle}>Select items to bundle</Text>
              <TouchableOpacity onPress={cancelSelection} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.listingsHeader}>
            <Text style={styles.sectionTitle}>
              All Listings ({sellerListings.length})
            </Text>
          </View>

          {sellerListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {sellerListings.map((listing) => {
                const isSelected = selectedIds.includes(listing.id);
                return (
                  <View key={listing.id} style={styles.gridItemWrapper}>
                    <ProductTile
                      product={listing}
                      disabled={isSelectionMode ? false : undefined}
                      onPress={isSelectionMode ? () => toggleItemSelection(listing.id) : undefined}
                      style={[
                        styles.productTileOverride, 
                        isSelectionMode && isSelected ? styles.selectedTile : null
                      ]}
                    />
                    {isSelectionMode && (
                      <View style={[styles.selectionOverlay, isSelected && styles.selectionOverlaySelected]}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={theme.textSecondary} />
              <Text style={styles.emptyStateText}>No listings found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Bar for Bundle Offer */}
      {isSelectionMode && selectedIds.length > 0 && (
        <View style={styles.floatingBar}>
          <View style={styles.floatingBarContent}>
            <View>
              <Text style={styles.floatingBarLabel}>{selectedIds.length} items selected</Text>
              <Text style={styles.floatingBarTotal}>Total: ${selectedTotal}</Text>
            </View>
            <TouchableOpacity 
              style={styles.bundleButton}
              onPress={handleMakeBundleOffer}
            >
              <Text style={styles.bundleButtonText}>Make Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Make Offer Modal */}
      {mainProductForModal && (
        <MakeOfferModal
          visible={offerModalVisible}
          onClose={() => setOfferModalVisible(false)}
          product={mainProductForModal}
          sellerListings={sellerListings}
          initialSelectedIds={selectedIds}
          onSubmit={handleOfferSubmit}
          onSuccess={handleOfferSuccess}
        />
      )}
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
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ASU.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${ASU.gold}20`, // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoTextContent: {
    flex: 1,
    marginRight: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  startBundleButton: {
    backgroundColor: ASU.maroon,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startBundleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.surfaceHighlight || '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: ASU.maroon,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    position: 'relative',
    width: '48%', // Approx half width
    marginBottom: 16,
  },
  productTileOverride: {
    width: '100%',
    marginBottom: 0,
  },
  selectedTile: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    pointerEvents: 'none', // Let touches pass through to ProductTile wrapper if needed, but ProductTile handles press
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 12,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    padding: 16,
    paddingBottom: 34, // Safe area
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  floatingBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingBarLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  floatingBarTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  bundleButton: {
    backgroundColor: ASU.maroon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bundleButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.8,
  },
  bundleButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
