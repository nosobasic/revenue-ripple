import { supabase } from '../supabase/client';
import { User } from '../types/user';

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signup(email: string, password: string, firstName?: string, lastName?: string): Promise<any> {
    try {
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
            name: firstName && lastName ? `${firstName} ${lastName}` : firstName || '',
            email,
            role: "member",
            status: "active",
            plan: "member",
            commission_rate: 0.5, // Default commission rate (50%)
            phone: "",
            company: "",
            bio: "",
          },
        ]);

        if (userError) {
          console.error("Error creating user record:", userError);
          throw userError;
        }
      }

      return authData; // Return authData, not authData.user directly
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Sign in user
   */
  static async login(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
      const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured, returning null for current user');
        return null;
      }
      
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Fetch user data from users table
   */
  static async fetchUserData(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Fetch user data error:', error);
      return null;
    }
  }
}