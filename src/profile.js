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