
import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoteEditor from "@/components/NoteEditor";
import { getNotes, type Note } from "@/lib/storage";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = getNotes();
    setNotes(savedNotes);
  }, []);

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
        {notes.map((note) => (
          <div key={note.id} className="note-card">
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

      <NoteEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </div>
  );
};

export default Home;
