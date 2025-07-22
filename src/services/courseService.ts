import { supabase } from '../supabase/client';
import { UserProgress, UserModuleCompletion } from '../types/user';

export class CourseService {
  /**
   * Get user's course progress
   */
  static async getUserProgress(userId: string, courseId?: string): Promise<UserProgress[]> {
    try {
      let query = supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query.order('last_updated', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return [];
    }
  }

  /**
   * Update module completion
   */
  static async updateModuleCompletion(
    userId: string,
    courseId: string,
    moduleId: string,
    completed: boolean = true
  ): Promise<void> {
    try {
      // Check if module completion record exists
      const { data: existingCompletion } = await supabase
        .from('user_module_completion')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('module_id', moduleId)
        .single();

      if (existingCompletion) {
        // Update existing completion
        const { error } = await supabase
          .from('user_module_completion')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null
          })
          .eq('id', existingCompletion.id);

        if (error) throw error;
      } else if (completed) {
        // Create new completion record
        const { error } = await supabase
          .from('user_module_completion')
          .insert({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            completed: true,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update overall course progress
      await this.updateCourseProgress(userId, courseId);
    } catch (error) {
      console.error('Error updating module completion:', error);
      throw error;
    }
  }

  /**
   * Update overall course progress
   */
  static async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      // Get all completed modules for this course
      const { data: completedModules } = await supabase
        .from('user_module_completion')
        .select('module_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      // For now, assume 10 modules per course - you can adjust this
      const totalModules = 10;
      const completedCount = completedModules?.length || 0;
      const percentDone = Math.min((completedCount / totalModules) * 100, 100);

      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      const progressData = {
        user_id: userId,
        course_id: courseId,
        percent_done: Math.round(percentDone),
        status: percentDone >= 100 ? 'completed' : 'in_progress',
        last_updated: new Date().toISOString()
      };

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_progress')
          .insert(progressData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  /**
   * Get course completion status
   */
  static async getCourseCompletion(userId: string, courseId: string): Promise<{
    isCompleted: boolean;
    progressPercentage: number;
    completedModules: string[];
  }> {
    try {
      // Get overall progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      // Get completed modules
      const { data: completedModules } = await supabase
        .from('user_module_completion')
        .select('module_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      const progressPercentage = progressData?.percent_done || 0;
      const moduleIds = completedModules?.map(m => m.module_id) || [];

      return {
        isCompleted: progressPercentage >= 100,
        progressPercentage,
        completedModules: moduleIds
      };
    } catch (error) {
      console.error('Error getting course completion:', error);
      return {
        isCompleted: false,
        progressPercentage: 0,
        completedModules: []
      };
    }
  }

  /**
   * Mark module as accessed (for tracking)
   */
  static async markModuleAccessed(userId: string, courseId: string, moduleId: string): Promise<void> {
    try {
      // Update last accessed time by updating course progress
      await this.updateCourseProgress(userId, courseId);
    } catch (error) {
      console.error('Error marking module as accessed:', error);
    }
  }

  /**
   * Get user's completed modules for a course
   */
  static async getCompletedModules(userId: string, courseId: string): Promise<UserModuleCompletion[]> {
    try {
      const { data, error } = await supabase
        .from('user_module_completion')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching completed modules:', error);
      return [];
    }
  }
}