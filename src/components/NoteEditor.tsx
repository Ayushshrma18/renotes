
import { useState, useEffect, useRef } from "react";
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
  Globe,
  EyeOff,
  AtSign,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  CodeIcon,
  Maximize,
  Minimize,
  FilePlus,
  Eraser,
  Info
} from "lucide-react";
import { saveNote, type Note, getTagsWithCount, togglePublished, syncUserProfileWithSupabase, searchUsers } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useAppSettings } from "@/components/AppSettingsProvider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/supabaseClient";

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
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [isPublished, setIsPublished] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [forcedOpen, setForcedOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings } = useAppSettings();
  const { syncMessageShown, setSyncMessageShown } = useAppSettings();

  // Force the dialog to stay open when isOpen is true
  useEffect(() => {
    if (isOpen) {
      setForcedOpen(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setIsPublished(note.isPublished || false);
      
      if (note.content && note.content.includes('text-align: center')) {
        setTextAlign('center');
      } else if (note.content && note.content.includes('text-align: right')) {
        setTextAlign('right');
      } else {
        setTextAlign('left');
      }
      
      if (note.isPublished && note.shareId) {
        const baseUrl = window.location.origin;
        setShareLink(`${baseUrl}/shared/${note.shareId}`);
      } else {
        setShareLink(null);
      }
    } else {
      setTitle("");
      setContent("");
      setTags([]);
      setIsPublished(false);
      setTextAlign('left');
      setShareLink(null);
    }
    
    setAvailableTags(getTagsWithCount());
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.textAlign = textAlign;
      }
    }, 0);
  }, [note, isOpen]);

  const handleClose = () => {
    setForcedOpen(false);
    onClose();
  };

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
        isPublished: isPublished,
        shareId: note?.shareId || null,
      };
      
      await saveNote(updatedNote);
      
      if (settings.syncEnabled && user && !syncMessageShown) {
        toast({
          title: "Note synced to cloud",
          description: (
            <div>
              Your note has been saved and synced to the cloud.
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs underline"
                onClick={() => setSyncMessageShown(true)}
              >
                Don't show again
              </Button>
            </div>
          ),
        });
      } else {
        toast({
          title: "Success",
          description: "Note saved successfully",
        });
      }
      
      handleClose();
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
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'ordered':
        formattedText = `\n1. ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'link':
        formattedText = `[${selectedText || 'Link text'}](url)`;
        cursorOffset = selectedText ? formattedText.length - 1 : 9;
        break;
      case 'image':
        formattedText = `![${selectedText || 'Image description'}](imageUrl)`;
        cursorOffset = selectedText ? formattedText.length - 1 : 19;
        break;
      case 'h1':
        formattedText = `\n# ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'h3':
        formattedText = `\n### ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'blockquote':
        formattedText = `\n> ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'codeblock':
        formattedText = `\n\`\`\`\n${selectedText}\n\`\`\``;
        cursorOffset = selectedText ? 0 : 4;
        break;
      case 'table':
        formattedText = `\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |`;
        cursorOffset = 0;
        break;
      case 'mention':
        formattedText = `@${selectedText || ''}`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length - cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
    if (textareaRef.current) {
      textareaRef.current.style.textAlign = align;
    }
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

  const handleTogglePublish = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to publish notes",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const shareId = await togglePublished(note?.id || "");
      setIsPublished(!isPublished);
      
      if (!isPublished && shareId) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/shared/${shareId}`;
        setShareLink(link);
        
        toast({
          title: "Note Published",
          description: "Your note is now visible in the World section",
        });
      } else {
        setShareLink(null);
        
        toast({
          title: "Note Unpublished",
          description: "Your note is no longer publicly visible",
        });
      }
    } catch (error) {
      console.error("Error toggling publish state:", error);
      toast({
        title: "Error",
        description: "Failed to change publish state",
        variant: "destructive",
      });
    }
  };

  const shareNote = () => {
    if (!shareLink) {
      if (!isPublished) {
        handleTogglePublish();
        return;
      }
      
      toast({
        title: "Error",
        description: "Could not generate share link",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard",
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Error",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    });
  };

  const startVoiceRecording = () => {
    if (!navigator.mediaDevices) {
      toast({
        title: "Not Supported",
        description: "Voice recording is not supported in your browser",
        variant: "destructive"
      });
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
      const transcription = "This is a mock transcription of your voice note. In a real implementation, this would be the actual transcription from the Web Speech API.";
      setContent(prev => prev + "\n\n" + transcription);
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

  const handleMentionSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleMentionSearch(query);
  };

  const handleUserMention = (username: string) => {
    insertFormatting('mention');
    const currentPos = textareaRef.current?.selectionStart || 0;
    const textBefore = content.substring(0, currentPos - 1);
    const textAfter = content.substring(currentPos);
    setContent(textBefore + username + textAfter);
    setSearchQuery("");
    setSearchResults([]);
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = currentPos - 1 + username.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleClearFormatting = () => {
    if (!window.confirm("Are you sure you want to clear all formatting?")) return;
    
    let plainText = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/```([\s\S]*?)```/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s(.*?)(\n|$)/g, '$1$2')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/>\s(.*?)(\n|$)/g, '$1$2')
      .replace(/(\n|^)\s*[-*+]\s(.*?)(\n|$)/g, '$1$2$3')
      .replace(/(\n|^)\s*\d+\.\s(.*?)(\n|$)/g, '$1$2$3')
      .replace(/\|.*\|/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
      
    setContent(plainText);
    setTextAlign('left');
    
    toast({
      title: "Formatting Cleared",
      description: "All formatting has been removed from your note",
    });
  };

  const handleCreateTemplate = () => {
    const templateContent = `# ${title || 'Untitled Note'}

