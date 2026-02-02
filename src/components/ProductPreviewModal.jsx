import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme, ASU } from '../theme';

export default function ProductPreviewModal({
  product,
  visible,
  onClose,
}) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.previewOverlay}>
        <View style={styles.previewContainer}>
          <TouchableOpacity 
            style={styles.previewCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView bounces={false}>
            {product.images && product.images.length > 0 ? (
              <Image 
                source={typeof product.images[0] === 'string' ? { uri: product.images[0] } : product.images[0]} 
                style={styles.previewImage} 
              />
            ) : (
              <View style={[styles.previewImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={64} color={theme.textSecondary} />
              </View>
            )}

            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>{product.title}</Text>
                <Text style={styles.previewPrice}>${product.price}</Text>
              </View>
              
              <View style={styles.previewMeta}>
                 {product.condition && (
                   <View style={styles.conditionBadge}>
                     <Text style={styles.conditionText}>{product.condition}</Text>
                   </View>
                 )}
              </View>

              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.previewDescription}>
                {product.description || "No description provided."}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
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
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.border,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
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
});
