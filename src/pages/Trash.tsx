
import { useState, useEffect } from "react";
import { getDeletedNotes, restoreNote, type Note } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

const Trash = () => {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);

  useEffect(() => {
    setDeletedNotes(getDeletedNotes());
  }, []);

  const handleRestore = (id: string) => {
    restoreNote(id);
    setDeletedNotes(getDeletedNotes());
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Trash</h2>
      <p className="text-muted-foreground">
        Notes in trash will be permanently deleted after 14 days
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deletedNotes.map((note) => (
          <div key={note.id} className="note-card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{note.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(note.id)}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground line-clamp-3">{note.content}</p>
            <div className="mt-3 text-sm text-muted-foreground">
              Deleted {new Date(note.deletedAt!).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trash;
