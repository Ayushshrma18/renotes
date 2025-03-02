
import { supabase } from '@/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  isFavorite: boolean;
  points?: number;
  deletedAt?: string | null;
  isPublished?: boolean;
  shareId?: string | null;
  mentions?: string[];
}

export interface UserProfile {
  username: string;
  avatarUrl?: string;
  points: number;
  streak: number;
  lastNoteDate?: string;
  followers?: string[];
  following?: string[];
}

export interface FriendActivity {
  username: string;
  avatarUrl?: string;
  action: string;
  date: string;
  noteId?: string;
  noteTitle?: string;
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
      // Extract mentions from content
      const mentionPattern = /@(\w+)/g;
      const mentions = [...note.content.matchAll(mentionPattern)].map(match => match[1]);
      note.mentions = mentions.length > 0 ? mentions : undefined;
      
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
        deleted_at: note.deletedAt ? new Date(note.deletedAt).toISOString() : null,
        is_published: note.isPublished || false,
        share_id: note.shareId || null,
        mentions: note.mentions || []
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
      deletedAt: dbNote.deleted_at ? new Date(dbNote.deleted_at).toISOString() : null,
      isPublished: dbNote.is_published || false,
      shareId: dbNote.share_id || null,
      mentions: dbNote.mentions || []
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

export const togglePublished = async (id: string) => {
  const notes = getNotes();
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.isPublished = !note.isPublished;
    
    // Generate or remove share ID
    if (note.isPublished) {
      if (!note.shareId) {
        note.shareId = uuidv4();
      }
    } else {
      note.shareId = null;
    }
    
    localStorage.setItem("notes", JSON.stringify(notes));
    
    // Sync published status with database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_published: note.isPublished,
          share_id: note.shareId
        })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error syncing note published status with database:', error);
      }
    }
    
    return note.shareId;
  }
  return null;
};

export const getUserProfile = (): UserProfile => {
  const profile = localStorage.getItem("userProfile");
  return profile
    ? JSON.parse(profile)
    : {
        username: "User",
        points: 0,
        streak: 0,
        followers: [],
        following: []
      };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem("userProfile", JSON.stringify(profile));
};

export const syncUserProfileWithSupabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // Get user metadata from Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return;
    }
    
    const metadata = userData.user?.user_metadata;
    
    if (metadata) {
      const localProfile = getUserProfile();
      const updatedProfile = {
        ...localProfile,
        username: metadata.username || localProfile.username,
        avatarUrl: metadata.avatar_url || localProfile.avatarUrl,
        followers: metadata.followers || localProfile.followers || [],
        following: metadata.following || localProfile.following || []
      };
      
      saveUserProfile(updatedProfile);
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
  }
};

export const updateUserProfileToSupabase = async (profile: Partial<UserProfile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        username: profile.username,
        avatar_url: profile.avatarUrl,
        followers: profile.followers,
        following: profile.following
      }
    });
    
    if (error) {
      console.error('Error updating user profile to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
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

export const getNoteByShareId = async (shareId: string): Promise<Note | null> => {
  // First try local storage
  const notes = getNotes();
  const sharedNote = notes.find(note => note.shareId === shareId && note.isPublished);
  
  if (sharedNote) {
    return sharedNote;
  }
  
  // If not in local storage, try database
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('share_id', shareId)
      .eq('is_published', true)
      .single();
    
    if (error || !data) {
      console.error('Error fetching shared note:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      date: new Date(data.date).toISOString(),
      tags: data.tags || [],
      isFavorite: data.is_favorite,
      points: data.points,
      isPublished: data.is_published,
      shareId: data.share_id
    };
  } catch (error) {
    console.error('Error fetching shared note:', error);
    return null;
  }
};

export const getPublishedNotes = async () => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching published notes:', error);
      return [];
    }
    
    return data.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      date: new Date(note.date).toISOString(),
      tags: note.tags || [],
      author: note.profiles?.username || 'Anonymous',
      authorAvatar: note.profiles?.avatar_url,
      shareId: note.share_id
    }));
  } catch (error) {
    console.error('Error fetching published notes:', error);
    return [];
  }
};

export const followUser = async (userId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  try {
    // Get current user profile
    const localProfile = getUserProfile();
    const following = [...(localProfile.following || [])];
    
    // Add userId to following list if not already there
    if (!following.includes(userId)) {
      following.push(userId);
      
      // Update local profile
      localProfile.following = following;
      saveUserProfile(localProfile);
      
      // Update Supabase profile
      await updateUserProfileToSupabase({ following });
      
      // Also update the followed user's followers list
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error || !data?.user) {
        console.error('Error fetching followed user data:', error);
        return false;
      }
      
      const followedUserMetadata = data.user.user_metadata || {};
      const followers = [...(followedUserMetadata.followers || [])];
      
      if (!followers.includes(user.id)) {
        followers.push(user.id);
        
        // Update followed user's metadata
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...followedUserMetadata,
            followers
          }
        });
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

export const unfollowUser = async (userId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  try {
    // Get current user profile
    const localProfile = getUserProfile();
    let following = [...(localProfile.following || [])];
    
    // Remove userId from following list
    following = following.filter(id => id !== userId);
    
    // Update local profile
    localProfile.following = following;
    saveUserProfile(localProfile);
    
    // Update Supabase profile
    await updateUserProfileToSupabase({ following });
    
    // Also update the unfollowed user's followers list
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !data?.user) {
      console.error('Error fetching unfollowed user data:', error);
      return false;
    }
    
    const unfollowedUserMetadata = data.user.user_metadata || {};
    let followers = [...(unfollowedUserMetadata.followers || [])];
    
    followers = followers.filter(id => id !== user.id);
    
    // Update unfollowed user's metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...unfollowedUserMetadata,
        followers
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

export const getFriendActivity = async (): Promise<FriendActivity[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  try {
    const localProfile = getUserProfile();
    const following = localProfile.following || [];
    
    if (following.length === 0) {
      return [];
    }
    
    // Get latest notes from followed users
    const { data, error } = await supabase
      .from('notes')
      .select('*, profiles:user_id(username, avatar_url)')
      .in('user_id', following)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching friend activity:', error);
      return [];
    }
    
    return data.map(note => ({
      username: note.profiles?.username || 'Unknown',
      avatarUrl: note.profiles?.avatar_url,
      action: note.is_published ? 'published' : 'created',
      date: new Date(note.date).toISOString(),
      noteId: note.id,
      noteTitle: note.title
    }));
  } catch (error) {
    console.error('Error fetching friend activity:', error);
    return [];
  }
};

export const searchNotes = (query: string): Note[] => {
  if (!query.trim()) return [];
  
  const notes = getActiveNotes();
  const lowerQuery = query.toLowerCase();
  
  return notes.filter(note => 
    note.title.toLowerCase().includes(lowerQuery) || 
    note.content.toLowerCase().includes(lowerQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const searchUsers = async (query: string) => {
  if (!query.trim()) return [];
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};
