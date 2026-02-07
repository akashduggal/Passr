import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { getTheme } from '../../src/theme';

export default function ProfileLayout() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: theme.text,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text,
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false, // Optional: clean look
      }}
    >
      <Stack.Screen 
        name="my-listings" 
        options={{ 
          title: 'My Listings',
        }} 
      />
      {/* Add other screens here if they need specific options, otherwise they inherit defaults */}
    </Stack>
  );
}
