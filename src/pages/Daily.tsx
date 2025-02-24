
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { getActiveNotes, type Note } from "@/lib/storage";
import NoteEditor from "@/components/NoteEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Daily = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    if (date) {
      const selectedDate = date.toISOString().split('T')[0];
      const dailyNotes = getActiveNotes().filter(
        note => note.date.split('T')[0] === selectedDate
      );
      setNotes(dailyNotes);
    }
  }, [date]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    if (date) {
      const selectedDate = date.toISOString().split('T')[0];
      const dailyNotes = getActiveNotes().filter(
        note => note.date.split('T')[0] === selectedDate
      );
      setNotes(dailyNotes);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
      <div className="glass-card p-4 rounded-lg h-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </div>
      <div className="glass-card p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {date?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <Button onClick={handleNewNote}>
            <Plus className="h-5 w-5 mr-2" />
            New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No notes for this day</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="note-card cursor-pointer"
                onClick={() => handleNoteClick(note)}
              >
                <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                <p className="text-muted-foreground line-clamp-3">{note.content}</p>
                {note.tags.length > 0 && (
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
                )}
              </div>
            ))
          )}
        </div>

        <NoteEditor
          isOpen={isEditorOpen}
          onClose={handleEditorClose}
          note={selectedNote}
        />
      </div>
    </div>
  );
};

export default Daily;
