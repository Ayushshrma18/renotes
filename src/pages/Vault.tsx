import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Eye, EyeOff, X, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getNotes, type Note, saveNote } from "@/lib/storage";
import { useAuth } from "@/components/AuthProvider";
import NoteEditor from "@/components/NoteEditor";

const Vault = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isPinSetup, setIsPinSetup] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [privateNotes, setPrivateNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const savedPin = localStorage.getItem("vault_pin");
    if (savedPin) {
      setStoredPin(savedPin);
      setIsPinSetup(true);
    }
  }, []);

  const handleSetupPin = () => {
    if (pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure your PINs match",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("vault_pin", pin);
    setStoredPin(pin);
    setIsPinSetup(true);
    toast({
      title: "PIN Set",
      description: "Your vault PIN has been set",
    });
  };

  const unlockVault = () => {
    if (pin === storedPin) {
      setIsLocked(false);
      const allNotes = getNotes();
      const vaultNotes = allNotes.filter(note => 
        note.tags.includes("private") && !note.deletedAt
      );
      setPrivateNotes(vaultNotes);
      toast({
        title: "Vault Unlocked",
        description: "Your private notes are now accessible",
      });
    } else {
      toast({
        title: "Incorrect PIN",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const lockVault = () => {
    setIsLocked(true);
    setPin("");
    setShowPin(false);
    toast({
      title: "Vault Locked",
      description: "Your private notes are now secure",
    });
  };

  const handleCreatePrivateNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    
    const allNotes = getNotes();
    const vaultNotes = allNotes.filter(note => 
      note.tags.includes("private") && !note.deletedAt
    );
    setPrivateNotes(vaultNotes);
  };

  const VaultNoteEditor = ({ isOpen, onClose, note }: { isOpen: boolean, onClose: () => void, note: Note | null }) => {
    return (
      <NoteEditor
        isOpen={isOpen}
        onClose={onClose}
        note={note ? 
          { ...note, tags: note.tags.includes("private") ? note.tags : [...note.tags, "private"] } 
          : { id: crypto.randomUUID(), title: "", content: "", date: new Date().toISOString(), tags: ["private"], isFavorite: false }
        }
      />
    );
  };

  if (isLocked) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Secure Vault</h2>
          <p className="text-muted-foreground">
            {isPinSetup
              ? "Enter your PIN to access private notes"
              : "Set up a PIN to protect your private notes"}
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
          {isPinSetup ? (
            <>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN"
                    className="h-11 pr-10"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={unlockVault}
                className="w-full gap-2"
                disabled={!pin}
              >
                <Unlock className="h-4 w-4" />
                Unlock Vault
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Create PIN</label>
                  <div className="relative">
                    <Input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Create PIN"
                      className="h-11 pr-10"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm PIN</label>
                  <Input
                    type={showPin ? "text" : "password"}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Confirm PIN"
                    className="h-11"
                    maxLength={6}
                  />
                </div>
              </div>
              <Button
                onClick={handleSetupPin}
                className="w-full"
                disabled={!pin || !confirmPin}
              >
                Set PIN
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Secure Vault</h2>
          <p className="text-muted-foreground">
            Your private notes are end-to-end encrypted
          </p>
        </div>
        <Button variant="outline" onClick={lockVault} className="gap-2">
          <Lock className="h-4 w-4" />
          Lock Vault
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCreatePrivateNote} className="gap-2">
          <span>Add Private Note</span>
        </Button>
      </div>

      {privateNotes.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl backdrop-blur-sm border border-border/50">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-medium">No private notes yet</h3>
          <p className="text-muted-foreground mt-2">
            Create a new note and add the "private" tag to store it here
          </p>
          <Button onClick={handleCreatePrivateNote} className="mt-4">
            Create Private Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {privateNotes.map((note) => (
            <div
              key={note.id}
              className="glass-card p-4 rounded-xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-colors group cursor-pointer"
              onClick={() => handleNoteClick(note)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                  {note.title}
                </h3>
                <Lock className="h-4 w-4 text-primary/50" />
              </div>
              <p className="text-muted-foreground line-clamp-3 mb-3">
                {note.content}
              </p>
              <div className="text-xs text-muted-foreground/70 mt-4">
                {new Date(note.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <VaultNoteEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
      />
    </div>
  );
};

export default Vault;