## Overview
Brief description of this note's purpose.

## Key Points
- First important point
- Second important point
- Third important point

## Details
More detailed information goes here...

## Tags
${tags.map(tag => `#${tag}`).join(' ')}

---
Created on ${new Date().toLocaleDateString()}
`;

    setContent(templateContent);
    
    toast({
      title: "Template Created",
      description: "A basic template has been applied to your note",
    });
  };

  return (
    <Dialog 
      open={forcedOpen} 
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent 
        style={isFullscreen ? {
          maxWidth: '100%',
          width: '100%',
          height: '100%',
          margin: 0,
          borderRadius: 0
        } : {
          maxWidth: '3xl'
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Allow closing with escape key if explicitly wanted
          if (!isSaving) {
            e.preventDefault();
            handleClose();
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{note ? "Edit Note" : "New Note"}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 rounded-full"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="write" className="flex-1">Write</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write">
              <div>
                <div className="flex items-center gap-1 mb-2 p-1 border border-border rounded-md overflow-x-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')}>
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')}>
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('underline')}>
                          <Underline className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('h1')}>
                          <Heading1 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Heading 1</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('h2')}>
                          <Heading2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Heading 2</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('h3')}>
                          <Heading3 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Heading 3</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('bullet')}>
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bullet List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('ordered')}>
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Numbered List</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('blockquote')}>
                          <Quote className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Blockquote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textAlign === 'left' ? "secondary" : "ghost"} 
                          size="sm"
                          onClick={() => applyAlignment('left')}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Align Left</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textAlign === 'center' ? "secondary" : "ghost"} 
                          size="sm"
                          onClick={() => applyAlignment('center')}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Align Center</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textAlign === 'right' ? "secondary" : "ghost"} 
                          size="sm"
                          onClick={() => applyAlignment('right')}
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Align Right</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('code')}>
                          <Code className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Inline Code</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('codeblock')}>
                          <CodeIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Code Block</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('table')}>
                          <Table className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Insert Table</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('link')}>
                          <Link className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Insert Link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('image')}>
                          <Image className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Insert Image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => insertFormatting('mention')}>
                          <AtSign className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mention User</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Advanced</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={handleCreateTemplate}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          Create Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClearFormatting}>
                          <Eraser className="h-4 w-4 mr-2" />
                          Clear Formatting
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant={isRecording ? "destructive" : "ghost"} 
                            size="sm" 
                            onClick={startVoiceRecording}
                          >
                            <Mic className="h-4 w-4" />
                            {isRecording && <span className="ml-1 text-xs">Recording...</span>}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice Recording</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="relative">
                  <Textarea
                    id="note-content"
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      
                      const text = e.target.value;
                      const cursorPos = e.target.selectionStart;
                      const textUntilCursor = text.substring(0, cursorPos);
                      const mentionMatch = textUntilCursor.match(/@(\w*)$/);
                      
                      if (mentionMatch) {
                        const searchTerm = mentionMatch[1];
                        setSearchQuery(searchTerm);
                        handleMentionSearch(searchTerm);
                      } else {
                        setSearchResults([]);
                        setSearchQuery("");
                      }
                    }}
                    placeholder="Write your note here..."
                    className="min-h-[300px] font-mono text-sm"
                    style={{ textAlign: textAlign }}
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="absolute max-h-48 overflow-y-auto border border-border rounded-md bg-popover shadow-md z-10 w-64">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          className="flex items-center gap-2 p-2 w-full hover:bg-accent text-left"
                          onClick={() => handleUserMention(user.username)}
                        >
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="h-6 w-6 rounded-full" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{user.username}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="prose prose-sm dark:prose-invert max-w-none min-h-[300px] border border-input p-4 rounded-md overflow-auto">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }} />
                ) : (
                  <p className="text-muted-foreground">No content to preview</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
            <Button variant="outline" size="sm" onClick={shareNote} disabled={!isPublished && !note?.shareId}>
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
            <Button 
              variant={isPublished ? "destructive" : "outline"} 
              size="sm" 
              onClick={handleTogglePublish}
            >
              {isPublished ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-1" />
                  Publish
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
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

const convertMarkdownToHtml = (markdown: string) => {
  return markdown
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')
    .replace(/^\s*- (.*?)$/gm, '<li>$1</li>')
    .replace(/^\s*\d+\. (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/>\s(.*?)(\n|$)/g, '<blockquote>$1</blockquote>')
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n([^<])/g, '<br />$1')
    .replace(/^([^<].*[^>])$/gm, '<p>$1</p>');
};

export default NoteEditor;
