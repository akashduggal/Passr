import { Stack } from 'expo-router';
import OnboardingScreen from '../src/features/onboarding/screens/OnboardingScreen';

export default function Onboarding() {
  return (
    <>
      <Stack.Screen options={{ headerTransparent: true, title: '' }} />
      <OnboardingScreen />
    </>
  );
}
