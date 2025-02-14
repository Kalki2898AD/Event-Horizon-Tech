import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create the client with either real credentials or dummy ones
export const supabase = createClient<Database>(
  supabaseUrl || 'https://example.com',
  supabaseAnonKey || 'dummy-key'
);

// Optional: Add a warning if using dummy credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using dummy Supabase client. Some features may not work.');
} 