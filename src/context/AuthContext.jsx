import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabase/client";
import { safeReturnTo, clearPurchaseIntent } from '../utils/loginRouting';
import { trackDailyLogin } from "../services/engagementTracking";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const [authError, setAuthError] = useState(null);
  const generation = useRef(0);
  const currentSession = useRef(null);

  // Keep identity/profile resolution atomic and discard requests from older accounts.
  const resolveSession = useCallback(async (nextSession) => {
    const request = ++generation.current;
    currentSession.current = nextSession;
    setSession(nextSession);
    setUser(null);
    setAuthError(null);
    setLoading(true);
    try {
      if (!nextSession?.user) return;
      // Preserve existing OAuth profile provisioning: only a basic free profile,
      // ignore an existing row so historical roles/plans are never overwritten.
      const authUser = nextSession.user;
      await supabase.from('users').upsert({
        id: authUser.id, email: authUser.email, role: 'member', plan: '',
        status: 'active', commission_rate: 0, name: authUser.user_metadata?.name || '',
      }, { onConflict: 'id', ignoreDuplicates: true });
      const { data, error } = await supabase.from('users').select('*')
        .eq('id', nextSession.user.id).single();
      if (error || !data || data.id !== nextSession.user.id) {
        throw new Error('Unable to verify your account. Please retry.');
      }
      if (request === generation.current) {
        // Role/plan come from the RLS-protected row, never user_metadata or headers.
        setUser({ ...nextSession.user, ...data });
      }
    } catch {
      if (request === generation.current) setAuthError('Unable to verify your account. Please retry.');
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let eventSeen = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      eventSeen = true;
      // Return synchronously so Supabase can release its auth callback lock.
      if (active) void resolveSession(nextSession);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || eventSeen) return;
      if (error) {
        setAuthError('Unable to restore your session. Please retry.');
        setLoading(false);
      } else void resolveSession(data.session);
    }).catch(() => {
      if (active && !eventSeen) {
        setAuthError('Unable to restore your session. Please retry.');
        setLoading(false);
      }
    });
    return () => { active = false; ++generation.current; subscription.unsubscribe(); };
  }, [resolveSession]);

  const refreshUserData = useCallback(async () => {
    if (currentSession.current) return resolveSession(currentSession.current);
    const request = generation.current;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (request !== generation.current) return;
      if (error) throw error;
      return resolveSession(data.session);
    } catch {
      if (request === generation.current) setAuthError('Unable to restore your session. Please retry.');
    }
  }, [resolveSession]);

  async function signup(email, password, firstName, lastName ,role, paypal) {
    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create a user document in Supabase
      if (authData.user && authData.session) {
        const { error: userError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            name: firstName + " " + lastName,
            email,
            role: 'member', // Paid/affiliate roles are assigned by trusted backend flows.
            status: "active",
            commission_rate: 0,
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
        
        // CRITICAL: Fetch user data immediately after creating the record
        // This ensures the user object is loaded in AuthContext before Register navigates
        await resolveSession(authData.session);
        
        // Supabase owns its session storage; never overwrite it with a raw JWT.
      }

      if (!authData.session) throw new Error('Check your email to confirm your account, then sign in.');
      return authData.user;
    } catch (error) {
      setLoading(false);
      throw error;
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

      await resolveSession(authData.session);
      
      // Track daily login for engagement
      if (authData.user) {
        trackDailyLogin(authData.user.id);
      }
      
      return authData.user;
    } catch (error) {
      console.error("login: error", error);
      setLoading(false);
      throw error;
    }
  }

  async function logout() {
    ++generation.current;
    currentSession.current = null;
    setUser(null);
    setSession(null);
    clearPurchaseIntent();
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
      // Synchronize users.email only after Auth confirms the new address.
      const { data: verified } = await supabase.auth.getUser();
      if (verified?.user?.email === profileData.email) updateData.email = profileData.email;
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
    setUser((prev) => prev?.id === user.id ? { ...prev, ...updateData } : prev);

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

async function signInWithOAuth(provider, redirectPath = '/dashboard') {
  try {
    setLoading(true);
    
    clearPurchaseIntent();
    sessionStorage.setItem('oauth-return-to', safeReturnTo(redirectPath));
    const redirectUrl = `${window.location.origin}/auth/callback`;

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
    authError,
    refreshUserData,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
