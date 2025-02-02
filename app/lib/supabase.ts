import { createClient } from '@supabase/supabase-js';

// Default values
const supabaseUrl = 'https://zcwtgjqxsgzrfwltkyua.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjd3RnanF4c2d6cmZ3bHRreXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0ODIwNDUsImV4cCI6MjA1NDA1ODA0NX0.U3InJ2ic1P7laUCKKaAHG22ywHXDerP_yRT_F4t_PUU';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Article = {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
};