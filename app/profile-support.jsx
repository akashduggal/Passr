import { Stack } from 'expo-router';
import SupportScreen from '../src/features/profile/screens/SupportScreen';

export default function SupportRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true }} />
      <SupportScreen />
    </>
  );
}
