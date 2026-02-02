import { Stack } from 'expo-router';
import MyProfileScreen from '../../src/features/profile/screens/MyProfileScreen';
import { useTheme } from '../../src/context/ThemeContext';
import { getTheme, ASU } from '../../src/theme';

export default function MyProfileRoute() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'My Profile', 
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }} 
      />
      <MyProfileScreen />
    </>
  );
}
