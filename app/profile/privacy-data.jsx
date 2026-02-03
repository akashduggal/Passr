import { Stack } from 'expo-router';
import PrivacyDataScreen from '../../src/features/profile/screens/PrivacyDataScreen';

export default function PrivacyDataRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true }} />
      <PrivacyDataScreen />
    </>
  );
}
