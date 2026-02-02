import { Stack } from 'expo-router';
import MessagesScreen from '../../src/features/profile/screens/MessagesScreen';

export default function MessagesRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <MessagesScreen />
    </>
  );
}
