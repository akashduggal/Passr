import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, ScrollView, Modal, Pressable, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import ProductTile from '../../../components/ProductTile';
import ProductTileSkeleton from '../../../components/ProductTileSkeleton';
import CategoryChipSkeleton from '../../../components/CategoryChipSkeleton';
import SortFilterSkeleton from '../../../components/SortFilterSkeleton';
import { listingService } from '../../../services/ListingService';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const topPadding = insets.top + headerHeight + 8;

  const baseCategories = ['Furniture', 'Electronics', 'Escooters', 'Kitchen'];
  const categories = ENABLE_TICKETS ? [...baseCategories, 'Tickets'] : baseCategories;
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSortId, setSelectedSortId] = useState('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const fetchListings = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      // Add artificial delay for mocking loading state
      if (showLoader) await new Promise(resolve => setTimeout(resolve, 1500));
      const data = await listingService.getAllListings();
      setAllProducts(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchListings(false);
    setIsRefreshing(false);
  }, [fetchListings]);

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings])
  );

  const getCategoryContent = (index) => {
    const contentMap = {
      0: { title: 'Furniture', subtitle: 'Browse furniture listings' },
      1: { title: 'Electronics', subtitle: 'Find electronics and gadgets' },
      2: { title: 'Escooters', subtitle: 'Explore electric scooters' },
      3: { title: 'Kitchen', subtitle: 'Discover kitchen items' },
      4: { title: 'Tickets', subtitle: 'Concerts, festivals, comedy & more' },
    };
    return contentMap[index] || contentMap[0];
  };

  const categoryContent = getCategoryContent(selectedCategory);

  const selectedSortLabel = SORT_OPTIONS.find((o) => o.id === selectedSortId)?.label ?? SORT_OPTIONS[0].label;

  const sortedProducts = useMemo(() => {
    const selectedCategoryName = categories[selectedCategory];
    // Filter products by selected category and exclude sold items
    const filteredProducts = allProducts.filter(
      (product) => product.category === selectedCategoryName && !product.sold
    );
    // Sort filtered products
    const arr = [...filteredProducts];
    switch (selectedSortId) {
      case 'price_asc':
        return arr.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return arr.sort((a, b) => b.price - a.price);
      case 'newest':
        return arr.sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
      default:
        return arr;
    }
  }, [selectedCategory, selectedSortId, categories, allProducts]);


  const styles = getStyles(theme);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.searchAndChips}>
        <View style={styles.searchBarWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={theme.placeholder}
            editable
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScrollView}
        >
        {isLoading ? (
          // Show 4 skeleton chips while loading
          [...Array(4)].map((_, index) => (
            <CategoryChipSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          categories.map((category, index) => {
            const isSelected = selectedCategory === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(index)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
        </ScrollView>
      </View>
      {isLoading ? (
        <SortFilterSkeleton />
      ) : (
        <View style={styles.sortFilterBar}>
          <TouchableOpacity
            style={styles.sortDropdown}
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.sortDropdownLabel}>Sort by</Text>
            <View style={styles.sortDropdownValue}>
              <Text style={styles.sortDropdownValueText} numberOfLines={1}>
                {selectedSortLabel}
              </Text>
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push('/filters')}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={20} color={theme.text} />
            <Text style={styles.filterButtonLabel}>Filter</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <Modal
          visible={sortModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSortModalVisible(false)}
        >
          <Pressable style={styles.sortModalOverlay} onPress={() => setSortModalVisible(false)}>
            <TouchableOpacity
              style={styles.sortModalContent}
              activeOpacity={1}
              onPress={() => {}}
            >
              <View style={styles.sortModalHeader}>
                <Text style={styles.sortModalTitle}>Sort by</Text>
                <TouchableOpacity onPress={() => setSortModalVisible(false)} hitSlop={12}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortOption, selectedSortId === opt.id && styles.sortOptionSelected]}
                  onPress={() => {
                    setSelectedSortId(opt.id);
                    setSortModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortOptionText, selectedSortId === opt.id && styles.sortOptionTextSelected]}>
                    {opt.label}
                  </Text>
                  {selectedSortId === opt.id && (
                    <Ionicons name="checkmark" size={20} color={ASU.maroon} />
                  )}
                </TouchableOpacity>
              ))}
            </TouchableOpacity>
          </Pressable>
        </Modal>
        <View style={styles.productsGrid}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ProductTileSkeleton key={i} />
            ))
          ) : (
            sortedProducts.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  sortFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 12,
    backgroundColor: theme.background,
    zIndex: 10,
  },
  sortDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
  },
  sortDropdownLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginRight: 8,
  },
  sortDropdownValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortDropdownValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    gap: 6,
  },
  filterButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sortModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
  },
  sortModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sortOptionText: {
    fontSize: 16,
    color: theme.text,
  },
  sortOptionSelected: {
    borderBottomColor: ASU.maroon,
  },
  sortOptionTextSelected: {
    color: ASU.maroon,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchAndChips: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: theme.background,
    zIndex: 10,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    height: '100%',
  },
  chipsScrollView: {
    maxHeight: 40,
  },
  chipsContainer: {
    paddingRight: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipSelected: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  chipTextSelected: {
    color: ASU.white,
  },
});
