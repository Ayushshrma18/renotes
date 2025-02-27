
import { useState, useEffect } from "react";
import { getTagsWithCount, getNotesByTag, type Note, syncNotesFromDatabase } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Tags = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagStats, setTagStats] = useState<{ tag: string; count: number }[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Tags</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : tagStats.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No tags found</h3>
          <p className="text-muted-foreground mt-2">
            Add tags to your notes to organize them better
          </p>
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
    </div>
  );
};

export default Tags;
