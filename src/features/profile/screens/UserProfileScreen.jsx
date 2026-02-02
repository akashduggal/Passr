import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '../../../services/firebaseAuth';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

const appName = Constants.expoConfig?.name ?? 'Passr';
const appVersion = Constants.expoConfig?.version ?? '1.0.0';

export default function UserProfileScreen({ isTab = false }) {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getTheme(isDarkMode);

  const featureCards = [
    {
      id: 'listings',
      title: 'My Listings',
      description: 'View Your Uploaded Listings',
      icon: 'document-text-outline',
      backgroundColor: ASU.gray6,
      iconColor: ASU.maroon,
      route: '/profile/my-listings',
    },
    {
      id: 'faqs',
      title: 'FAQs',
      description: 'Coming soon',
      icon: 'help-circle-outline',
      backgroundColor: ASU.gray6,
      iconColor: ASU.maroon,
      route: null,
    },
    // {
    //   id: 'messages',
    //   title: 'Messages',
    //   description: 'All your messages in one place',
    //   icon: 'chatbubble-outline',
    //   backgroundColor: ASU.gray6,
    //   iconColor: ASU.blue,
    //   route: '/profile/messages',
    // },
    {
      id: 'offers',
      title: 'Offers',
      description: 'View your offers and their status',
      icon: 'cash-outline',
      backgroundColor: ASU.gray6,
      iconColor: ASU.pink,
      route: '/profile/past-orders',
    },
    {
      id: 'wishlist',
      title: 'My Wishlist',
      description: 'Find your saved items',
      icon: 'heart-outline',
      backgroundColor: ASU.gray6,
      iconColor: ASU.orange,
      route: '/profile/my-wishlist',
    },
  ];

  const navItems = [
    { id: 'notifications', title: 'Notification Settings', icon: 'notifications-outline', route: '/profile/notification-settings' },
    { id: 'privacy', title: 'Privacy and Data', icon: 'lock-closed-outline', route: null },
    { id: 'support', title: 'Support', icon: 'headset-outline', route: '/profile/support' },
  ];

  // Dark mode toggle item
  const darkModeItem = {
    id: 'darkMode',
    title: 'Dark Mode',
    icon: isDarkMode ? 'moon' : 'moon-outline',
  };

  const styles = getStyles(theme, insets, isTab);
  const hasSingleFeature = featureCards.length === 1;
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;

  return (
    <View style={styles.container}>
      {/* Header Section with Purple Background - Only show if NOT in tab mode */}
      {!isTab && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>John Doe</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={ASU.white} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTab && { paddingTop: insets.top + headerHeight + 8 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Core Features Grid */}
        <View style={styles.featuresGrid}>
          {featureCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.featureCard,
                hasSingleFeature && styles.featureCardSingle,
                { backgroundColor: isDarkMode ? theme.surface : card.backgroundColor },
              ]}
              activeOpacity={0.8}
              onPress={() => { if (card.route) router.push(card.route); }}
            >
              <Ionicons
                name={card.icon}
                size={32}
                color={card.iconColor}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Navigation List */}
        <View style={[styles.navList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                { borderBottomColor: theme.border },
                index === navItems.length - 1 && styles.navItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.route) {
                  router.push(item.route);
                }
              }}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={theme.text}
                style={styles.navIcon}
              />
              <Text style={[styles.navText, { color: theme.text }]}>{item.title}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textSecondary}
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}
          
          {/* Dark Mode Toggle */}
          <View style={[styles.navItem, { borderBottomColor: theme.border }]}>
            <Ionicons
              name={darkModeItem.icon}
              size={24}
              color={theme.text}
              style={styles.navIcon}
            />
            <Text style={[styles.navText, { color: theme.text }]}>{darkModeItem.title}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: ASU.gray5, true: ASU.maroon + '80' }}
              thumbColor={isDarkMode ? ASU.maroon : ASU.gray4}
              ios_backgroundColor={ASU.gray5}
            />
          </View>
        </View>

        {/* App name & version footer - sticky at bottom */}
        <View style={[styles.appFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.appFooterName}>{appName}</Text>
          <Text style={styles.appFooterVersion}>Version {appVersion}</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (theme, insets, isTab) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: ASU.maroon,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASU.white,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ASU.maroon,
    borderWidth: 2,
    borderColor: ASU.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 140,
  },
  featureCardSingle: {
    width: '100%',
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  navList: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  navItemLast: {
    borderBottomWidth: 0,
  },
  navIcon: {
    marginRight: 16,
  },
  navText: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  appFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    backgroundColor: theme.background,
  },
  appFooterName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  appFooterVersion: {
    fontSize: 13,
    color: theme.textSecondary,
    opacity: 0.8,
  },
});
