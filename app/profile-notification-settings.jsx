import { Stack } from 'expo-router';
import NotificationSettingsScreen from '../src/features/profile/screens/NotificationSettingsScreen';

export default function NotificationSettingsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerBackButtonDisplayMode: 'minimal' }} />
      <NotificationSettingsScreen />
    </>
  );
}
