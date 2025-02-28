
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://uxorkfsfbhkzykbtuvws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4b3JrZnNmYmhrenlrYnR1dndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NDY0NzIsImV4cCI6MjA1NjAyMjQ3Mn0.sM6RK0CasCMq5Kach3RTBPeBSywMg50P9Derpq7PZ74';

// Configure client with auto refresh for login persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
