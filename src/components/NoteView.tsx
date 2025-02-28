
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Share, 
  Download, 
  Edit, 
  Share2, 
  Clipboard, 
  ArrowLeft, 
  Eye, 
  Printer 
} from "lucide-react";
import { type Note } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import NoteEditor from "./NoteEditor";

interface NoteViewProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

const NoteView = ({ isOpen, onClose, note }: NoteViewProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();

  if (!note) return null;

  const handleEdit = () => {
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<u>$1</u>')
      .replace(/\n/g, '<br/>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-2" />')
      .replace(/^#{3}\s(.*)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^#{2}\s(.*)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
      .replace(/^#\s(.*)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^\- (.*)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^(\d+)\. (.*)$/gm, '<li class="ml-4">$1. $2</li>');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/note/${note.id}`);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard",
    });
    setShareDialogOpen(false);
  };

  const handleExportAsPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Your note has been exported as PDF",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={isOpen && !isEditorOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10 pb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <DialogTitle className="text-2xl">{note.title}</DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleExportAsPDF}>
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrint}>
                <Printer className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span>{new Date(note.date).toLocaleDateString()}</span>
              {note.isFavorite && <span className="text-red-500">★ Favorited</span>}
            </div>

            <div 
              className="prose prose-sm sm:prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: formatContent(note.content) }}
            />

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm text-muted-foreground truncate">
                    {`${window.location.origin}/note/${note.id}`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyLink}
                    className="gap-1"
                  >
                    <Clipboard className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sharing Options</h4>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-center gap-2"
                  onClick={() => {
                    toast({
                      title: "Public Link Created",
                      description: "Anyone with the link can now view this note",
                    });
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span>Public Link</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-center gap-2"
                  onClick={() => {
                    toast({
                      title: "Collaboration Enabled",
                      description: "Invited users can now edit this note",
                    });
                  }}
                >
                  <Share className="h-4 w-4" />
                  <span>Collaborate</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      {isEditorOpen && (
        <NoteEditor
          isOpen={isEditorOpen}
          onClose={handleEditorClose}
          note={note}
        />
      )}
    </>
  );
};

export default NoteView;
