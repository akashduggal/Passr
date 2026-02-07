import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '../src/services/firebaseAuth';
import { ENABLE_ONBOARDING } from '../src/constants/featureFlags';

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [user, setUser] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

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

    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
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
