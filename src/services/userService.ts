import { supabase } from '../lib/supabaseClient';
import { User } from '../types/user';

export class UserService {
  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: Partial<User>): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: profileData.name,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: {
    email: string;
    password: string;
    name?: string;
    role?: string;
    status?: string;
  }): Promise<User> {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          role: userData.role || 'member'
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create auth user');

      // Create user record
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name || '',
          role: userData.role || 'member',
          status: userData.status || 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) throw userError;
      return userRecord;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user role and status (admin only)
   */
  static async updateUserRole(userId: string, role: string, status?: string): Promise<void> {
    try {
      const updateData: any = {
        role,
        plan: role,
        updated_at: new Date().toISOString()
      };

      if (status) {
        updateData.status = status;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      // Delete auth user (this will cascade to users table if properly set up)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Also delete from users table to be safe
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) throw userError;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Generate affiliate link for user
   */
  static generateAffiliateLink(userId: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/?ref=${userId}`;
  }

  /**
   * Get user's commission data
   */
  static async getUserCommissions(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('referrer_username', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const totalEarnings = data?.reduce((sum, row) => sum + row.commission, 0) || 0;
      const totalSales = data?.length || 0;

      return {
        commissions: data || [],
        totalEarnings,
        totalSales,
        recentActivity: data?.slice(0, 5).map(entry => ({
          type: "commission",
          message: `Commission earned: $${entry.commission.toFixed(2)} from ${entry.tier.toUpperCase()}`,
          timestamp: new Date(entry.timestamp).toLocaleString()
        })) || []
      };
    } catch (error) {
      console.error('Error fetching user commissions:', error);
      return {
        commissions: [],
        totalEarnings: 0,
        totalSales: 0,
        recentActivity: []
      };
    }
  }
}