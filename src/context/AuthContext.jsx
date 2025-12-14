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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9836e60c-0cdf-4689-bbe0-60afdaaff40e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:38',message:'onAuthStateChange fired',data:{event,hasSession:!!session,hasUser:!!session?.user,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      setSession(session);
      if (session?.user) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9836e60c-0cdf-4689-bbe0-60afdaaff40e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:41',message:'Calling fetchUserData from onAuthStateChange',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
        // #endregion
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
          "id, email, role, plan, created_at, name, status, username, commission_rate, phone, company, bio,paypal_email, has_paid, payment_status"
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

  async function signup(email, password, firstName, lastName ,role, paypal) {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9836e60c-0cdf-4689-bbe0-60afdaaff40e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:100',message:'signup function called',data:{email,role,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9836e60c-0cdf-4689-bbe0-60afdaaff40e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:107',message:'After supabase.auth.signUp',data:{hasUser:!!authData.user,hasError:!!authError,hasSession:!!authData.session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      console.log("authData==",authData, "authError==",authError)
      if (authError) throw authError;

      // Create a user document in Supabase
      if (authData.user) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9836e60c-0cdf-4689-bbe0-60afdaaff40e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:112',message:'Creating user record in database',data:{userId:authData.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
            paypal_email:paypal
          },
        ]);

        if (userError) {
          console.error("Error creating user record:", userError);
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9836e60c-0cdf-4689-bbe0-60afdaaff40e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:130',message:'User record created, about to return',data:{userId:authData.user.id,hasSession:!!authData.session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'})}).catch(()=>{});
        // #endregion
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

      await fetchUserData(authData.user);
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

  const value = {
    user,
    session,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
