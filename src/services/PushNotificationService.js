import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      // Get the Expo Push Token (requires projectId from app.json/eas.json)
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('Project ID not found in app.json or eas.json. Ensure EAS is configured.');
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.error('Error fetching push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Listeners for notification events
export function addNotificationListeners(
  onNotificationReceived,
  onNotificationResponse
) {
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification Received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification Response:', response);
    if (onNotificationResponse) {
      onNotificationResponse(response);
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
