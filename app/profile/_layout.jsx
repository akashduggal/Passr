import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="my-listings" options={{ title: 'My Listings' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="past-orders" options={{ title: 'Offers' }} />
      <Stack.Screen name="listing-offers" options={{ title: 'Listing Offers' }} />
      <Stack.Screen name="notification-settings" options={{ title: '', headerTransparent: true, headerBackButtonDisplayMode: 'minimal' }} />
      <Stack.Screen name="my-wishlist" options={{ title: 'My Wishlist' }} />
      <Stack.Screen name="support" options={{ title: '', headerTransparent: true }} />
    </Stack>
  );
}
