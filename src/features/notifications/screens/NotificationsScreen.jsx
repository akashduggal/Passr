import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../../../context/NotificationContext';
import { getTheme, ASU } from '../../../theme';

const NOTIFICATION_TYPES = {
  offer: {
    icon: 'cash-outline',
    iconColor: ASU.pink,
    iconBg: ASU.pink + '18',
  },
  offer_accepted: {
    icon: 'checkmark-circle-outline',
    iconColor: ASU.green,
    iconBg: ASU.green + '18',
  },
  offer_rejected: {
    icon: 'close-circle-outline',
    iconColor: ASU.error,
    iconBg: ASU.error + '18',
  },
  message: {
    icon: 'chatbubble-outline',
    iconColor: ASU.blue,
    iconBg: ASU.blue + '18',
  },
  pickup_scheduled: {
    icon: 'calendar-outline',
    iconColor: ASU.info,
    iconBg: ASU.info + '18',
  },
};

function formatTime(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getSectionLabel(dateInput) {
  const now = new Date();
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  const { notifications, markAsRead, loading, fetchNotifications } = useNotifications();

  const grouped = useMemo(() => {
    // Notifications are already sorted by date in context, but let's be safe
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    const map = new Map();
    sorted.forEach((n) => {
      const label = getSectionLabel(n.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(n);
    });
    return Array.from(map.entries());
  }, [notifications]);

  const handleNotificationPress = (n) => {
    if (!n.read) markAsRead(n.id);

    if (n.type === 'offer' && n.listingId != null) {
      // Navigate to Listing Offers page for this listing (Pending tab is default)
      router.push({
        pathname: '/profile-listing-offers',
        params: {
          listing: JSON.stringify({
            id: n.listingId,
            title: n.listingTitle || 'Listing',
            price: n.listingPrice || n.productPrice || 0,
            image: n.listingImage,
            sold: false,
          }),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchNotifications} />
        }
      >
        {grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={theme.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              Offers, messages, and updates will show here
            </Text>
          </View>
        ) : (
          grouped.map(([sectionLabel, items]) => (
            <View key={sectionLabel} style={styles.section}>
              <Text style={styles.sectionLabel}>{sectionLabel}</Text>
              {items.map((n) => {
                const config = NOTIFICATION_TYPES[n.type] ?? NOTIFICATION_TYPES.message;
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[
                      styles.card,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      !n.read && styles.cardUnread,
                    ]}
                    onPress={() => handleNotificationPress(n)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
                      <Ionicons
                        name={config.icon}
                        size={22}
                        color={config.iconColor}
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                          {n.title}
                        </Text>
                        <Text style={[styles.cardTime, { color: theme.textSecondary }]}>
                          {formatTime(n.createdAt)}
                        </Text>
                      </View>
                      <Text
                        style={[styles.cardBody, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        {n.body}
                      </Text>
                      {n.listingTitle && (
                        <View style={styles.listingTag}>
                          <Ionicons
                            name="pricetag-outline"
                            size={14}
                            color={theme.textSecondary}
                            style={styles.listingTagIcon}
                          />
                          <Text
                            style={[styles.listingTagText, { color: theme.textSecondary }]}
                            numberOfLines={1}
                          >
                            {n.listingTitle}
                          </Text>
                        </View>
                      )}
                    </View>
                    {!n.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
    },
    emptyIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginLeft: 4,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardUnread: {
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      gap: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    cardTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    cardBody: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    listingTag: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      paddingVertical: 4,
    },
    listingTagIcon: {
      marginRight: 4,
    },
    listingTagText: {
      fontSize: 12,
      fontWeight: '500',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
      marginLeft: 8,
      marginTop: 6,
    },
  });
