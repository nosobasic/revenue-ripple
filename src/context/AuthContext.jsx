import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthService } from "../services/authService";
import { UserService } from "../services/userService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("revenue-ripple-auth-token");

    if (!token) {
      supabase.auth.signOut().finally(() => {
        setUser(null);
        setSession(null);
        setLoading(false);
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authUser) => {
    try {
      const userData = await AuthService.fetchUserData(authUser);
      setUser(userData);
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUser({
        ...authUser,
        role: 'member',
        status: 'active'
      });
    }
  };

  async function signup(email, password, firstName, lastName) {
    try {
      setLoading(true);
      const authData = await AuthService.signup(email, password, firstName, lastName);
      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setLoading(true);
      const authData = await AuthService.login(email, password);
      await fetchUserData(authData);
      return authData;
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

      await UserService.updateProfile(user.id, profileData);

      // Update the local user state
      setUser((prev) => ({
        ...prev,
        ...profileData,
        updated_at: new Date().toISOString(),
      }));

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      const data = await AuthService.resetPassword(email);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function updatePassword(newPassword) {
    try {
      await AuthService.updatePassword(newPassword);
      return true;
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
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
