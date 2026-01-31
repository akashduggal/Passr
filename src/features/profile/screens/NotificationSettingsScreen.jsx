import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const topPadding = insets.top + headerHeight + 8;
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [listingUpdates, setListingUpdates] = useState(true);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <Text style={styles.sectionDescription}>
          Manage how you receive notifications
        </Text>

        {/* Push Notifications */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive push notifications on your device
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: ASU.gray5, true: ASU.maroon + '80' }}
            thumbColor={pushNotifications ? ASU.maroon : ASU.gray4}
            ios_backgroundColor={ASU.gray5}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.subsectionTitle}>Notification Types</Text>

        {/* Offer Notifications */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Offers</Text>
            <Text style={styles.settingDescription}>
              Get notified when someone makes an offer on your listings
            </Text>
          </View>
          <Switch
            value={offerNotifications}
            onValueChange={setOfferNotifications}
            trackColor={{ false: ASU.gray5, true: ASU.maroon + '80' }}
            thumbColor={offerNotifications ? ASU.maroon : ASU.gray4}
            ios_backgroundColor={ASU.gray5}
          />
        </View>

        {/* Message Notifications */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Messages</Text>
            <Text style={styles.settingDescription}>
              Get notified when you receive new messages
            </Text>
          </View>
          <Switch
            value={messageNotifications}
            onValueChange={setMessageNotifications}
            trackColor={{ false: ASU.gray5, true: ASU.maroon + '80' }}
            thumbColor={messageNotifications ? ASU.maroon : ASU.gray4}
            ios_backgroundColor={ASU.gray5}
          />
        </View>

        {/* Listing Updates */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Listing Updates</Text>
            <Text style={styles.settingDescription}>
              Get notified about updates to your listings
            </Text>
          </View>
          <Switch
            value={listingUpdates}
            onValueChange={setListingUpdates}
            trackColor={{ false: ASU.gray5, true: ASU.maroon + '80' }}
            thumbColor={listingUpdates ? ASU.maroon : ASU.gray4}
            ios_backgroundColor={ASU.gray5}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginTop: 8,
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 24,
  },
});
