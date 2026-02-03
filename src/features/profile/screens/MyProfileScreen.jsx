import { View, Text, StyleSheet, Image, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import auth from '../../../services/firebaseAuth';
import { GoogleSignin } from '../../../services/googleSignin';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

export default function MyProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const user = auth().currentUser;

  const styles = getStyles(theme, insets);

  const handleLogout = async () => {
    try {
      // Ensure Google Sign-In is configured
      GoogleSignin.configure({
        webClientId: '872459232362-fmrc9g7eiitgnps7i3uk6slau6ndhnkm.apps.googleusercontent.com',
      });
      
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if Google Sign-In fails (e.g. not signed in)
        console.log('Google sign out error:', e);
      }

      if (auth().currentUser) {
        await auth().signOut();
      }
      
      // Reset navigation stack to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (error) {
      console.error('Error signing out: ', error);
      // Fallback reset
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    }
  };

  const InfoItem = ({ icon, label, value, isLast }) => (
    <View style={[styles.infoItem, isLast && styles.infoItemLast]}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-outline" size={20} color={ASU.maroon} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'ios' ? 44 : 56) + 16 }]}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.userName}>{user?.displayName || 'ASU Student'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Ionicons name="school-outline" size={12} color={ASU.maroon} />
              <Text style={styles.badgeText}>ASU Student</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#2E7D32" />
              <Text style={[styles.badgeText, { color: '#2E7D32' }]}>Verified</Text>
            </View>
          </View>
          
          <Text style={styles.memberSinceText}>
            Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        {/* Personal Information Section */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.sectionCard}>
          <InfoItem 
            icon="person-outline" 
            label="Full Name" 
            value={user?.displayName} 
          />
          <InfoItem 
            icon="mail-outline" 
            label="Email Address" 
            value={user?.email} 
            isLast
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={ASU.white} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: theme.background,
  },
  avatarPlaceholder: {
    backgroundColor: ASU.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: ASU.maroon,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  memberSinceText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: ASU.maroon,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASU.maroon,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: ASU.white,
  },
});
