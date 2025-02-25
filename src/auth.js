import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-public-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Sign up function
export async function signUp(email, password) {
    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) {
        alert('Error signing up: ' + error.message);
    } else {
        alert('User signed up successfully!');
        console.log('User signed up:', user);
    }
}

// Log in function
export async function logIn(email, password) {
    const { user, error } = await supabase.auth.signIn({
        email,
        password,
    });
    if (error) {
        alert('Error logging in: ' + error.message);
    } else {
        alert('User logged in successfully!');
        console.log('User logged in:', user);
    }
}

// Log out function
export async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Error logging out: ' + error.message);
    } else {
        alert('User logged out successfully!');
        console.log('User logged out');
    }
} 