
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getNoteByShareId, type Note } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Heart, MessageSquare, Share } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Helper function to convert markdown to HTML (simplified implementation)
const convertMarkdownToHtml = (markdown: string) => {
  if (!markdown) return "";
  
  return markdown
    // Headers
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Underline
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')
    // Lists
    .replace(/^\s*- (.*?)$/gm, '<li>$1</li>')
    .replace(/^\s*\d+\. (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    // Mention
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n([^<])/g, '<br />$1')
    // Wrap in paragraph if not already wrapped
    .replace(/^([^<].*[^>])$/gm, '<p>$1</p>');
};

const ViewSharedNote = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        if (!noteId) {
          setError("Note ID is missing");
          setLoading(false);
          return;
        }
        
        const fetchedNote = await getNoteByShareId(noteId);
        if (!fetchedNote) {
          setError("Note not found or not publicly available");
        } else {
          setNote(fetchedNote);
        }
      } catch (err) {
        console.error("Error fetching note:", err);
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNote();
  }, [noteId]);
  
  const handleShareNote = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Could not copy link:", err);
        toast({
          title: "Error",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      });
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/app/world">
            <Button variant="ghost" size="sm" className="mb-6">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to World
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !note) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Link to="/app/world">
          <Button variant="ghost" size="sm" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to World
          </Button>
        </Link>
        
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "This note could not be found or is not publicly available"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/app/world">
              <Button>Return to World</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/app/world">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to World
          </Button>
        </Link>
      </div>
      
      <article className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{note.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {note.author || "Anonymous"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(note.date)}
            </span>
          </div>
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="prose prose-vercel dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(note.content) }} />
        </div>
        
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Comment</span>
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShareNote}>
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ViewSharedNote;
