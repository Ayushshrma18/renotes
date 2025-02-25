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