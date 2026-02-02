import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import ProductTile from '../../../components/ProductTile';
import MakeOfferModal from '../../marketplace/components/MakeOfferModal';

// Helper to create dates relative to today
const getDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Mock products data (same as dashboard and product-detail). sellerId 'user-1' = current user.
const ALL_PRODUCTS = [
  { id: 1, sellerId: 'user-1', category: 'Furniture', brand: 'IKEA', title: 'Office Desk Chair', price: 45, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Comfortable ergonomic office chair in excellent condition. Perfect for studying or working from home. Adjustable height and back support.' },
  { id: 2, sellerId: 'user-1', category: 'Furniture', brand: 'Wayfair', title: 'Coffee Table', price: 80, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), urgent: true, description: 'Modern coffee table with storage shelf. Some minor scratches but overall in good condition. Great for dorm or apartment.' },
  { id: 3, sellerId: 'user-2', category: 'Furniture', brand: 'Target', title: 'Bookshelf', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(2), description: '5-shelf wooden bookshelf. Shows some wear but still functional. Perfect for organizing textbooks and supplies.' },
  { id: 4, sellerId: 'user-2', category: 'Furniture', brand: 'West Elm', title: 'Dining Table Set', price: 120, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(5), description: 'Complete dining table with 4 chairs. Barely used, in excellent condition. Perfect for shared living spaces.' },
  { id: 5, sellerId: 'user-2', category: 'Furniture', brand: 'Other', title: 'Study Lamp', price: 15, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(7), urgent: true, description: 'Adjustable desk lamp with LED lighting. Great for late-night study sessions.' },
  { id: 6, sellerId: 'user-2', category: 'Furniture', brand: 'IKEA', title: 'Desk Organizer', price: 20, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(14), description: 'Brand new desk organizer with multiple compartments. Keep your workspace tidy and organized.' },
  { id: 7, sellerId: 'user-1', category: 'Electronics', brand: 'Apple', title: 'MacBook Pro 13"', price: 850, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(0), description: '2020 MacBook Pro 13" with M1 chip. Excellent condition, barely used. Includes charger and original box. Perfect for students.' },
  { id: 8, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'iPhone 13', price: 450, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), description: 'iPhone 13 in good working condition. Minor scratches on screen protector. Battery health at 87%. Includes charger.' },
  { id: 9, sellerId: 'user-2', category: 'Electronics', brand: 'Samsung', title: 'Samsung Monitor 27"', price: 180, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(3), description: '27" Samsung 4K monitor. Excellent for coding, design work, or gaming. Like new condition with original packaging.' },
  { id: 10, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'AirPods Pro', price: 120, condition: 'New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(8), urgent: true, description: 'Brand new AirPods Pro, still sealed in box. Perfect for studying or commuting around campus.' },
  { id: 11, sellerId: 'user-2', category: 'Electronics', brand: 'Other', title: 'Gaming Keyboard', price: 65, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(15), description: 'Mechanical gaming keyboard with RGB lighting. Great for gaming or coding. Some keycaps show light wear.' },
  { id: 12, sellerId: 'user-2', category: 'Electronics', brand: 'Dell', title: 'Wireless Mouse', price: 25, condition: 'Fair', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(21), description: 'Wireless mouse in working condition. Some cosmetic wear but fully functional. Great for laptops.' },
  { id: 13, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi Mi Electric Scooter', price: 350, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Xiaomi Mi Electric Scooter in excellent condition. Perfect for getting around campus quickly. Max speed 15.5 mph, 18.6 mile range.' },
  { id: 14, sellerId: 'user-2', category: 'Escooters', brand: 'Segway', title: 'Segway Ninebot E25', price: 420, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'The Villas on Apache', postedAt: getDate(1), description: 'Segway Ninebot E25 electric scooter. Great condition with some minor scuffs. Reliable transportation for campus.' },
  { id: 15, sellerId: 'user-2', category: 'Escooters', brand: 'Razor', title: 'Razor E300', price: 180, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(4), description: 'Razor E300 electric scooter. Shows some wear but runs well. Good starter scooter for campus commuting.' },
  { id: 16, sellerId: 'user-2', category: 'Escooters', brand: 'Gotrax', title: 'Gotrax GXL V2', price: 280, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(9), description: 'Gotrax GXL V2 in like-new condition. Powerful motor, good battery life. Perfect for longer commutes.' },
  { id: 17, sellerId: 'user-2', category: 'Escooters', brand: 'Hiboy', title: 'Hiboy S2 Pro', price: 320, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(16), description: 'Brand new Hiboy S2 Pro electric scooter. Never used, still in original packaging. Great deal!' },
  { id: 18, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi M365', price: 250, condition: 'Good', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(30), description: 'Xiaomi M365 electric scooter in good working condition. Reliable and efficient for daily campus use.' },
  { id: 19, sellerId: 'user-2', category: 'Kitchen', brand: 'Instant Pot', title: 'Instant Pot Duo', price: 80, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Instant Pot Duo 6-quart pressure cooker. Barely used, in excellent condition. Perfect for dorm cooking.' },
  { id: 20, sellerId: 'user-2', category: 'Kitchen', brand: 'KitchenAid', title: 'KitchenAid Stand Mixer', price: 200, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), description: 'KitchenAid stand mixer in good condition. Works perfectly, some cosmetic wear. Great for baking enthusiasts.' },
  { id: 21, sellerId: 'user-2', category: 'Kitchen', brand: 'Hamilton Beach', title: 'Coffee Maker', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(6), description: 'Basic coffee maker in working condition. Perfect for morning coffee before class. Shows some wear but functional.' },
  { id: 22, sellerId: 'user-2', category: 'Kitchen', brand: 'Ninja', title: 'Air Fryer', price: 60, condition: 'Like New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(10), description: 'Air fryer in like-new condition. Healthy cooking option for dorm or apartment. Barely used.' },
  { id: 23, sellerId: 'user-2', category: 'Kitchen', brand: 'Cuisinart', title: 'Blender', price: 40, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(18), description: 'Blender in good working condition. Perfect for smoothies and shakes. Some cosmetic wear but fully functional.' },
  { id: 24, sellerId: 'user-2', category: 'Kitchen', brand: 'Other', title: 'Cutting Board Set', price: 25, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(60), description: 'Brand new cutting board set with multiple sizes. Never used, still in packaging. Essential kitchen accessory.' },
  { id: 25, sellerId: 'user-1', category: 'Tickets', brand: 'Concert', title: 'Taylor Swift – Eras Tour', price: 185, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), eventDate: 'Sat, Mar 15 · 7:00 PM', venue: 'State Farm Stadium, Glendale', description: '2 GA floor tickets for Eras Tour. Can\'t make it anymore. Face value. Transfer via Ticketmaster.' },
  { id: 26, sellerId: 'user-2', category: 'Tickets', brand: 'Music Festival', title: 'INnings Festival 2-Day Pass', price: 120, condition: 'New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(1), eventDate: 'Feb 28–Mar 1', venue: 'Tempe Beach Park', description: 'Selling one 2-day GA pass. Price negotiable. Meet on campus for handoff.' },
  { id: 27, sellerId: 'user-2', category: 'Tickets', brand: 'Stand-up Comedy', title: 'John Mulaney – Phoenix', price: 75, condition: 'New', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), eventDate: 'Fri, Apr 4 · 8:00 PM', venue: 'Arizona Financial Theatre', description: 'Single ticket, lower bowl. Selling at face. E-transfer or Venmo.' },
  { id: 28, sellerId: 'user-2', category: 'Tickets', brand: 'Sports', title: 'Suns vs Lakers – 2 Tickets', price: 95, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(3), eventDate: 'Sun, Mar 9 · 6:00 PM', venue: 'Footprint Center, Phoenix', description: 'Pair of upper bowl tickets. Great view. Digital transfer.' },
  { id: 29, sellerId: 'user-2', category: 'Tickets', brand: 'Theater', title: 'Hamilton – Gammage', price: 110, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(5), eventDate: 'Sat, May 10 · 2:00 PM', venue: 'ASU Gammage', description: 'One orchestra seat. Must-see show. DM to coordinate.' },
];

export default function SellerProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  const sellerId = params.sellerId || '';
  const sellerName = params.sellerName || 'ASU Student';
  const livingCommunity = params.livingCommunity || '';
  const autoSelectId = params.autoSelectId ? parseInt(params.autoSelectId, 10) : null;
  const initialMode = params.initialMode === 'selection';

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(initialMode);
  const [selectedIds, setSelectedIds] = useState(autoSelectId ? [autoSelectId] : []);
  const [offerModalVisible, setOfferModalVisible] = useState(false);

  // Get all listings by this seller: by sellerId when provided, else by livingCommunity
  const sellerListings = useMemo(() => {
    if (sellerId) {
      return ALL_PRODUCTS.filter(
        (p) => p.sellerId === sellerId && (ENABLE_TICKETS || p.category !== 'Tickets')
      );
    }
    if (!livingCommunity) return [];
    return ALL_PRODUCTS.filter(
      (p) =>
        (p.livingCommunity === livingCommunity || p.location === livingCommunity) &&
        (ENABLE_TICKETS || p.category !== 'Tickets')
    );
  }, [sellerId, livingCommunity]);

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

  // Handle Submit Offer
  const handleOfferSubmit = (offerData) => {
    console.log('Bundle Offer Submitted:', offerData);
    setOfferModalVisible(false);
    setIsSelectionMode(false);
    setSelectedIds([]);
    
    // Navigate to chat or show success
    router.push({
      pathname: '/chat',
      params: {
        sellerId,
        offerData: JSON.stringify(offerData),
      },
    });
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: `${sellerName}'s More Listings` }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isSelectionMode && { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Listings Section */}
        <View style={styles.section}>
          {!isSelectionMode ? (
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
