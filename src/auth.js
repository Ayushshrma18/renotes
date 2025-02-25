import { supabase } from './supabaseClient';

// Sign up function
export async function signUp(email, password) {
    try {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('User signed up successfully!');
        console.log('User signed up:', user);
    } catch (error) {
        alert('Error signing up: ' + error.message);
    }
}

// Log in function
export async function logIn(email, password) {
    try {
        const { user, error } = await supabase.auth.signIn({ email, password });
        if (error) throw error;
        alert('User logged in successfully!');
        console.log('User logged in:', user);
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }
}

// Log out function
export async function logOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        alert('User logged out successfully!');
        console.log('User logged out');
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
} 