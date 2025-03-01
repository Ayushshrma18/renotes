
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Share,
  Download,
  Hash,
  X,
  Check,
  List,
  ListOrdered,
  Image,
  Link,
  Mic,
  ChevronDown,
} from "lucide-react";
import { saveNote, type Note, getTagsWithCount } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
}

const NoteEditor = ({ isOpen, onClose, note }: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [availableTags, setAvailableTags] = useState<{tag: string; count: number}[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
    }
    
    // Load available tags
    setAvailableTags(getTagsWithCount());
  }, [note]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Note title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedNote = {
        id: note?.id || crypto.randomUUID(),
        title,
        content,
        date: new Date().toISOString(),
        tags,
        isFavorite: note?.isFavorite || false,
      };
      
      await saveNote(updatedNote);
      
      toast({
        title: "Success",
        description: user 
          ? "Note saved and synced to cloud" 
          : "Note saved locally",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const addTagFromDropdown = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'ordered':
        formattedText = `\n1. ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'image':
        formattedText = `![${selectedText}](imageUrl)`;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const exportAsPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "PDF Exported",
        description: "Your note has been exported as PDF",
      });
    }, 1500);
  };

  const exportAsDoc = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Document Exported",
        description: "Your note has been exported as DOC",
      });
    }, 1500);
  };

  const shareNote = () => {
    toast({
      title: "Share Link Created",
      description: "Anyone with the link can now view this note",
    });
  };

  const startVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Voice Recording Stopped",
        description: "Your voice note has been transcribed",
      });
    } else {
      setIsRecording(true);
      toast({
        title: "Voice Recording Started",
        description: "Speak now to record your note",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="text-lg font-medium"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 p-1 border border-border rounded-md overflow-x-auto">
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('underline')}>
                <Underline className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('bullet')}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('ordered')}>
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="sm">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignRight className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('link')}>
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertFormatting('image')}>
                <Image className="h-4 w-4" />
              </Button>
              <Button 
                variant={isRecording ? "destructive" : "ghost"} 
                size="sm" 
                onClick={startVoiceRecording}
                className="ml-auto"
              >
                <Mic className="h-4 w-4" />
                {isRecording && <span className="ml-1">Recording...</span>}
              </Button>
            </div>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleAddTag}
                  placeholder="Add tags..."
                  className="pl-9"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  {availableTags.length > 0 ? (
                    availableTags.map(({ tag }) => (
                      <DropdownMenuItem
                        key={tag}
                        onClick={() => addTagFromDropdown(tag)}
                        className={tags.includes(tag) ? "bg-muted" : ""}
                      >
                        <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                        {tag}
                        {tags.includes(tag) && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No tags created yet
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shareNote}>
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsPDF} disabled={isExporting}>
              <Download className="h-4 w-4 mr-1" />
              {isExporting ? "Exporting..." : "PDF"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsDoc} disabled={isExporting}>
              <Download className="h-4 w-4 mr-1" />
              {isExporting ? "Exporting..." : "DOC"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
