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

      return authData.user;
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from signInWithPassword");

      return authData.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  static async logout(): Promise<void> {
    localStorage.removeItem("revenue-ripple-auth-token");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<any> {
    try {
      // Check if user exists first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('No account found with that email address. Please check your email or create a new account.');
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return data;
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
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  /**
   * Fetch user data from users table
   */
  static async fetchUserData(authUser: any): Promise<User | null> {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        // If user doesn't exist in users table, create basic user object
        return {
          ...authUser,
          role: 'member' as const,
          status: 'active' as const
        };
      }

      if (userData) {
        return {
          ...authUser,
          ...userData,
        };
      } else {
        return {
          ...authUser,
          role: 'member' as const,
          status: 'active' as const
        };
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      return {
        ...authUser,
        role: 'member' as const,
        status: 'active' as const
      };
    }
  }
}