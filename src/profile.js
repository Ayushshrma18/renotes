import { supabase } from './auth.js'; // Ensure you have access to the Supabase client

async function uploadProfilePhoto(file) {
    const user = supabase.auth.user();
    if (!user) {
        alert('User not logged in');
        return;
    }

    const fileName = `${user.id}/${file.name}`;
    const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

    if (error) {
        alert('Error uploading photo: ' + error.message);
    } else {
        const photoUrl = `${supabase.storageUrl}/profile-photos/${fileName}`;
        const { error: updateError } = await supabase.auth.update({
            data: { avatar_url: photoUrl }
        });

        if (updateError) {
            alert('Error updating profile: ' + updateError.message);
        } else {
            alert('Photo uploaded and profile updated successfully!');
            console.log('Uploaded photo:', data);
        }
    }
}

document.getElementById('profile-photo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadProfilePhoto(file);
    }
});

// Update user profile
export async function updateProfile({ username, avatarFile }) {
    const user = supabase.auth.user();
    if (!user) {
        alert('User not logged in');
        return;
    }

    let avatarUrl = user.user_metadata.avatar_url;

    if (avatarFile) {
        const fileName = `${user.id}/${avatarFile.name}`;
        const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, avatarFile, { upsert: true });

        if (error) {
            alert('Error uploading photo: ' + error.message);
            return;
        }

        avatarUrl = `${supabase.storageUrl}/profile-photos/${fileName}`;
    }

    const { error: updateError } = await supabase.auth.update({
        data: { username, avatar_url: avatarUrl }
    });

    if (updateError) {
        alert('Error updating profile: ' + updateError.message);
    } else {
        alert('Profile updated successfully!');
    }
}

// Change user password
export async function changePassword(newPassword) {
    const { error } = await supabase.auth.update({ password: newPassword });
    if (error) {
        alert('Error changing password: ' + error.message);
    } else {
        alert('Password changed successfully!');
    }
} 