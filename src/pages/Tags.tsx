
import { useState, useEffect } from "react";
import { getTagsWithCount, getNotesByTag, type Note, syncNotesFromDatabase, saveNote } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Hash, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import NoteEditor from "@/components/NoteEditor";

const Tags = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagStats, setTagStats] = useState<{ tag: string; count: number }[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTagDialogOpen, setIsCreateTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // If user is logged in, sync notes from database
          await syncNotesFromDatabase();
        }
        setTagStats(getTagsWithCount());
      } catch (error) {
        console.error("Error loading tags:", error);
        toast({
          title: "Error",
          description: "Failed to load your tags",
          variant: "destructive",
        });
        // Fallback to local storage
        setTagStats(getTagsWithCount());
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, [user, toast]);

  useEffect(() => {
    if (selectedTag) {
      setNotes(getNotesByTag(selectedTag));
    } else {
      setNotes([]);
    }
  }, [selectedTag]);

  const refreshTags = () => {
    setTagStats(getTagsWithCount());
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Create a new note with the specified tag
    setIsCreateTagDialogOpen(false);
    setIsNoteEditorOpen(true);
  };

  const handleNoteCreated = () => {
    setIsNoteEditorOpen(false);
    refreshTags();
    // Select the newly created tag
    setSelectedTag(newTagName.trim());
    setNewTagName("");
    
    toast({
      title: "Success",
      description: `Note with tag "${newTagName.trim()}" created successfully`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tags</h2>
        <Button onClick={() => setIsCreateTagDialogOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Tag
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : tagStats.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No tags found</h3>
          <p className="text-muted-foreground mt-2">
            Create a new tag to organize your notes better
          </p>
          <Button onClick={() => setIsCreateTagDialogOpen(true)} className="mt-4">
            Create Your First Tag
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tagStats.map(({ tag, count }) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className="gap-2"
            >
              <Hash className="h-4 w-4" />
              {tag}
              <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">
                {count}
              </span>
            </Button>
          ))}
        </div>
      )}

      {selectedTag && (
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Notes tagged with "{selectedTag}"
          </h3>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No notes with this tag</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{note.content}</p>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={isCreateTagDialogOpen} onOpenChange={setIsCreateTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tag Name</label>
                <div className="relative mt-1">
                  <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                    className="pl-9"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Creating a tag will also create your first note with this tag.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Editor for the new tag */}
      {isNoteEditorOpen && (
        <NoteEditor
          isOpen={isNoteEditorOpen}
          onClose={handleNoteCreated}
          note={{
            id: crypto.randomUUID(),
            title: "",
            content: "",
            date: new Date().toISOString(),
            tags: [newTagName.trim()],
            isFavorite: false
          }}
        />
      )}
    </div>
  );
};

export default Tags;
