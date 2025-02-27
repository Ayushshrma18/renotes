
import { useState, useEffect } from "react";
import { getDeletedNotes, restoreNote, type Note, syncNotesFromDatabase } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Trash = () => {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // If user is logged in, sync notes from database
          await syncNotesFromDatabase();
        }
        setDeletedNotes(getDeletedNotes());
      } catch (error) {
        console.error("Error loading deleted notes:", error);
        toast({
          title: "Error",
          description: "Failed to load your deleted notes",
          variant: "destructive",
        });
        // Fallback to local storage
        setDeletedNotes(getDeletedNotes());
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [user, toast]);

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id);
      setDeletedNotes(getDeletedNotes());
      toast({
        title: "Note restored",
        description: "Your note has been restored successfully",
      });
    } catch (error) {
      console.error("Error restoring note:", error);
      toast({
        title: "Error",
        description: "Failed to restore note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Trash</h2>
      <p className="text-muted-foreground">
        Notes in trash will be permanently deleted after 14 days
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : deletedNotes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Trash is empty</h3>
          <p className="text-muted-foreground mt-2">
            No notes in the trash
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Trash;
