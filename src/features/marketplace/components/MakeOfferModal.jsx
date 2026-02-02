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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

const { width: screenWidth } = Dimensions.get('window');

export default function MakeOfferModal({
  visible,
  onClose,
  product,
  sellerListings = [],
  onSubmit,
}) {
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
      setSelectedProductIds([product.id]);
      setOfferPrice('');
      setMessage('');
      setPreviewProduct(null);
    }
  }, [visible, product]);

  const toggleSelection = (id) => {
    // Prevent deselecting the main product (optional rule, but makes sense for "making an offer on THIS product")
    if (id === product.id) return;

    setSelectedProductIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Combine current product and other listings for display
  const allAvailableProducts = useMemo(() => {
    if (!product) return [];
    return [product, ...sellerListings];
  }, [product, sellerListings]);

  // Calculate total listing price of selected items
  const totalListingPrice = useMemo(() => {
    return allAvailableProducts
      .filter((p) => selectedProductIds.includes(p.id))
      .reduce((sum, p) => sum + (p.price || 0), 0);
  }, [allAvailableProducts, selectedProductIds]);

  const handleSubmit = () => {
    if (!offerPrice) return;
    
    const bundleItems = allAvailableProducts.filter(p => selectedProductIds.includes(p.id));
    
    onSubmit({
      items: bundleItems,
      totalOfferAmount: parseFloat(offerPrice),
      message,
    });
    onClose();
  };

  if (!product) return null;

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
              {/* Main Product & Bundle Selection */}
              <Text style={styles.sectionTitle}>
                {sellerListings.length > 0 
                  ? "Select items to bundle (optional)" 
                  : "Item"}
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.listingsScroll}
              >
                {allAvailableProducts.map((item) => {
                  const isSelected = selectedProductIds.includes(item.id);
                  const isMain = item.id === product.id;
                  const imageSource = item.images && item.images.length > 0 
                    ? (typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0])
                    : null;

                  return (
                    <View key={item.id} style={[styles.productCardWrapper, isSelected && styles.productCardSelectedWrapper]}>
                      <TouchableOpacity
                        style={styles.productCardContent}
                        onPress={() => toggleSelection(item.id)}
                        activeOpacity={0.8}
                        disabled={isMain} // Disable toggling off the main item
                      >
                        <View style={styles.imageContainer}>
                          {imageSource ? (
                            <Image source={imageSource} style={styles.productImage} />
                          ) : (
                            <View style={[styles.productImage, styles.placeholderImage]}>
                              <Ionicons name="image-outline" size={24} color={theme.textSecondary} />
                            </View>
                          )}
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <Ionicons name="checkmark-circle" size={24} color={ASU.maroon} />
                            </View>
                          )}
                          
                          {/* Quick View Button */}
                          <TouchableOpacity 
                            style={styles.quickViewButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              setPreviewProduct(item);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="eye" size={16} color="#fff" />
                          </TouchableOpacity>
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

              {/* Summary */}
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
      <Modal
        visible={!!previewProduct}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPreviewProduct(null)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewContainer}>
            <TouchableOpacity 
              style={styles.previewCloseButton}
              onPress={() => setPreviewProduct(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <ScrollView bounces={false}>
              {previewProduct && previewProduct.images && previewProduct.images.length > 0 ? (
                <Image 
                  source={typeof previewProduct.images[0] === 'string' ? { uri: previewProduct.images[0] } : previewProduct.images[0]} 
                  style={styles.previewImage} 
                />
              ) : (
                <View style={[styles.previewImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={64} color={theme.textSecondary} />
                </View>
              )}

              <View style={styles.previewContent}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>{previewProduct?.title}</Text>
                  <Text style={styles.previewPrice}>${previewProduct?.price}</Text>
                </View>
                
                <View style={styles.previewMeta}>
                   {previewProduct?.condition && (
                     <View style={styles.conditionBadge}>
                       <Text style={styles.conditionText}>{previewProduct.condition}</Text>
                     </View>
                   )}
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.previewDescription}>
                  {previewProduct?.description || "No description provided."}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: theme.background,
  },
  productCardSelectedWrapper: {
    borderColor: ASU.maroon,
    backgroundColor: theme.surface,
  },
  productCardContent: {
    padding: 8,
  },
  quickViewButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewContainer: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: theme.surface,
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  previewContent: {
    padding: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
    marginRight: 12,
  },
  previewPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: ASU.maroon,
  },
  previewMeta: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  conditionBadge: {
    backgroundColor: theme.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  conditionText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  previewCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
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
  checkmarkContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
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
