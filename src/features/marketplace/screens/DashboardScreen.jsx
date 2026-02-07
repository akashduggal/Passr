import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, ScrollView, Modal, Pressable, RefreshControl, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import ProductTile from '../../../components/ProductTile';
import ProductTileSkeleton from '../../../components/ProductTileSkeleton';
import CategoryChipSkeleton from '../../../components/CategoryChipSkeleton';
import EmptyMarketplacePlaceholder from '../components/EmptyMarketplacePlaceholder';
import NoSearchResults from '../components/NoSearchResults';
import { listingService } from '../../../services/ListingService';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const CATEGORY_ICONS = {
  'All': 'apps-outline',
  'Furniture': 'bed-outline',
  'Electronics': 'desktop-outline',
  'Escooters': 'bicycle-outline',
  'Kitchen': 'restaurant-outline',
  'Tickets': 'ticket-outline',
};

const PAGE_SIZE = 10;

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const topPadding = insets.top + headerHeight + 8;

  const [selectedCategory, setSelectedCategory] = useState(0); // 0 is always "All"
  const baseCategories = ['All', 'Furniture', 'Electronics', 'Escooters', 'Kitchen'];
  const categories = ENABLE_TICKETS ? [...baseCategories, 'Tickets'] : baseCategories;
  const [selectedSortId, setSelectedSortId] = useState('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination State
  const [allProducts, setAllProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setSubmittedSearchQuery(searchQuery);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setSubmittedSearchQuery('');
    setIsSearching(false);
  };

  const fetchListings = useCallback(async (reset = false) => {
    if (loadingMore) return;
    
    const nextPage = reset ? 1 : page + 1;
    if (!reset && !hasMore) return;

    if (reset) {
      setIsLoading(true);
      setAllProducts([]); // Clear current products to show skeletons
    } else {
      setLoadingMore(true);
    }

    try {
      if (reset) await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      
      const categoryName = categories[selectedCategory];
      // If "All" is selected (index 0), send null/undefined to backend to search everything
      const categoryParam = selectedCategory === 0 ? null : categoryName;
      
      const data = await listingService.getAllListings(nextPage, PAGE_SIZE, categoryParam, selectedSortId, submittedSearchQuery);
      
      if (reset) {
        setAllProducts(data);
        setPage(1);
      } else {
        setAllProducts(prev => [...prev, ...data]);
        setPage(nextPage);
      }
      
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      if (reset) setIsRefreshing(false);
      if (reset && submittedSearchQuery) setIsSearching(false);
    }
  }, [selectedCategory, selectedSortId, page, hasMore, loadingMore, categories, submittedSearchQuery]);

  // Initial load and filter change
  useEffect(() => {
    fetchListings(true);
  }, [selectedCategory, selectedSortId, submittedSearchQuery]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchListings(true);
  }, [fetchListings]);

  const loadMore = () => {
    if (!isLoading && !loadingMore && hasMore) {
      fetchListings(false);
    }
  };

  const getCategoryContent = (index) => {
    // 0 is "All", so we shift the map or handle "All" explicitly
    if (index === 0) return { title: 'Marketplace', subtitle: 'Browse all listings' };
    
    const contentMap = {
      1: { title: 'Furniture', subtitle: 'Browse furniture listings' },
      2: { title: 'Electronics', subtitle: 'Find electronics and gadgets' },
      3: { title: 'Escooters', subtitle: 'Explore electric scooters' },
      4: { title: 'Kitchen', subtitle: 'Discover kitchen items' },
      5: { title: 'Tickets', subtitle: 'Concerts, festivals, comedy & more' },
    };
    return contentMap[index] || contentMap[0];
  };

  const selectedSortLabel = SORT_OPTIONS.find((o) => o.id === selectedSortId)?.label ?? SORT_OPTIONS[0].label;
  const bottomInset = insets.bottom;

  // ... (existing code)

  const styles = getStyles(theme, bottomInset);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.headerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScrollView}
        >
        {/* Chips should not show skeletons during standard loading/refreshing to avoid flickering UI */}
        {categories.map((category, index) => {
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
              <Ionicons 
                name={CATEGORY_ICONS[category] || 'pricetag-outline'} 
                size={16} 
                color={isSelected ? ASU.white : theme.text} 
                style={{ marginRight: 6 }}
              />
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
        })}
        </ScrollView>

        <View style={styles.searchRow}>
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
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color={theme.placeholder} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.iconButton, selectedSortId !== 'newest' && styles.iconButtonActive]} 
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="swap-vertical" 
              size={20} 
              color={selectedSortId !== 'newest' ? ASU.white : theme.text} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/filters')}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading && allProducts.length === 0 ? (
         <View style={styles.productsGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductTileSkeleton key={i} />
            ))}
         </View>
      ) : (
        <FlatList
          data={allProducts}
          renderItem={({ item }) => <ProductTile product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.contentContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            submittedSearchQuery ? (
              <NoSearchResults query={submittedSearchQuery} onClear={handleClearSearch} />
            ) : (
              <EmptyMarketplacePlaceholder category={selectedCategory === 0 ? null : categories[selectedCategory]} />
            )
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
        />
      )}

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
    </View>
  );
}

const getStyles = (theme, bottomInset) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 4,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Bottom sheet style
  },
  sortModalContent: {
    width: '100%',
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : (24 + (bottomInset > 0 ? bottomInset : 16)), // Add extra padding for Android nav bar
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sortModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sortOptionSelected: {
    backgroundColor: theme.surfaceHighlight || '#F5F5F5', // Light background for selected
    borderBottomWidth: 0, // Remove old border
  },
  sortOptionText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  sortOptionTextSelected: {
    color: ASU.maroon,
    fontWeight: '700',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.background,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 24, // More rounded for modern look
    paddingHorizontal: 16,
    height: 48,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconButtonActive: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    height: '100%',
    fontWeight: '500',
  },
  chipsScrollView: {
    maxHeight: 40,
    marginBottom: 16,
  },
  chipsContainer: {
    paddingRight: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
