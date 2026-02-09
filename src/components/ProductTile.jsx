import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { getTheme, ASU } from '../theme';
import { formatRelativeTime, formatExpiryTime } from '../utils/dateUtils';
import auth from '../services/firebaseAuth';

export default function ProductTile({ product, style, onPress, disabled }) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  const isViewerSeller = product.sellerId === auth().currentUser?.uid;

  const handlePress = () => {
    if (onPress) {
      onPress(product);
      return;
    }
    if (product.sold) return;
    router.push({
      pathname: '/product-detail',
      params: {
        product: JSON.stringify(product),
      },
    });
  };

  const postedDate = formatRelativeTime(product.postedAt || product.createdAt);
  const isSold = !!product.sold;
  const styles = getStyles(theme);

  const firstImage = product.images?.[0];
  const thumbnailUri = firstImage
    ? (typeof firstImage === 'string' ? firstImage : firstImage.thumbnail?.uri ?? firstImage.originalUri)
    : null;

  return (
    <TouchableOpacity
      style={[styles.productTile, style, isSold && styles.productTileDisabled]}
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled !== undefined ? disabled : isSold}
    >
      <View style={styles.productImageContainer}>
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={ASU.gray4} />
          </View>
        )}
        {product.urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>URGENT</Text>
          </View>
        )}
        {product.sold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldBadgeText}>SOLD</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={[styles.productMeta, { justifyContent: 'space-between' }]}>
          <Text style={styles.productCondition}>{product.condition}</Text>
          {isViewerSeller && product.expiresAt && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={12} color={ASU.maroon} style={{ marginRight: 2 }} />
              <Text style={{ fontSize: 11, color: ASU.maroon, fontWeight: '600' }}>
                 {formatExpiryTime(product.expiresAt) === 'Expired' 
                   ? 'Expired' 
                   : formatExpiryTime(product.expiresAt)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${product.price}</Text>
          {postedDate && (
            <Text style={styles.postedDate}>{postedDate}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme) => StyleSheet.create({
  productTile: {
    width: '48%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productTileDisabled: {
    opacity: 0.6,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.background,
    position: 'relative',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
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
    backgroundColor: theme.border,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  productCondition: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
  },
  postedDate: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  soldBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primaryText,
    letterSpacing: 0.5,
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: ASU.orange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ASU.white,
    letterSpacing: 0.5,
  },
});
