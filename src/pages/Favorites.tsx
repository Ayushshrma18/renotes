
import { useState, useEffect } from "react";
import { getNotes, type Note } from "@/lib/storage";
import NoteEditor from "@/components/NoteEditor";

const Favorites = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const allNotes = getNotes();
    const favoriteNotes = allNotes.filter((note) => note.isFavorite && !note.deletedAt);
    setNotes(favoriteNotes);
  }, []);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    // Refresh notes
    const allNotes = getNotes();
    const favoriteNotes = allNotes.filter((note) => note.isFavorite && !note.deletedAt);
    setNotes(favoriteNotes);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card cursor-pointer"
            onClick={() => handleNoteClick(note)}
          >
            <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
            <p className="text-muted-foreground line-clamp-3">{note.content}</p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <NoteEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
      />
    </div>
  );
};

export default Favorites;
