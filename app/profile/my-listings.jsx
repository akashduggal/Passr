import { Stack } from 'expo-router';
import MyListingsScreen from '../../src/features/profile/screens/MyListingsScreen';

export default function MyListingsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'My Listings' }} />
      <MyListingsScreen />
    </>
  );
}
