import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
