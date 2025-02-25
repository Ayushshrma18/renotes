import { supabase } from './supabaseClient';

// Example function to handle decorative items and tags
function initializeNotesFeatures() {
    const tagInput = document.getElementById('tag-input');
    const decorativeItems = document.querySelectorAll('.decorative-item');

    tagInput.addEventListener('change', (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        console.log('Tags:', tags);
        // Add logic to handle tags
    });

    decorativeItems.forEach(item => {
        item.addEventListener('click', () => {
            // Logic to apply decorative item to the note
            console.log('Decorative item clicked:', item);
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeNotesFeatures);

// Fetch notes for the current user
export async function fetchNotes() {
    const user = supabase.auth.user();
    if (!user) {
        alert('User not logged in');
        return;
    }

    const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching notes:', error);
    } else {
        console.log('Notes:', notes);
        // Render notes in your UI
    }
}

// Add a new note
export async function addNote(title, content) {
    const user = supabase.auth.user();
    if (!user) {
        alert('User not logged in');
        return;
    }

    const { data, error } = await supabase
        .from('notes')
        .insert([{ user_id: user.id, title, content }]);

    if (error) {
        console.error('Error adding note:', error);
    } else {
        console.log('Note added:', data);
        // Update UI with new note
    }
} 