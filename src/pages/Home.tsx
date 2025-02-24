
import { useState, useEffect } from "react";
import { Plus, Search, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoteEditor from "@/components/NoteEditor";
import { getNotes, toggleFavorite, deleteNote, type Note } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { toast } = useToast();

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = getNotes();
    setNotes(savedNotes);
  }, []);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    // Refresh notes list
    setNotes(getNotes());
  };

  const handleToggleFavorite = (noteId: string) => {
    toggleFavorite(noteId);
    setNotes(getNotes());
    toast({
      title: "Note updated",
      description: "Note has been added to favorites",
    });
  };

  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
    setNotes(getNotes());
    toast({
      title: "Note moved to trash",
      description: "Note will be permanently deleted after 14 days",
    });
  };

  const filteredNotes = notes.filter(
    (note) =>
      !note.deletedAt &&
      (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsEditorOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="note-card group cursor-pointer"
            onClick={() => handleNoteClick(note)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(note.id);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      note.isFavorite ? "fill-current text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

export default Home;
