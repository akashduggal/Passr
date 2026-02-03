import { Stack } from 'expo-router';
import NotificationsScreen from '../src/features/notifications/screens/NotificationsScreen';
import { useTheme } from '../src/context/ThemeContext';
import { getTheme } from '../src/theme';

export default function Notifications() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: { color: theme.text, fontWeight: '700' },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <NotificationsScreen />
    </>
  );
}
