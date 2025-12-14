import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check if we're in the middle of OAuth callback
    const isOAuthCallback = window.location.pathname === '/auth/callback' || 
                            window.location.hash.includes('access_token');
    
    const token = localStorage.getItem("revenue-ripple-auth-token");

    // Don't force signOut during OAuth flow - let Supabase handle it
    if (!token && !isOAuthCallback) {
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
      const { data: userData, error } = await supabase
        .from("users")
        .select(
          "id, email, role, plan, created_at, name, status, phone, company, bio, paypal_email, has_paid, payment_status"
        )
        .eq("id", authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist in users table - create one (common with OAuth signups)
        console.log("Creating user record for OAuth user:", authUser.id);
        
        const newUser = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0],
          role: 'member',
          status: 'active',
          created_at: new Date().toISOString(),
          phone: authUser.user_metadata?.phone || '',
          company: '',
          bio: '',
          plan: '',
          paypal_email: null,
          has_paid: false,
          payment_status: 'pending'
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert([newUser]);

        if (insertError) {
          console.error("Error creating user record:", insertError);
        }

        setUser({
          ...authUser,
          ...newUser,
        });
        setLoading(false);
        return;
      }

      if (error) {
        console.error("Error fetching user data:", error);
        setUser({
          ...authUser,
          role: 'member',
          status: 'active',
          has_paid: false,
          payment_status: 'pending'
        });
        return;
      }

      if (userData) {
        setUser({
          ...authUser,
          // Ensure role always has a default value
          role: userData.role || 'member',
          ...userData,
        });
      } else {
        setUser({
          ...authUser,
          role: 'member',
          status: 'active',
          has_paid: false,
          payment_status: 'pending'
        });
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUser({
        ...authUser,
        role: 'member',
        status: 'active',
        has_paid: false,
        payment_status: 'pending'
      });
    } finally {
      // Ensure loading state is set to false after user data is fetched
      setLoading(false);
    }
  };

  async function signup(email, password, firstName, lastName ,role, paypal) {
    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log("authData==",authData, "authError==",authError)
      if (authError) throw authError;

      // Create a user document in Supabase
      if (authData.user) {
        const { error: userError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            name: firstName + " " + lastName,
            email,
            role: role,
            status: "active",
            created_at: new Date().toISOString(),
            phone: "",
            company: "",
            bio: "",
            plan: "",
            paypal_email: paypal,
            has_paid: false,
            payment_status: "pending"
          },
        ]);

        if (userError) {
          console.error("Error creating user record:", userError);
        }

        // Immediately fetch user data to populate auth context
        // This ensures the user object is available right after signup
        await fetchUserData(authData.user);
        
        // Store auth token in localStorage for persistence
        if (authData.session) {
          localStorage.setItem("revenue-ripple-auth-token", authData.session.access_token);
          setSession(authData.session);
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

      // Fetch full user data including payment status
      await fetchUserData(authData.user);
      
      // Wait a moment for state to update, then return the user from state
      // The user state will have the full data including has_paid
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return the auth user - the full user data is now in context state
      return authData.user;
    } catch (error) {
      console.error("login: error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    localStorage.removeItem("revenue-ripple-auth-token");
    try {
      setLoading(true);
      
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

    // Prepare data for the users table
    const updateData = {};
    if (profileData.name !== undefined) updateData.name = profileData.name;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.company !== undefined) updateData.company = profileData.company;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;

    console.log('Updating user profile with data:', updateData);

    // Handle email update separately if provided
    if (profileData.email !== undefined && profileData.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: profileData.email,
      });
      if (authError) {
        console.error("Error updating auth email:", authError);
        throw authError;
      }
      updateData.email = profileData.email; // Update email in users table as well
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      console.log("No changes to update");
      return true; // No changes to save
    }

    console.log("userId====", user.id)

    // Update the user's data in Supabase
    const r = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);
    console.log('update response',r)
    if (r.error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    // Update the local user state
    setUser((prev) => ({
      ...prev,
      ...updateData,
    }));

    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

async function resetPassword(email) {
  try {
    // Step 1: Query the users table
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (error) throw error;

    // If no user found
    if (!data || data.length === 0) {
      throw new Error("No account found with this email address.");
    }

    // Step 2: Trigger password reset
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) throw resetError;

    return resetData;
  } catch (error) {
    throw error;
  }
}

async function signInWithOAuth(provider, redirectPath = '/checkout?product=membership') {
  try {
    setLoading(true);
    
    console.log('🔵 Starting OAuth flow for:', provider);
    console.log('📍 Origin:', window.location.origin);
    console.log('📍 Redirect path to save:', redirectPath);
    
    // Store redirect path in localStorage so we can use it after OAuth callback
    localStorage.setItem('oauth-redirect-path', redirectPath);
    console.log('💾 Saved to localStorage:', localStorage.getItem('oauth-redirect-path'));
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('🔗 OAuth redirectTo URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    console.log('OAuth response:', { data, error });
    
    if (error) {
      console.error('❌ OAuth error:', error);
      throw error;
    }
    
    console.log('✅ OAuth initiated successfully');
    return data;
  } catch (error) {
    console.error(`💥 OAuth ${provider} error:`, error);
    throw error;
  } finally {
    setLoading(false);
  }
}


  // Function to refresh user data from database
  // Use useCallback to memoize and prevent infinite loops
  // Get fresh session each time instead of depending on state
  const refreshUserData = React.useCallback(async () => {
    // Always get fresh session from Supabase to avoid stale state
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      await fetchUserData(currentSession.user);
    }
  }, []); // No dependencies - always get fresh session

  const value = {
    user,
    session,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword,
    refreshUserData,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
