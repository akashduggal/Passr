import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { getTheme, ASU } from '../../src/theme';
import FaqScreen from '../../src/features/profile/screens/FaqScreen';

export default function FaqRoute() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: 'FAQ',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }} 
      />
      <FaqScreen />
    </>
  );
}
