import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const authStateChangeRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Clear any stale manual tokens that might conflict with Supabase's session management
        const manualToken = localStorage.getItem("revenue-ripple-auth-token");
        if (manualToken && !manualToken.startsWith('{"')) {
          // Remove old-style manual tokens that aren't Supabase session objects
          localStorage.removeItem("revenue-ripple-auth-token");
        }

        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setSession(null);
          setUser(null);
          setLoading(false);
          setInitialized(true);
          return;
        }

        setSession(session);
        if (session?.user) {
          await fetchUserData(session.user);
        } else {
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event, session?.user?.id);
      
      // Prevent race conditions by checking if this is a duplicate event
      if (authStateChangeRef.current === session?.access_token) {
        return;
      }
      authStateChangeRef.current = session?.access_token;
      
      setSession(session);
      
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
      }
      
      if (!initialized) {
        setInitialized(true);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserData = async (authUser) => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select(
          "id, email, role, plan, created_at, name, status, username, commission_rate"
        )
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        // If user doesn't exist in users table, create basic user object
        setUser({
          ...authUser,
          role: 'member', // default role
          status: 'active'
        });
        return;
      }

      if (userData) {
        setUser({
          ...authUser,
          ...userData,
        });
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
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create a user document in Supabase
      if (authData.user) {
        const { error: userError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            name,
            email,
            role: "member",
            status: "active",
            created_at: new Date().toISOString(),
            phone: "",
            company: "",
            bio: "",
          },
        ]);

        if (userError) {
          console.error("Error creating user record:", userError);
        }
      }

      return authData.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setLoading(true);
      
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;
      if (!authData.user)
        throw new Error("No user returned from signInWithPassword");

      // Don't manually fetch user data here - let the auth state change handler do it
      return authData.user;
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
      
      // Clear any manual tokens
      localStorage.removeItem("revenue-ripple-auth-token");
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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

      // Update the user's data in Supabase
      const { error } = await supabase
        .from("users")
        .update({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          role: profileData.role,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update the local user state
      setUser((prev) => ({
        ...prev,
        ...profileData,
      }));

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  const value = {
    user,
    session,
    loading: loading && !initialized, // Only show loading if not initialized yet
    initialized,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
