import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
// import UserService from '../../../services/UserService';
// import auth from '../../../services/firebaseAuth';

export default function PrivacyDataScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme, insets);

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showOnlineStatus: true,
    shareUsageData: false,
    marketingEmails: false,
  });

  /*
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const user = await UserService.getCurrentUser();
      if (user && user.preferences) {
        setSettings(prev => ({
          ...prev,
          ...user.preferences
        }));
      }
    } catch (error) {
      console.log('Failed to load user settings (using defaults):', error.message);
      // Silently fail on initial load to avoid annoying alerts for network issues
      // The user will find out if they try to change something
    } finally {
      setLoading(false);
    }
  };
  */

  const toggleSetting = async (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    // Backend integration commented out for now
    /*
    // Optimistic update
    const newValue = !settings[key];
    const oldSettings = { ...settings };
    
    setSettings(prev => ({ ...prev, [key]: newValue }));

    try {
      // Assuming backend expects a nested 'preferences' object
      // We send the entire preferences object or just the changed field depending on backend implementation
      // Here we send the updated preferences object to be safe
      const updatedPreferences = {
        ...settings,
        [key]: newValue
      };
      
      await UserService.updateUser({
        preferences: updatedPreferences
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on error
      setSettings(oldSettings);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
    */
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "We will prepare a copy of your data and email it to you. This may take up to 24 hours.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            // Backend integration commented out for now
            /*
            try {
              setLoading(true);
              await UserService.deleteUser();
              // Sign out from Firebase
              await auth().signOut();
              // Navigate to login (using router.replace to clear stack)
              router.replace('/');
            } catch (error) {
              console.error('Failed to delete account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
              setLoading(false);
            }
            */
            Alert.alert("Account Deletion", "This feature is currently disabled as backend services are under maintenance.");
          } 
        }
      ]
    );
  };

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ToggleItem = ({ label, description, value, onToggle, isLast }) => (
    <View style={[styles.item, isLast && styles.itemLast]}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemLabel}>{label}</Text>
        {description && <Text style={styles.itemDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: ASU.maroon }}
        thumbColor={Platform.OS === 'ios' ? '#fff' : (value ? ASU.gold : '#f4f3f4')}
        ios_backgroundColor={theme.border}
      />
    </View>
  );

  const ActionItem = ({ icon, label, onPress, isDestructive, isLast }) => (
    <TouchableOpacity 
      style={[styles.item, isLast && styles.itemLast]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={isDestructive ? '#D32F2F' : theme.text} />
      </View>
      <Text style={[styles.itemLabel, isDestructive && styles.destructiveText]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={ASU.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, loading && styles.loadingContent]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={ASU.maroon} />
        ) : (
          <>
            <Text style={styles.description}>
              Manage how your data is used and control your privacy settings.
            </Text>

            <Section title="Visibility">
              <ToggleItem 
                label="Profile Visibility" 
                description="Allow other students to see your profile"
                value={settings.profileVisibility} 
                onToggle={() => toggleSetting('profileVisibility')}
              />
              <ToggleItem 
                label="Online Status" 
                description="Show when you are active"
                value={settings.showOnlineStatus} 
                onToggle={() => toggleSetting('showOnlineStatus')}
                isLast
              />
            </Section>

            <Section title="Data Usage">
              <ToggleItem 
                label="Share Usage Data" 
                description="Help us improve Passr by sharing anonymous usage data"
                value={settings.shareUsageData} 
                onToggle={() => toggleSetting('shareUsageData')}
              />
              <ToggleItem 
                label="Marketing Emails" 
                description="Receive updates about new features and promotions"
                value={settings.marketingEmails} 
                onToggle={() => toggleSetting('marketingEmails')}
                isLast
              />
            </Section>

            <Section title="Your Data">
              <ActionItem 
                icon="download-outline" 
                label="Download My Data" 
                onPress={handleExportData} 
              />
              <ActionItem 
                icon="trash-outline" 
                label="Delete Account" 
                onPress={handleDeleteAccount}
                isDestructive
                isLast
              />
            </Section>

            <Section title="Legal">
              <ActionItem 
                icon="document-text-outline" 
                label="Privacy Policy" 
                onPress={() => {}} 
              />
              <ActionItem 
                icon="newspaper-outline" 
                label="Terms of Service" 
                onPress={() => {}} 
                isLast
              />
            </Section>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Passr cares about your privacy.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: ASU.maroon,
    paddingTop: insets.top + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASU.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    minHeight: 56,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  destructiveText: {
    color: '#D32F2F',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
});
