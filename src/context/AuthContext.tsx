
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Defer data fetching to prevent deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast.error("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setCurrentUser({
          id: userId,
          email: session?.user?.email || '',
          name: data.name || '',
          avatar: data.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Clean up existing state to prevent auth conflicts
      cleanupAuthState();
      
      // Try global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Successfully logged in!");
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Invalid email or password");
      } else if (error.message.includes('Email not confirmed')) {
        toast.error("Please confirm your email before logging in");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully!");
      
      if (data.session === null) {
        toast.info("Please check your email to confirm your account.");
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Handle user-friendly error messages
      if (error.message.includes('User already registered')) {
        toast.error("Email already in use. Please login instead.");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      setCurrentUser(null);
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const updateUser = async (user: User) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          avatar_url: user.avatar
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setCurrentUser(user);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Update user error:', error);
      toast.error("Failed to update profile");
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
