
import { useState } from "react";
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Share,
  Download,
  Hash,
  X,
} from "lucide-react";
import { saveNote } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoteEditor = ({ isOpen, onClose }: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleSave = () => {
    const note = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      tags,
      isFavorite: false,
    };
    saveNote(note);
    onClose();
    setTitle("");
    setContent("");
    setTags([]);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const exportAsPDF = () => {
    // TODO: Implement PDF export
    console.log("Exporting as PDF...");
  };

  const exportAsDoc = () => {
    // TODO: Implement DOC export
    console.log("Exporting as DOC...");
  };

  const shareNote = () => {
    // TODO: Implement sharing
    console.log("Sharing note...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 p-1 border border-border rounded-md">
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
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
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[200px]"
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
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleAddTag}
                placeholder="Add tags..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shareNote}>
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsPDF}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsDoc}>
              <Download className="h-4 w-4 mr-1" />
              DOC
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Note</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
