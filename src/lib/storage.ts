export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  isFavorite: boolean;
  points?: number;
  deletedAt?: string | null;
}

export interface UserProfile {
  username: string;
  avatarUrl?: string;
  points: number;
  streak: number;
  lastNoteDate?: string;
}

export const saveNote = (note: Note) => {
  const notes = getNotes();
  const existingNoteIndex = notes.findIndex((n) => n.id === note.id);

  if (existingNoteIndex === -1) {
    const userProfile = getUserProfile();
    userProfile.points += 5;
    updateStreak(userProfile);
    saveUserProfile(userProfile);
    note.points = 5;
  }

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

export const getActiveNotes = (): Note[] => {
  return getNotes().filter((note) => !note.deletedAt);
};

export const getDeletedNotes = (): Note[] => {
  const now = new Date();
  return getNotes().filter((note) => {
    if (!note.deletedAt) return false;
    const deleteDate = new Date(note.deletedAt);
    const daysSinceDelete = (now.getTime() - deleteDate.getTime()) / (1000 * 3600 * 24);
    return daysSinceDelete <= 14;
  });
};

export const deleteNote = (id: string) => {
  const notes = getNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex >= 0) {
    notes[noteIndex].deletedAt = new Date().toISOString();
    localStorage.setItem("notes", JSON.stringify(notes));
  }
};

export const restoreNote = (id: string) => {
  const notes = getNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex >= 0) {
    notes[noteIndex].deletedAt = null;
    localStorage.setItem("notes", JSON.stringify(notes));
  }
};

export const toggleFavorite = (id: string) => {
  const notes = getNotes();
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.isFavorite = !note.isFavorite;
    localStorage.setItem("notes", JSON.stringify(notes));
  }
};

export const getUserProfile = (): UserProfile => {
  const profile = localStorage.getItem("userProfile");
  return profile
    ? JSON.parse(profile)
    : {
        username: "User",
        points: 0,
        streak: 0,
      };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem("userProfile", JSON.stringify(profile));
};

const updateStreak = (profile: UserProfile) => {
  const today = new Date().toISOString().split('T')[0];
  const lastNoteDate = profile.lastNoteDate ? profile.lastNoteDate.split('T')[0] : null;

  if (!lastNoteDate) {
    profile.streak = 1;
  } else if (lastNoteDate === today) {
    // Already wrote today, streak unchanged
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    if (lastNoteDate === yesterdayString) {
      profile.streak += 1;
    } else {
      profile.streak = 1;
    }
  }
  
  profile.lastNoteDate = today;
};

export const getTagsWithCount = () => {
  const notes = getActiveNotes();
  const tagCount: Record<string, number> = {};
  
  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCount).map(([tag, count]) => ({ tag, count }));
};

export const getNotesByTag = (tag: string) => {
  return getActiveNotes().filter((note) => note.tags.includes(tag));
};
