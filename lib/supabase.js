import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabasePublishableKey && 
  supabasePublishableKey !== 'sb_publishable_your_key_here';

// Initialize Supabase Client with a fallback if not configured
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
