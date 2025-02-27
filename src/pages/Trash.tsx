
import { useState, useEffect } from "react";
import { getDeletedNotes, restoreNote, type Note, syncNotesFromDatabase } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Undo2, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Trash = () => {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const openDeleteDialog = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsDeleteDialogOpen(true);
  };

  const permanentlyDeleteNote = async () => {
    if (!noteToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Get all notes from localStorage
      const allNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      
      // Filter out the note to be deleted
      const updatedNotes = allNotes.filter((note: Note) => note.id !== noteToDelete);
      
      // Update localStorage
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      
      // If user is logged in, delete from database
      if (user) {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteToDelete)
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      setDeletedNotes(getDeletedNotes());
      
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
      
      toast({
        title: "Note deleted",
        description: "Your note has been permanently deleted",
      });
    } catch (error) {
      console.error("Error permanently deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note permanently",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        <div className="text-center py-12 bg-card/50 rounded-xl backdrop-blur-sm">
          <div className="flex justify-center mb-4">
            <Trash2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium">Trash is empty</h3>
          <p className="text-muted-foreground mt-2">
            No notes in the trash
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedNotes.map((note) => (
            <div key={note.id} className="glass-card p-4 rounded-xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(note.id)}
                    className="opacity-60 hover:opacity-100 hover:bg-green-500/10 hover:text-green-500"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(note.id)}
                    className="opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-3">{note.content}</p>
              <div className="mt-3 text-sm text-muted-foreground">
                Deleted {new Date(note.deletedAt!).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete Note
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the note from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={permanentlyDeleteNote}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trash;
