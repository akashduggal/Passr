import { Stack } from 'expo-router';
import ListingOffersScreen from '../../src/features/profile/screens/ListingOffersScreen';

export default function ListingOffersRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Listing Offers' }} />
      <ListingOffersScreen />
    </>
  );
}
