import { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { FilterProvider } from '../src/context/FilterContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import AppSplashScreen from '../src/components/AppSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const prepare = async () => {
      try {
        // Hide native splash screen immediately to show our custom one
        await SplashScreen.hideAsync();
        
        // Keep our custom splash screen visible for a moment (2 seconds)
        // to show the animation and branding
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setIsSplashVisible(false);
      });
    }
  }, [isAppReady]);

  return (
    <ThemeProvider>
      <FilterProvider>
        <WishlistProvider>
          <View style={{ flex: 1 }}>
            <Stack
            screenOptions={{
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen name="index" options={{ title: '', headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{
                title: '',
                headerTransparent: true,
              }}
            />
            <Stack.Screen
              name="dashboard"
              options={{
                headerShown: false,
                headerTransparent: true,
              }}
            />
            <Stack.Screen
              name="user-profile"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                title: 'Notifications',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="filters"
              options={{
                title: 'Filters',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="product-detail"
              options={{
                title: '',
                headerTransparent: true,
                headerBackTitleVisible: false,
                headerBackTitle: '',
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="chat"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
          
          {isSplashVisible && (
            <Animated.View 
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill, 
                { 
                  zIndex: 9999, 
                  opacity: fadeAnim 
                }
              ]}
            >
              <AppSplashScreen />
            </Animated.View>
          )}
        </View>
      </WishlistProvider>
    </FilterProvider>
  </ThemeProvider>
  );
}

