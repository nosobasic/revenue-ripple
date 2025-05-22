import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserData = async (authUser) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, role, plan, created_at, name, status, username, commission_rate')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (userData) {
        setUser({
          ...authUser,
          ...userData
        });
      } else {
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(authUser);
    }
  };

  async function signup(email, password, name) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create a user document in Supabase
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            role: 'member',
            created_at: new Date().toISOString(),
            phone: '',
            company: '',
            bio: ''
          }
        ]);

      if (userError) throw userError;

      return authData.user;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from signInWithPassword");

      await fetchUserData(authData.user);
      return authData.user;
    } catch (error) {
      console.error("login: error", error);
      throw error;
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      throw error;
    }
  }

  async function updateUserProfile(profileData) {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update the user's data in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          role: profileData.role,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update the local user state
      setUser(prev => ({
        ...prev,
        ...profileData
      }));

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  const value = {
    user,
    session,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}