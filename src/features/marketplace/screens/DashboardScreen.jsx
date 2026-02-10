import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, ScrollView, Modal, Pressable, RefreshControl, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import ProductTile from '../../../components/ProductTile';
import ProductTileSkeleton from '../../../components/ProductTileSkeleton';
import CategoryChipSkeleton from '../../../components/CategoryChipSkeleton';
import EmptyMarketplacePlaceholder from '../components/EmptyMarketplacePlaceholder';
import NoSearchResults from '../components/NoSearchResults';
import { listingService } from '../../../services/ListingService';
import { useListings } from '../../../hooks/queries/useListingQueries';
import { supabase } from '../../../services/supabase';
import auth from '../../../services/firebaseAuth';

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

const LIVING_COMMUNITIES = [
  { id: 'hyve', label: 'The Hyve' },
  { id: 'paseo', label: 'Paseo on University' },
  { id: 'skye', label: 'Skye at McClintock' },
  { id: 'tooker', label: 'Tooker' },
  { id: 'villas', label: 'The Villas on Apache' },
  { id: 'union', label: 'Union Tempe' },
  { id: 'district', label: 'The District on Apache' },
];

import { useFilters } from '../../../context/FilterContext';

const CategoryListing = ({ 
  category, 
  index, 
  sortId, 
  searchQuery, 
  filters,
  theme,
  styles,
  onClearSearch,
  isVisible
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
    refetch
  } = useListings({
    limit: PAGE_SIZE,
    category: index === 0 ? null : category,
    sortBy: sortId,
    searchQuery: searchQuery,
    filters: filters
  }, {
    enabled: isVisible
  });

  const allProductsRaw = useMemo(() => data?.pages.flat() || [], [data]);

  const allProducts = useMemo(() => {
    let filtered = allProductsRaw;
    if (filters.length > 0) {
      filtered = allProductsRaw.filter(item => {
        if (!item.livingCommunity) return false;
        const community = LIVING_COMMUNITIES.find(c => c.label === item.livingCommunity);
        return community && filters.includes(community.id);
      });
    }
    return filtered;
  }, [allProductsRaw, filters]);

  const isLoading = isQueryLoading;
  const loadingMore = isFetchingNextPage;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  if (isLoading && allProducts.length === 0) {
    return (
      <View style={styles.productsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductTileSkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
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
        searchQuery ? (
          <NoSearchResults query={searchQuery} onClear={onClearSearch} />
        ) : (
          <EmptyMarketplacePlaceholder category={index === 0 ? null : category} />
        )
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    />
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { selectedLivingCommunities, setSelectedLivingCommunities } = useFilters();
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const topPadding = insets.top + headerHeight + 8;

  const [selectedCategory, setSelectedCategory] = useState(0); // 0 is always "All"
  const baseCategories = ['All', 'Furniture', 'Electronics', 'Escooters', 'Kitchen'];
  const categories = ENABLE_TICKETS ? [...baseCategories, 'Tickets'] : baseCategories;
  const [selectedSortId, setSelectedSortId] = useState('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const pagerRef = useRef(null);
  const categoryListRef = useRef(null);

  useEffect(() => {
    if (selectedCategory >= 0 && selectedCategory < categories.length) {
      categoryListRef.current?.scrollToIndex({
        index: selectedCategory,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedCategory, categories.length]);
  
  const handlePageSelected = (e) => {
    setSelectedCategory(e.nativeEvent.position);
  };

  const handleCategoryPress = (index) => {
    setSelectedCategory(index);
    pagerRef.current?.setPage(index);
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setSubmittedSearchQuery(searchQuery);
    setIsSearching(true);

    // Track Search Event
    if (searchQuery.trim()) {
      supabase.from('analytics_events').insert({
        event_type: 'search',
        event_data: { query: searchQuery },
        user_id: auth().currentUser?.uid || null
      }).then(({ error }) => {
        if (error) console.log('Analytics Insert Error:', error);
        else console.log('Search logged:', searchQuery);
      })
      .catch(err => console.log('Analytics error:', err));
    }
  };

  const handleClearSearch = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setSubmittedSearchQuery('');
    setIsSearching(false);
  };

  const removeFilter = (id) => {
    setSelectedLivingCommunities(prev => prev.filter(c => c !== id));
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
        <FlatList
          ref={categoryListRef}
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScrollView}
          keyExtractor={(item) => item}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              categoryListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
            });
          }}
          renderItem={({ item: category, index }) => {
            const isSelected = selectedCategory === index;
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedCategory(index);
                  pagerRef.current?.setPage(index);
                }}
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
          }}
        />

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
            style={[styles.iconButton, selectedLivingCommunities.length > 0 && styles.iconButtonActive]}
            onPress={() => router.push('/filters')}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={20} color={selectedLivingCommunities.length > 0 ? ASU.white : theme.text} />
            {selectedLivingCommunities.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selectedLivingCommunities.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {categories.map((category, index) => (
          <View key={index} style={{ flex: 1 }}>
            <CategoryListing
              category={category}
              index={index}
              sortId={selectedSortId}
              searchQuery={submittedSearchQuery}
              filters={selectedLivingCommunities}
              theme={theme}
              styles={styles}
              onClearSearch={handleClearSearch}
              isVisible={selectedCategory === index}
            />
          </View>
        ))}
      </PagerView>

      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
        statusBarTranslucent={true}
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
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: ASU.white,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.background,
  },
  badgeText: {
    color: ASU.maroon,
    fontSize: 10,
    fontWeight: '800',
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
