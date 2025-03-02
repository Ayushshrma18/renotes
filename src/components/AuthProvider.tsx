
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { Navigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { getUserProfile, type UserProfile } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, profile: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    // Configure Supabase to persist sessions
    try {
      // Set session persistence to true by default
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          setProfile(getUserProfile());
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error configuring auth:", error);
      setLoading(false);
    }

    // Check for user preference
    const theme = localStorage.getItem('theme') || 'light';
    setTheme(theme);
    
    // Apply settings from localStorage if available
    const settings = localStorage.getItem('settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      if (parsedSettings.darkMode) {
        setTheme('dark');
      }
    }

    // Initial session check with persistence
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        setProfile(getUserProfile());
      }
      setLoading(false);
    });
  }, [setTheme]);

  return (
    <AuthContext.Provider value={{ user, loading, profile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
