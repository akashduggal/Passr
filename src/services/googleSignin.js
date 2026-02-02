import Constants from 'expo-constants';

// Mock implementation for Expo Go
const mockGoogleSignin = {
  configure: (config) => {
    console.log('Mock GoogleSignin configured with:', config);
  },
  hasPlayServices: async (options) => {
    console.log('Mock hasPlayServices called');
    return true;
  },
  signIn: async () => {
    console.log('Mock GoogleSignin signIn called');
    return {
      data: {
        idToken: 'mock-id-token',
        user: {
          id: 'google-user-123',
          email: 'dev@asu.edu',
          givenName: 'Dev',
          familyName: 'Student',
          photo: null,
          name: 'Dev Student',
        },
      },
    };
  },
  signOut: async () => {
    console.log('Mock GoogleSignin signOut called');
  },
  getCurrentUser: async () => null,
  isSignedIn: async () => false,
};

const mockStatusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

let GoogleSignin;
let statusCodes;

// Check if running in Expo Go or if native module is missing
if (Constants.appOwnership === 'expo') {
  console.log('Running in Expo Go: Using mock Google Signin');
  GoogleSignin = mockGoogleSignin;
  statusCodes = mockStatusCodes;
} else {
  try {
    const nativeModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = nativeModule.GoogleSignin;
    statusCodes = nativeModule.statusCodes;
  } catch (error) {
    console.warn('Google Signin native module not found, falling back to mock:', error.message);
    GoogleSignin = mockGoogleSignin;
    statusCodes = mockStatusCodes;
  }
}

export { GoogleSignin, statusCodes };
