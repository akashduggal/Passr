import { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useRootNavigationState, usePathname } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { FilterProvider } from '../src/context/FilterContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { ToastProvider } from '../src/context/ToastContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import AppSplashScreen from '../src/components/AppSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useNotificationObserver() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Wait for the navigation to be ready
    if (!navigationState?.key) return;

    let isMounted = true;

    function redirect(notification) {
      console.log("Triggered REDIRECT")
      const payload = notification.request.content.data;
      console.log("Notification Payload:", JSON.stringify(payload));
      
      // Check for URL in payload (support both direct and nested structure)
      let url = payload?.url || payload?.data?.url;
      
      console.log("URL RECEIVED :: ", url)
      if (url) {
        // Normalize URL: strip scheme if present (e.g. passr:// -> /)
        if (url.includes('://')) {
          const pathIndex = url.indexOf('://') + 3;
          url = url.substring(url.indexOf('/', pathIndex)); // Get path after scheme
        }
        
        // Ensure path starts with /
        if (!url.startsWith('/')) {
          url = '/' + url;
        }
        console.log("URL :: ", url)
        // Small delay to ensure navigation stack is ready on Android
        setTimeout(() => {
          const isChat = url.startsWith('/chat') || url.startsWith('/chat?');
          const currentPathname = pathnameRef.current;
          const currentIsChat = currentPathname === '/chat';

          if (isChat && currentIsChat) {
             // If we are already on the chat screen, replace the current route to avoid pushing a new screen
             // Append a timestamp to force a refresh/update in the ChatScreen
             const separator = url.includes('?') ? '&' : '?';
             const refreshUrl = `${url}${separator}refreshTimestamp=${Date.now()}`;
             router.replace(refreshUrl);
          } else {
             router.push(url);
          }
        }, 100);
      } else {
        // Fallback for custom logic (e.g. your offer type)
        // Check either payload directly or payload.data (if nested)
        const data = payload?.data || payload;

        if (data?.type === 'offer' && data?.listingId) {
          setTimeout(() => {
            router.push({
              pathname: '/profile-listing-offers',
              params: {
                listing: JSON.stringify({
                  id: data.listingId,
                  title: data.listingTitle || 'Listing',
                  price: data.listingPrice ?? 0,
                  image: data.listingImage,
                  sold: false,
                }),
              },
            });
          }, 100);
        }
      }
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [router, navigationState?.key]);
}

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  useNotificationObserver();

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
        <FilterProvider>
          <WishlistProvider>
            <ToastProvider>
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
              name="profile-my-listings"
              options={{
                title: 'My Listings',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="profile-past-orders"
              options={{
                title: 'Offers',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="profile-faq"
              options={{
                title: 'FAQ',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="profile-my-wishlist"
              options={{
                title: 'My Wishlist',
                headerBackTitleVisible: false,
                headerTransparent: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="profile-notification-settings"
              options={{
                title: 'Notifications',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="profile-privacy-data"
              options={{
                title: 'Privacy & Data',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="profile-support"
              options={{
                title: 'Support',
                headerBackTitleVisible: false,
                headerBackButtonDisplayMode: 'minimal',
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
            </ToastProvider>
          </WishlistProvider>
        </FilterProvider>
      </NotificationProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

