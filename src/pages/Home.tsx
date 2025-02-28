
import { useState, useEffect } from "react";
import { Plus, Search, Heart, Trash2, Bookmark, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoteEditor from "@/components/NoteEditor";
import NoteView from "@/components/NoteView";
import { getNotes, toggleFavorite, deleteNote, type Note, syncNotesFromDatabase } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load notes and sync with database if user is logged in
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        let loadedNotes;
        if (user) {
          // If user is logged in, sync notes from database
          loadedNotes = await syncNotesFromDatabase();
          toast({
            title: "Notes synced",
            description: "Your notes have been synced from the cloud",
          });
        } else {
          // If not logged in, just load from local storage
          loadedNotes = getNotes();
        }
        
        // Filter out private notes from the notes list
        loadedNotes = loadedNotes.filter(note => 
          !note.deletedAt && !note.tags.includes("private")
        );
        
        setNotes(loadedNotes);
        
        // Extract all unique tags from non-private notes
        const allTags = loadedNotes
          .flatMap(note => note.tags)
          .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
          
        setAvailableTags(allTags);
      } catch (error) {
        console.error("Error loading notes:", error);
        toast({
          title: "Error",
          description: "Failed to load your notes",
          variant: "destructive",
        });
        // Fallback to local storage
        const savedNotes = getNotes()
          .filter(note => !note.deletedAt && !note.tags.includes("private"));
        setNotes(savedNotes);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [user, toast]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsViewerOpen(true);
  };

  const handleEditorOpen = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    // Refresh notes list with non-private notes
    const updatedNotes = getNotes().filter(note => 
      !note.deletedAt && !note.tags.includes("private")
    );
    setNotes(updatedNotes);
    
    // Refresh available tags
    const allTags = updatedNotes
      .flatMap(note => note.tags)
      .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
      
    setAvailableTags(allTags);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    // Refresh notes list after viewing (in case edits were made)
    const updatedNotes = getNotes().filter(note => 
      !note.deletedAt && !note.tags.includes("private")
    );
    setNotes(updatedNotes);
  };

  const handleToggleFavorite = async (noteId: string) => {
    try {
      await toggleFavorite(noteId);
      const updatedNotes = getNotes().filter(note => 
        !note.deletedAt && !note.tags.includes("private")
      );
      setNotes(updatedNotes);
      toast({
        title: "Note updated",
        description: "Note has been added to favorites",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      const updatedNotes = getNotes().filter(note => 
        !note.deletedAt && !note.tags.includes("private")
      );
      setNotes(updatedNotes);
      toast({
        title: "Note moved to trash",
        description: "Note will be permanently deleted after 14 days",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to move note to trash",
        variant: "destructive",
      });
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const filteredNotes = notes.filter(
    (note) => {
      // First filter by search query
      const matchesSearch = 
        (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
         note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Then filter by selected tags (if any)
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => note.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9 h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="rounded-full px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableTags.length > 0 ? (
                availableTags.map(tag => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTagFilter(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No tags available
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={handleEditorOpen} className="h-11 rounded-xl gap-2">
          <Plus className="h-5 w-5" />
          New Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-card/50 rounded-xl backdrop-blur-sm border border-border/50">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No notes found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters" 
              : "Create your first note by clicking the 'New Note' button"}
          </p>
          {!searchQuery && selectedTags.length === 0 && (
            <Button onClick={handleEditorOpen} className="mt-4 rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="glass-card p-4 rounded-xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-colors group cursor-pointer"
              onClick={() => handleNoteClick(note)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(note.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        note.isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-secondary/80 text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground/70 mt-4">
                {new Date(note.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <NoteEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
      />
      
      <NoteView
        isOpen={isViewerOpen}
        onClose={handleViewerClose}
        note={selectedNote}
      />
    </div>
  );
};

export default Home;
