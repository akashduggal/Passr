import Constants from 'expo-constants';

// Mock implementation for Expo Go
const mockUser = {
  uid: 'dev-user-123',
  email: 'dev@asu.edu',
  displayName: 'Dev Student',
  photoURL: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  phoneNumber: null,
  getIdToken: async () => 'mock-id-token-for-development-only',
};

const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: (callback) => {
    callback(mockUser);
    return () => {};
  },
  signInAnonymously: async () => ({ user: mockUser }),
  signInWithCredential: async () => ({ user: mockUser }),
  signOut: async () => {},
};

// Add static properties
const authFn = () => mockAuth;
authFn.GoogleAuthProvider = {
  credential: () => ({ token: 'mock-token' }),
};

let auth;

// Check if running in Expo Go or if native module is missing
if (Constants.appOwnership === 'expo') {
  console.log('Running in Expo Go: Using mock Firebase Auth');
  auth = authFn;
} else {
  try {
    // Try to require the native module
    auth = require('@react-native-firebase/auth').default;
  } catch (error) {
    console.warn('Firebase Auth native module not found, falling back to mock:', error.message);
    auth = authFn;
  }
}

export default auth;
