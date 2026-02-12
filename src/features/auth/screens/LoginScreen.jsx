import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import PassrLogo from '../../../components/PassrLogo';
import { GoogleSignin, statusCodes } from '../../../services/googleSignin';
import auth from '../../../services/firebaseAuth';
import UserService from '../../../services/UserService';
import { registerForPushNotificationsAsync } from '../../../services/PushNotificationService';
import { useWishlist } from '../../../context/WishlistContext';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { RESTRICT_TO_ASU_EMAIL } from '../../../constants/featureFlags';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const styles = getStyles(theme, isDarkMode);
  const { loadWishlist } = useWishlist();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  async function onGoogleButtonPress() {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const { idToken, user } = response.data || response;

      if (RESTRICT_TO_ASU_EMAIL && user?.email && !user.email.toLowerCase().endsWith('@asu.edu')) {
        await GoogleSignin.signOut();
        setIsLoading(false);
        Alert.alert('Access Restricted', 'Only @asu.edu email addresses are allowed.');
        return;
      }

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      
      // Register for push notifications
      let expoPushToken = null;
      try {
        expoPushToken = await registerForPushNotificationsAsync();
        console.log('LoginScreen: Got push token:', expoPushToken);
      } catch (pushError) {
        console.error('LoginScreen: Push registration failed', pushError);
      }

      // Sync user with backend
      await UserService.syncUser({
        email: user.email,
        name: user.name,
        picture: user.photo,
        expoPushToken,
      });

      // Load wishlist now that user is synced
      loadWishlist();

      // Keep loading state true while navigating
      router.replace('/dashboard');
    } catch (error) {
      // Cleanup partial session on error
      try {
        await auth().signOut();
        await GoogleSignin.signOut();
      } catch (cleanupError) {
        // Ignore cleanup errors
        console.log('Cleanup error:', cleanupError);
      }

      setIsLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        console.error('Google Sign-In Error', error);
        Alert.alert('Error', 'Failed to sign in with Google');
      }
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <PassrLogo />
          <Text style={styles.appName}>Passr</Text>
          <Text style={styles.tagline}>The Marketplace for{'\n'}ASU Students</Text>
        </View>
        {/* Decorative Circle */}
        <View style={styles.circleDecoration} />
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color={ASU.maroon} />
            <Text style={styles.featureText}>Verified Student Emails</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color={ASU.maroon} />
            <Text style={styles.featureText}>Campus Community</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="wallet-outline" size={24} color={ASU.maroon} />
            <Text style={styles.featureText}>Safe Buying & Selling</Text>
          </View>
        </View>
        <Text style={{ fontSize: 10, color: 'gray', textAlign: 'center', marginTop: 4 }}>
            API: {process.env.EXPO_PUBLIC_API_URL}
      </Text>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={onGoogleButtonPress}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Ionicons name="logo-google" size={24} color={theme.text} />
            )}
            <Text style={styles.googleButtonText}>
              {isLoading ? 'Signing in...' : 'Sign with Google (@asu.edu)'}
            </Text>
          </TouchableOpacity>

          {/* API URL Configuration - Only show in Dev/Preview, hide in Production */}
          {(__DEV__ || process.env.EXPO_PUBLIC_APP_VARIANT !== 'production') && (
            <TouchableOpacity 
              style={{ marginTop: 20, padding: 10 }}
              onPress={() => {
                setTempUrl(UserService.baseUrl);
                setSettingsVisible(true);
              }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', textDecorationLine: 'underline' }}>
                Change Backend URL
              </Text>
            </TouchableOpacity>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={settingsVisible}
            onRequestClose={() => setSettingsVisible(false)}
            statusBarTranslucent={true}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Set Backend URL</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  onChangeText={setTempUrl}
                  value={tempUrl}
                  placeholder="https://..."
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border }]}
                    onPress={() => setSettingsVisible(false)}
                  >
                    <Text style={{ color: theme.text }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: ASU.maroon }]}
                    onPress={() => {
                       UserService.setBaseUrl(tempUrl);
                       setSettingsVisible(false);
                    }}
                  >
                    <Text style={{ color: 'white' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Dev/Expo Go Bypass */}
          {(__DEV__ || Constants.appOwnership === 'expo') && (
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: isDarkMode ? ASU.gray2 : ASU.gray6 }]}
              onPress={async () => {
                 try {
                    // Call backend to perform dev login and get user/token
                    // NOTE: The backend mounts auth routes at /auth, NOT /api/auth
                    // UserService.baseUrl includes /api for other services, but auth is root level
                    // We need to strip /api if it exists, or just use the root URL
                    
                    const rootUrl = UserService.baseUrl.replace(/\/api$/, '');
                    console.log('Attempting dev login to:', `${rootUrl}/auth/dev-login`);
                    
                    const response = await fetch(`${rootUrl}/auth/dev-login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: 'dev-user-123',
                        email: 'dev@asu.edu',
                        name: 'Dev Student'
                      })
                    });
                   
                   const text = await response.text();
                   console.log('Dev login response text:', text);

                   let data;
                   try {
                     data = JSON.parse(text);
                   } catch (e) {
                     console.error('Failed to parse dev login response:', text);
                     throw new Error('Invalid JSON response');
                   }
                   
                   if (data.token) {
                      // In a real app we'd store this token. 
                      // For now, UserService.getHeaders() and firebaseAuth.js mock are aligned to use 'mock-id-token-for-development-only'
                      // But we should ensure the frontend state is updated
                      
                      // We still call signInAnonymously on the frontend "auth" object to trigger onAuthStateChanged
                      await auth().signInAnonymously();
                      router.replace('/dashboard');
                   }
                 } catch (error) {
                    console.error('Dev login failed:', error);
                    // Fallback to local only if backend fails
                    auth().signInAnonymously()
                      .then(() => router.replace('/dashboard'))
                      .catch(() => router.replace('/dashboard'));
                 }
               }}
              activeOpacity={0.8}
            >
              <Ionicons name="code-slash-outline" size={24} color={theme.text} />
              <Text style={styles.googleButtonText}>Dev Login (Bypass Auth)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flex: 0.55,
    backgroundColor: ASU.maroon,
    borderBottomRightRadius: 80,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  circleDecoration: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFC627',
    marginTop: 16,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 0.45,
    paddingTop: 32,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: theme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  termsText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
