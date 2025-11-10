import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
const extra = (Constants.expoConfig?.extra || (Constants as any).manifest?.extra || {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};
const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials are missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env.local (loaded via app.config.ts).'
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
auth: {
storage: AsyncStorage as any,
autoRefreshToken: true,
persistSession: true,
detectSessionInUrl: false,
},
realtime: { params: { eventsPerSecond: 5 } },
});
