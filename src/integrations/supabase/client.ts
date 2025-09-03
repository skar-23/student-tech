import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallbacks and validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Provide fallback values for development when environment variables are missing
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase credentials. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.');
  
  // In development, provide more helpful error messages
  if (import.meta.env.DEV) {
    console.warn('Development environment detected. Make sure you have created a .env file in the project root with the following variables:');
    console.warn('VITE_SUPABASE_URL=your_supabase_url');
    console.warn('VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key');
    console.warn('Using fallback values for now to prevent app crash.');
  }
}

// Use fallback values if environment variables are missing to prevent app crash
const supabaseUrl = SUPABASE_URL || fallbackUrl;
const supabaseKey = SUPABASE_PUBLISHABLE_KEY || fallbackKey;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});