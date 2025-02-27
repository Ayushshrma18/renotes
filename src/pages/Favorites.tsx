
import { useState, useEffect } from "react";
import { getNotes, type Note, syncNotesFromDatabase } from "@/lib/storage";
import NoteEditor from "@/components/NoteEditor";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Favorites = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        let allNotes;
        if (user) {
          // If user is logged in, sync notes from database
          allNotes = await syncNotesFromDatabase();
        } else {
          // If not logged in, just load from local storage
          allNotes = getNotes();
        }
        const favoriteNotes = allNotes.filter((note) => note.isFavorite && !note.deletedAt);
        setNotes(favoriteNotes);
      } catch (error) {
        console.error("Error loading favorites:", error);
        toast({
          title: "Error",
          description: "Failed to load your favorite notes",
          variant: "destructive",
        });
        // Fallback to local storage
        const allNotes = getNotes();
        const favoriteNotes = allNotes.filter((note) => note.isFavorite && !note.deletedAt);
        setNotes(favoriteNotes);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [user, toast]);

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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No favorite notes yet</h3>
          <p className="text-muted-foreground mt-2">
            Mark notes as favorites to see them here
          </p>
        </div>
      ) : (
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
      )}

      <NoteEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
      />
    </div>
  );
};

export default Favorites;
