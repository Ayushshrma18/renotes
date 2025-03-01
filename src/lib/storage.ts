import { supabase } from '@/supabaseClient';

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

// Function to save note to local storage and sync with database
export const saveNote = async (note: Note) => {
  // Local storage operations
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

  // Sync with database if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      // Convert from our local Note format to database format
      const dbNote = {
        id: note.id,
        user_id: user.id,
        title: note.title,
        content: note.content,
        date: new Date(note.date).toISOString(),
        tags: note.tags,
        is_favorite: note.isFavorite,
        points: note.points || 0,
        deleted_at: note.deletedAt ? new Date(note.deletedAt).toISOString() : null
      };

      // Upsert note to database
      const { error } = await supabase
        .from('notes')
        .upsert(dbNote, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error syncing note with database:', error);
      }
    } catch (error) {
      console.error('Error in database operation:', error);
    }
  }
};

// Function to load notes from database and merge with local storage
export const syncNotesFromDatabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return getNotes(); // Return local notes if not logged in
  }

  try {
    // Get notes from database
    const { data: dbNotes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching notes from database:', error);
      return getNotes();
    }

    if (!dbNotes || dbNotes.length === 0) {
      // No notes in database, sync local notes to database
      const localNotes = getNotes();
      if (localNotes.length > 0) {
        // Upload local notes to database
        for (const note of localNotes) {
          await saveNote(note);
        }
      }
      return localNotes;
    }

    // Convert database notes to our local Note format
    const formattedNotes: Note[] = dbNotes.map(dbNote => ({
      id: dbNote.id,
      title: dbNote.title,
      content: dbNote.content,
      date: new Date(dbNote.date).toISOString(),
      tags: dbNote.tags || [],
      isFavorite: dbNote.is_favorite,
      points: dbNote.points,
      deletedAt: dbNote.deleted_at ? new Date(dbNote.deleted_at).toISOString() : null
    }));

    // Save to local storage
    localStorage.setItem("notes", JSON.stringify(formattedNotes));
    
    return formattedNotes;
  } catch (error) {
    console.error('Error syncing notes from database:', error);
    return getNotes();
  }
};

export const getNotes = (): Note[] => {
  const notes = localStorage.getItem("notes");
  return notes ? JSON.parse(notes) : [];
};

export const getActiveNotes = (): Note[] => {
  return getNotes().filter((note) => !note.deletedAt && !note.tags.includes("private"));
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

export const deleteNote = async (id: string) => {
  const notes = getNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex >= 0) {
    notes[noteIndex].deletedAt = new Date().toISOString();
    localStorage.setItem("notes", JSON.stringify(notes));
    
    // Sync deletion with database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error syncing note deletion with database:', error);
      }
    }
  }
};

export const permanentlyDeleteNote = async (id: string) => {
  // Update local storage
  const notes = getNotes();
  const updatedNotes = notes.filter(note => note.id !== id);
  localStorage.setItem("notes", JSON.stringify(updatedNotes));
  
  // Delete from database if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error permanently deleting note from database:', error);
      throw error;
    }
  }
};

export const restoreNote = async (id: string) => {
  const notes = getNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex >= 0) {
    notes[noteIndex].deletedAt = null;
    localStorage.setItem("notes", JSON.stringify(notes));
    
    // Sync restore with database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: null })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error syncing note restoration with database:', error);
      }
    }
  }
};

export const toggleFavorite = async (id: string) => {
  const notes = getNotes();
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.isFavorite = !note.isFavorite;
    localStorage.setItem("notes", JSON.stringify(notes));
    
    // Sync favorite status with database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: note.isFavorite })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error syncing note favorite status with database:', error);
      }
    }
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
