import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { FilterProvider } from './FilterContext';
import { ThemeProvider } from './ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useEffect(() => {
    // Hide splash screen once the app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    // Small delay to ensure everything is loaded
    const timer = setTimeout(hideSplash, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <FilterProvider>
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
          name="sign-up"
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
            title: 'Chat',
            headerShown: false,
          }}
        />
        </Stack>
      </FilterProvider>
    </ThemeProvider>
  );
}
