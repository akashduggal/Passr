import { Stack } from 'expo-router';
import MyOffersScreen from '../../src/features/profile/screens/MyOffersScreen';

export default function MyOffersRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Offers' }} />
      <MyOffersScreen />
    </>
  );
}
