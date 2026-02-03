import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '../../src/services/firebaseAuth';
import { useTheme } from '../../src/context/ThemeContext';
import { useNotifications } from '../../src/context/NotificationContext';
import { getTheme, ASU } from '../../src/theme';

function HeaderRight() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [user, setUser] = useState(auth().currentUser);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 12 }}>
      <TouchableOpacity
        onPress={() => router.push('/notifications')}
        style={{ 
          padding: 8,
          borderRadius: 20,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          position: 'relative',
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.text} />
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 6,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: ASU.maroon,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: theme.background,
              paddingHorizontal: 2,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/profile/my-profile')}
        activeOpacity={0.8}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: theme.surface,
          overflow: 'hidden',
          backgroundColor: ASU.maroon,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {user?.photoURL ? (
          <Image 
            source={{ uri: user.photoURL }} 
            style={{ width: '100%', height: '100%' }} 
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}


export default function DashboardLayout() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [user, setUser] = useState(auth().currentUser);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <HeaderRight />,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text, fontWeight: '600' },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 85 : 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8 + insets.bottom,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Passr',
          tabBarLabel: "",
          headerTransparent: true,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
     <Tabs.Screen
        name="add-listing"
        options={{
          title: 'Listing',
          tabBarLabel: '',
          headerTransparent: true,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "add-circle" : "add-circle-outline"} 
              size={size + 4} 
              color={color} 
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: user?.displayName || 'Profile',
          tabBarLabel: '',
          headerShown: true,
          headerTransparent: true,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
