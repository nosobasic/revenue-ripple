import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.log("login: signing in with", email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("login: authData", authData, "authError", authError);

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from signInWithPassword");

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, plan, created_at, name, status, username, commission_rate')
        .eq('id', authData.user.id)
        .single();
      console.log("login: userData", userData, "userError", userError);

      if (userError) throw userError;
      if (!userData) throw new Error("No user row found in users table");

      setUser({
        ...authData.user,
        ...userData
      });

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

  useEffect(() => {
    console.log("AuthProvider useEffect: running");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: got session", session);
      if (session?.user) {
        supabase
          .from('users')
          .select('id, email, role, plan, created_at, name, status, username, commission_rate')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userData, error }) => {
            console.log("AuthProvider: got userData", userData, error);
            if (!error && userData) {
              setUser({
                ...session.user,
                ...userData
              });
            } else {
              setUser(session.user);
            }
          });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: onAuthStateChange", event, session);
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, role, plan, created_at, name, status, username, commission_rate')
          .eq('id', session.user.id)
          .single();

        if (!error && userData) {
          setUser({
            ...session.user,
            ...userData
          });
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
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