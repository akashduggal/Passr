import { View, TouchableOpacity } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getTheme } from '../theme';

function HeaderRight() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
      <TouchableOpacity
        onPress={() => router.push('/notifications')}
        style={{ padding: 8 }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.6}
      >
        <Ionicons name="notifications-outline" size={24} color={theme.label} />
      </TouchableOpacity>
    </View>
  );
}

function ProfileTabButton(props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      {...props}
      onPress={() => router.push('/user-profile')}
      activeOpacity={0.6}
    />
  );
}

export default function DashboardLayout() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <HeaderRight />,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text, fontWeight: '600' },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Passr',
          tabBarLabel: "",
          headerTransparent: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
     <Tabs.Screen
        name="add-listing"
        options={{
          title: 'Listing',
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" size={size ?? 24} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size ?? 24} color={color} />
          ),
          tabBarButton: (props) => <ProfileTabButton {...props} />,
        }}
      />
    </Tabs>
  );
}
