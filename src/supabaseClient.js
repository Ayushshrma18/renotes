import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-public-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 