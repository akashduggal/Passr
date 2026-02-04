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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import PassrLogo from '../../../components/PassrLogo';
import { GoogleSignin, statusCodes } from '../../../services/googleSignin';
import auth from '../../../services/firebaseAuth';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [isLoading, setIsLoading] = useState(false);
  const styles = getStyles(theme, isDarkMode);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '872459232362-fmrc9g7eiitgnps7i3uk6slau6ndhnkm.apps.googleusercontent.com',
    });
  }, []);

  async function onGoogleButtonPress() {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const { idToken, user } = response.data || response;

      if (user?.email && !user.email.toLowerCase().endsWith('@asu.edu')) {
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
      
      // Keep loading state true while navigating
      router.replace('/dashboard');
    } catch (error) {
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
          
          <Text style={styles.termsText}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Text>

          {/* Dev/Expo Go Bypass */}
          {(__DEV__ || Constants.appOwnership === 'expo') && (
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: isDarkMode ? ASU.gray2 : ASU.gray6 }]}
              onPress={() => {
                 auth().signInAnonymously()
                   .then(() => router.replace('/dashboard'))
                   .catch(() => router.replace('/dashboard'));
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
    zIndex: 2,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: ASU.white,
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '500',
    color: ASU.white,
    lineHeight: 32,
    opacity: 0.9,
  },
  circleDecoration: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 0.45,
    paddingHorizontal: 32,
    paddingTop: 40,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
  },
  featuresList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 18,
    color: theme.text,
    fontWeight: '500',
  },
  footer: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    paddingVertical: 18,
    width: '100%',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  termsText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
});
