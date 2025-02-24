
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  isFavorite: boolean;
}

export const saveNote = (note: Note) => {
  const notes = getNotes();
  const existingNoteIndex = notes.findIndex((n) => n.id === note.id);

  if (existingNoteIndex >= 0) {
    notes[existingNoteIndex] = note;
  } else {
    notes.push(note);
  }

  localStorage.setItem("notes", JSON.stringify(notes));
};

export const getNotes = (): Note[] => {
  const notes = localStorage.getItem("notes");
  return notes ? JSON.parse(notes) : [];
};

export const deleteNote = (id: string) => {
  const notes = getNotes().filter((note) => note.id !== id);
  localStorage.setItem("notes", JSON.stringify(notes));
};

export const toggleFavorite = (id: string) => {
  const notes = getNotes();
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.isFavorite = !note.isFavorite;
    localStorage.setItem("notes", JSON.stringify(notes));
  }
};
