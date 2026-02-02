import { Stack } from 'expo-router';
import MyWishlistScreen from '../../src/features/profile/screens/MyWishlistScreen';

export default function MyWishlistRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'My Wishlist' }} />
      <MyWishlistScreen />
    </>
  );
}
