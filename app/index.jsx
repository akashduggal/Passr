import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '../src/services/firebaseAuth';
import UserService from '../src/services/UserService';
import { useWishlist } from '../src/context/WishlistContext';
import { ENABLE_ONBOARDING } from '../src/constants/featureFlags';

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [user, setUser] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const { loadWishlist } = useWishlist();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!ENABLE_ONBOARDING) {
          setHasSeenOnboarding(true);
          setCheckingOnboarding(false);
          return;
        }

        const alwaysShow = await AsyncStorage.getItem('alwaysShowOnboarding');
        // Default to TRUE if not set (for mocking purposes as requested)
        if (alwaysShow === 'true' || alwaysShow === null) {
          // If null (first run or reset), treat as true for now to satisfy "show by default"
          // However, we must ensure we don't overwrite user's actual progress if they turn it off.
          // The request is "for mocking show onboarding screen by default".
          // So if 'alwaysShowOnboarding' is not explicitly 'false', we show it.
          setHasSeenOnboarding(false);
        } else {
          const value = await AsyncStorage.getItem('hasSeenOnboarding');
          setHasSeenOnboarding(value === 'true');
        }
      } catch (e) {
        console.error('Error checking onboarding status:', e);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();

    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Verify backend connectivity and session validity
          await UserService.getCurrentUser();
          
          // Now that backend is verified, load wishlist
          // We don't await this because we don't want to block the UI transition if it's slow,
          // but it's safe to fire it now.
          loadWishlist();

          setUser(user);
        } catch (error) {
          console.error('Backend validation failed during boot:', error);
          // If backend is unreachable or sync failed, force logout flow
          setUser(null);
          // Optional: Clear firebase session to prevent loop if desired, 
          // but keeping it null in state is enough to redirect to Login.
          // To be safe and ensure "explicit login" is required next time:
          auth().signOut().catch(console.error);
        }
      } else {
        setUser(null);
      }
      
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/login" />;
}
