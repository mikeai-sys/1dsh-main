import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  account_type: 'adult' | 'kids' | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User | null) => {
    if (currentUser) {
      // Fetch profile data from public.profiles table, including is_admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar_url, account_type, is_admin') // Select is_admin from profiles
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      setProfile({
        name: profileData?.name || null,
        avatar_url: profileData?.avatar_url || null,
        is_admin: profileData?.is_admin || false, // Default to false if not found or null
        account_type: profileData?.account_type || 'adult', // Default to 'adult'
      });
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await fetchProfile(currentUser);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await fetchProfile(currentUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refetchProfile = async () => {
    await fetchProfile(user);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};