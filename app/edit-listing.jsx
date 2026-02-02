import { Stack } from 'expo-router';
import AddListingScreen from '../src/features/marketplace/screens/AddListingScreen';
import { useTheme } from '../src/context/ThemeContext';
import { getTheme } from '../src/theme';

export default function EditListing() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Listing',
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: { color: theme.text },
          headerTintColor: theme.text,
          headerBackTitleVisible: false,
        }} 
      />
      <AddListingScreen isTab={false} />
    </>
  );
}
