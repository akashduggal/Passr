import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const MOCK_AUTH_STORAGE_KEY = 'mock_auth_user_session';

const mockAuth = {
  currentUser: null, // Start with null
  _subscribers: [],
  
  // Initialize from storage
  _init: async () => {
    try {
      const storedSession = await AsyncStorage.getItem(MOCK_AUTH_STORAGE_KEY);
      if (storedSession) {
        mockAuth.currentUser = mockUser;
      } else {
        mockAuth.currentUser = null;
      }
    } catch (e) {
      console.error('Failed to restore mock session', e);
    }
    // Notify subscribers
    mockAuth._notify();
  },

  _notify: () => {
    mockAuth._subscribers.forEach(cb => cb(mockAuth.currentUser));
  },

  onAuthStateChanged: (callback) => {
    mockAuth._subscribers.push(callback);
    // Initial call
    callback(mockAuth.currentUser);
    return () => {
      mockAuth._subscribers = mockAuth._subscribers.filter(cb => cb !== callback);
    };
  },
  
  signInAnonymously: async () => {
    mockAuth.currentUser = mockUser;
    await AsyncStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');
    mockAuth._notify();
    return { user: mockUser };
  },
  
  signInWithCredential: async () => {
    mockAuth.currentUser = mockUser;
    await AsyncStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');
    mockAuth._notify();
    return { user: mockUser };
  },
  
  signOut: async () => {
    mockAuth.currentUser = null;
    await AsyncStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    mockAuth._notify();
  },
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
  // Initialize mock auth state
  mockAuth._init();
} else {
  try {
    // Silence deprecation warnings
    globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    
    // Try to require the native module
    const rnAuth = require('@react-native-firebase/auth').default;
    auth = rnAuth;
  } catch (error) {
    console.warn('Firebase Auth native module not found, falling back to mock:', error.message);
    auth = authFn;
  }
}

export default auth;
