import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useWishlist } from '../../../context/WishlistContext';
import { getTheme, ASU } from '../../../theme';
import ProductTile from '../../../components/ProductTile';

export default function MyWishlistScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  const { wishlistItems, isLoading } = useWishlist();
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['top', 'bottom']}>
        <View style={{ transform: [{ scale: 1.5 }] }}>
          {/* Use a simple ActivityIndicator or similar if available, or just Text for now */}
          <Text style={{ color: theme.text }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['top', 'bottom']}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart-outline" size={64} color={theme.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Save items you're interested in to easily find them later.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.browseButtonText}>Browse Marketplace</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'ios' ? 44 : 56) + 16 }]}>
        <View style={styles.productsGrid}>
          {wishlistItems.map((item) => (
            <ProductTile key={item.id} product={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 24,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: ASU.maroon,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
  },
  browseButtonText: {
    color: ASU.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
