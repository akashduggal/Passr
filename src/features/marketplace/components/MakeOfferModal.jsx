import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { getSellerName } from '../../../constants/currentUser';
import ProductPreviewModal from '../../../components/ProductPreviewModal';

const { width: screenWidth } = Dimensions.get('window');

export default function MakeOfferModal({
  visible,
  onClose,
  product,
  sellerListings = [],
  initialSelectedIds = [],
  onSubmit,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, insets);

  // Track selected product IDs for the bundle.
  // Initially, only the current product is selected.
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  
  // Product to be previewed in the nested modal
  const [previewProduct, setPreviewProduct] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible && product) {
      // If initialSelectedIds are provided, use them. 
      // Otherwise default to just the main product.
      if (initialSelectedIds && initialSelectedIds.length > 0) {
         setSelectedProductIds(initialSelectedIds);
      } else {
         setSelectedProductIds([product.id]);
      }
      setMessage('');
      setPreviewProduct(null);
    }
  }, [visible]); // Only run when visibility changes, not when product/ids reference changes during render

  const allAvailableProducts = useMemo(() => {
    if (!product) return [];
    // Ensure uniqueness by filtering out the main product from sellerListings if present
    const otherListings = sellerListings.filter(p => p.id !== product.id);
    return [product, ...otherListings];
  }, [product, sellerListings]);

  // Get only the selected products
  const selectedItems = useMemo(() => {
    // If we have explicit initial selections, use those
    if (initialSelectedIds && initialSelectedIds.length > 0) {
      // Combine product + sellerListings to find the full objects
      const allItems = [product, ...sellerListings];
      // Filter for unique items by ID
      const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
      return uniqueItems.filter(p => initialSelectedIds.includes(p.id));
    }
    // Otherwise just the main product
    return [product];
  }, [product, sellerListings, initialSelectedIds]);

  // Calculate total listing price of selected items
  const totalListingPrice = useMemo(() => {
    return selectedItems.reduce((sum, p) => sum + (p.price || 0), 0);
  }, [selectedItems]);

  // Update offer price when selection changes or modal opens
  useEffect(() => {
    if (visible) {
      setOfferPrice(totalListingPrice > 0 ? totalListingPrice.toString() : '');
    }
  }, [totalListingPrice, visible]);

  const handleBundlePromoPress = () => {
    onClose();
    router.push({
      pathname: '/seller-profile',
      params: {
        sellerId: product.sellerId || '',
        sellerName: getSellerName(product.sellerId),
        livingCommunity: product.livingCommunity || '',
        autoSelectId: product.id,
        initialMode: 'selection',
      },
    });
  };

  const handleSubmit = () => {
    if (!offerPrice) return;
    
    onSubmit({
      items: selectedItems,
      totalOfferAmount: parseFloat(offerPrice),
      message,
    });
    onClose();
  };

  if (!product) return null;

  // Determine context
  const isBundleFlow = initialSelectedIds && initialSelectedIds.length > 0;

  // Check if we should show the bundle promo
  // Show if:
  // 1. Not in bundle flow (opened from Product Detail)
  // 2. The seller has other listings available (that are not already selected)
  const showBundlePromo = useMemo(() => {
    if (isBundleFlow) return false;

    // Combine all potential items
    const allItems = [product, ...sellerListings];
    const uniqueAllIds = new Set(allItems.map(item => item.id));
    
    // If total unique items > selected items (which is 1), then there are others
    return uniqueAllIds.size > 1;
  }, [isBundleFlow, product, sellerListings]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
              {/* Selected Items List */}
              <Text style={styles.sectionTitle}>
                {selectedItems.length > 1 ? 'Items in this bundle' : 'Item'}
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.listingsScroll}
              >
                {selectedItems.map((item) => {
                  const imageSource = item.images && item.images.length > 0 
                    ? (typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0])
                    : null;

                  return (
                    <View key={item.id} style={[styles.productCardWrapper, styles.productCardReadOnly]}>
                      <TouchableOpacity
                        style={styles.productCardContent}
                        activeOpacity={1}
                      >
                        <View style={styles.imageContainer}>
                          {imageSource ? (
                            <Image source={imageSource} style={styles.productImage} />
                          ) : (
                            <View style={[styles.productImage, styles.placeholderImage]}>
                              <Ionicons name="image-outline" size={24} color={theme.textSecondary} />
                            </View>
                          )}
                        </View>
                        <View style={styles.productInfo}>
                          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.productPrice}>${item.price}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Bundle & Save Promo */}
              {showBundlePromo && (
                <TouchableOpacity 
                  style={styles.bundlePromo} 
                  onPress={handleBundlePromoPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.bundleIconCircle}>
                    <Ionicons name="layers" size={24} color={ASU.maroon} />
                  </View>
                  <View style={styles.bundlePromoText}>
                    <Text style={styles.bundlePromoTitle}>Bundle & Save</Text>
                    <Text style={styles.bundlePromoSubtitle}>
                      Shop {sellerListings.length} other items from {getSellerName(product.sellerId)} to save.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              )}

              {/* Summary - Only show if from Seller Profile (Bundle Flow) */}
              {isBundleFlow && (
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Selected Items:</Text>
                    <Text style={styles.summaryValue}>{selectedProductIds.length}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Listing Price:</Text>
                    <Text style={styles.summaryValue}>${totalListingPrice}</Text>
                  </View>
                </View>
              )}

              {/* Offer Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Your Offer</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={offerPrice}
                    onChangeText={setOfferPrice}
                    autoFocus={false}
                  />
                </View>
              </View>

              {/* Message Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Message (Optional)</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Hi, I'm interested in this bundle..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              {/* Warning/Info */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
                <Text style={styles.infoText}>
                  Offers are binding. The seller will be notified immediately.
                </Text>
              </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !offerPrice && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!offerPrice}
              >
                <Text style={styles.submitButtonText}>
                  Send Offer {offerPrice ? `$${offerPrice}` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Product Preview Modal */}
      <ProductPreviewModal
        visible={!!previewProduct}
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </Modal>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%', // Take up most of the screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  listingsScroll: {
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  productCardWrapper: {
    width: 150,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    backgroundColor: theme.background,
  },
  productCardReadOnly: {
    opacity: 0.9,
  },
  productCardContent: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: theme.surface,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.border,
  },
  productInfo: {
    gap: 2,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  bundlePromo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceHighlight || '#F9F9F9',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ASU.gold,
    marginBottom: 24,
  },
  bundleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${ASU.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bundlePromoText: {
    flex: 1,
  },
  bundlePromoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ASU.maroon,
    marginBottom: 2,
  },
  bundlePromoSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  summaryContainer: {
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.border,
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
    padding: 0,
  },
  messageInput: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.textSecondary,
  },
  footer: {
    padding: 20,
    paddingBottom: insets.bottom + 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  submitButton: {
    backgroundColor: ASU.maroon,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: ASU.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
