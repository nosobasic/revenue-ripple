import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/authService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.warn('Supabase not configured, skipping auth initialization');
          setUser(null);
          setSession(null);
          return;
        }
        
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setSession({ user: currentUser });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserData = async (authUser) => {
    try {
      const userData = await AuthService.getUserById(authUser.id);
      if (userData) {
        setUser(userData);
      } else {
        setUser({
          ...authUser,
          role: 'member',
          status: 'active'
        });
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUser({
        ...authUser,
        role: 'member',
        status: 'active'
      });
    }
  };

  async function signup(email, password, name) {
    try {
      setLoading(true);
      const user = await AuthService.signup(email, password, name);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setLoading(true);
      const user = await AuthService.login(email, password);
      setUser(user);
      setSession({ user });
      return user;
    } catch (error) {
      console.error("login: error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function updateUserProfile(profileData) {
    try {
      if (!user) throw new Error("No user logged in");
      const updatedUser = await AuthService.updateProfile(user.id, profileData);
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      return await AuthService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  }

  const value = {
    user,
    session,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
