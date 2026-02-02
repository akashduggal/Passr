import { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import ProductTile from '../../../components/ProductTile';
import ProductTileSkeleton from '../../../components/ProductTileSkeleton';

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // Helper to create dates relative to today
  const getDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  // Placeholder product data. sellerId 'user-1' = current user (John); others = other sellers.
  const baseProducts = [
    // Furniture — 1,2 current user
    { id: 1, sellerId: 'user-1', category: 'Furniture', brand: 'IKEA', title: 'Office Desk Chair', price: 45, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), sold: true, description: 'Comfortable ergonomic office chair in excellent condition. Perfect for studying or working from home. Adjustable height and back support.' },
    { id: 2, sellerId: 'user-1', category: 'Furniture', brand: 'Wayfair', title: 'Coffee Table', price: 80, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), urgent: true, description: 'Modern coffee table with storage shelf. Some minor scratches but overall in good condition. Great for dorm or apartment.' },
    { id: 3, sellerId: 'user-2', category: 'Furniture', brand: 'Target', title: 'Bookshelf', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(2), description: '5-shelf wooden bookshelf. Shows some wear but still functional. Perfect for organizing textbooks and supplies.' },
    { id: 4, sellerId: 'user-2', category: 'Furniture', brand: 'West Elm', title: 'Dining Table Set', price: 120, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(5), description: 'Complete dining table with 4 chairs. Barely used, in excellent condition. Perfect for shared living spaces.' },
    { id: 5, sellerId: 'user-2', category: 'Furniture', brand: 'Other', title: 'Study Lamp', price: 15, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(7), urgent: true, description: 'Adjustable desk lamp with LED lighting. Great for late-night study sessions.' },
    { id: 6, sellerId: 'user-2', category: 'Furniture', brand: 'IKEA', title: 'Desk Organizer', price: 20, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(14), description: 'Brand new desk organizer with multiple compartments. Keep your workspace tidy and organized.' },
    // Electronics — 7 current user
    { id: 7, sellerId: 'user-1', category: 'Electronics', brand: 'Apple', title: 'MacBook Pro 13"', price: 850, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(0), sold: true, description: '2020 MacBook Pro 13" with M1 chip. Excellent condition, barely used. Includes charger and original box. Perfect for students.' },
    { id: 8, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'iPhone 13', price: 450, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(1), description: 'iPhone 13 in good working condition. Minor scratches on screen protector. Battery health at 87%. Includes charger.' },
    { id: 9, sellerId: 'user-2', category: 'Electronics', brand: 'Samsung', title: 'Samsung Monitor 27"', price: 180, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(3), description: '27" Samsung 4K monitor. Excellent for coding, design work, or gaming. Like new condition with original packaging.' },
    { id: 10, sellerId: 'user-2', category: 'Electronics', brand: 'Apple', title: 'AirPods Pro', price: 120, condition: 'New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(8), urgent: true, description: 'Brand new AirPods Pro, still sealed in box. Perfect for studying or commuting around campus.' },
    { id: 11, sellerId: 'user-2', category: 'Electronics', brand: 'Other', title: 'Gaming Keyboard', price: 65, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(15), description: 'Mechanical gaming keyboard with RGB lighting. Great for gaming or coding. Some keycaps show light wear.' },
    { id: 12, sellerId: 'user-2', category: 'Electronics', brand: 'Dell', title: 'Wireless Mouse', price: 25, condition: 'Fair', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(21), description: 'Wireless mouse in working condition. Some cosmetic wear but fully functional. Great for laptops.' },
    // Escooters
    { id: 13, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi Mi Electric Scooter', price: 350, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Xiaomi Mi Electric Scooter in excellent condition. Perfect for getting around campus quickly. Max speed 15.5 mph, 18.6 mile range.' },
    { id: 14, sellerId: 'user-2', category: 'Escooters', brand: 'Segway', title: 'Segway Ninebot E25', price: 420, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'The Villas on Apache', postedAt: getDate(1), description: 'Segway Ninebot E25 electric scooter. Great condition with some minor scuffs. Reliable transportation for campus.' },
    { id: 15, sellerId: 'user-2', category: 'Escooters', brand: 'Razor', title: 'Razor E300', price: 180, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(4), description: 'Razor E300 electric scooter. Shows some wear but runs well. Good starter scooter for campus commuting.' },
    { id: 16, sellerId: 'user-2', category: 'Escooters', brand: 'Gotrax', title: 'Gotrax GXL V2', price: 280, condition: 'Like New', location: 'West Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(9), description: 'Gotrax GXL V2 in like-new condition. Powerful motor, good battery life. Perfect for longer commutes.' },
    { id: 17, sellerId: 'user-2', category: 'Escooters', brand: 'Hiboy', title: 'Hiboy S2 Pro', price: 320, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(16), description: 'Brand new Hiboy S2 Pro electric scooter. Never used, still in original packaging. Great deal!' },
    { id: 18, sellerId: 'user-2', category: 'Escooters', brand: 'Xiaomi', title: 'Xiaomi M365', price: 250, condition: 'Good', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(30), description: 'Xiaomi M365 electric scooter in good working condition. Reliable and efficient for daily campus use.' },
    // Kitchen
    { id: 19, sellerId: 'user-2', category: 'Kitchen', brand: 'Instant Pot', title: 'Instant Pot Duo', price: 80, condition: 'Like New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), description: 'Instant Pot Duo 6-quart pressure cooker. Barely used, in excellent condition. Perfect for dorm cooking.' },
    { id: 20, sellerId: 'user-2', category: 'Kitchen', brand: 'KitchenAid', title: 'KitchenAid Stand Mixer', price: 200, condition: 'Good', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), description: 'KitchenAid stand mixer in good condition. Works perfectly, some cosmetic wear. Great for baking enthusiasts.' },
    { id: 21, sellerId: 'user-2', category: 'Kitchen', brand: 'Hamilton Beach', title: 'Coffee Maker', price: 35, condition: 'Fair', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(6), description: 'Basic coffee maker in working condition. Perfect for morning coffee before class. Shows some wear but functional.' },
    { id: 22, sellerId: 'user-2', category: 'Kitchen', brand: 'Ninja', title: 'Air Fryer', price: 60, condition: 'Like New', location: 'West Campus', livingCommunity: 'The District on Apache', postedAt: getDate(10), description: 'Air fryer in like-new condition. Healthy cooking option for dorm or apartment. Barely used.' },
    { id: 23, sellerId: 'user-2', category: 'Kitchen', brand: 'Cuisinart', title: 'Blender', price: 40, condition: 'Good', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(18), description: 'Blender in good working condition. Perfect for smoothies and shakes. Some cosmetic wear but fully functional.' },
    { id: 24, sellerId: 'user-2', category: 'Kitchen', brand: 'Other', title: 'Cutting Board Set', price: 25, condition: 'New', location: 'Polytechnic', livingCommunity: 'Union Tempe', postedAt: getDate(60), description: 'Brand new cutting board set with multiple sizes. Never used, still in packaging. Essential kitchen accessory.' },
  ];

  const ticketProducts = [
    { id: 25, sellerId: 'user-1', category: 'Tickets', brand: 'Concert', title: 'Taylor Swift – Eras Tour', price: 185, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(0), eventDate: 'Sat, Mar 15 · 7:00 PM', venue: 'State Farm Stadium, Glendale', description: '2 GA floor tickets for Eras Tour. Can’t make it anymore. Face value. Transfer via Ticketmaster.' },
    { id: 26, sellerId: 'user-2', category: 'Tickets', brand: 'Music Festival', title: 'INnings Festival 2-Day Pass', price: 120, condition: 'New', location: 'Tempe Campus', livingCommunity: 'The Hyve', postedAt: getDate(1), eventDate: 'Feb 28–Mar 1', venue: 'Tempe Beach Park', description: 'Selling one 2-day GA pass. Price negotiable. Meet on campus for handoff.' },
    { id: 27, sellerId: 'user-2', category: 'Tickets', brand: 'Stand-up Comedy', title: 'John Mulaney – Phoenix', price: 75, condition: 'New', location: 'Downtown Phoenix', livingCommunity: 'Paseo on University', postedAt: getDate(2), eventDate: 'Fri, Apr 4 · 8:00 PM', venue: 'Arizona Financial Theatre', description: 'Single ticket, lower bowl. Selling at face. E-transfer or Venmo.' },
    { id: 28, sellerId: 'user-2', category: 'Tickets', brand: 'Sports', title: 'Suns vs Lakers – 2 Tickets', price: 95, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Skye at McClintock', postedAt: getDate(3), eventDate: 'Sun, Mar 9 · 6:00 PM', venue: 'Footprint Center, Phoenix', description: 'Pair of upper bowl tickets. Great view. Digital transfer.' },
    { id: 29, sellerId: 'user-2', category: 'Tickets', brand: 'Theater', title: 'Hamilton – Gammage', price: 110, condition: 'New', location: 'Tempe Campus', livingCommunity: 'Tooker', postedAt: getDate(5), eventDate: 'Sat, May 10 · 2:00 PM', venue: 'ASU Gammage', description: 'One orchestra seat. Must-see show. DM to coordinate.' },
  ];

  const allProducts = ENABLE_TICKETS ? [...baseProducts, ...ticketProducts] : baseProducts;

  const sortedProducts = useMemo(() => {
    const selectedCategoryName = categories[selectedCategory];
    // Filter products by selected category
    const filteredProducts = allProducts.filter(
      (product) => product.category === selectedCategoryName
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
  }, [selectedCategory, selectedSortId, categories]);


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
      </View>
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
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
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
