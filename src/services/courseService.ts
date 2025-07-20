import { supabase } from '../lib/supabaseClient';
import { CourseProgress } from '../types/user';

export class CourseService {
  /**
   * Get user's course progress
   */
  static async getUserProgress(userId: string, courseSlug?: string): Promise<CourseProgress[]> {
    try {
      let query = supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId);

      if (courseSlug) {
        query = query.eq('course_slug', courseSlug);
      }

      const { data, error } = await query.order('last_accessed', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return [];
    }
  }

  /**
   * Update course progress
   */
  static async updateProgress(
    userId: string,
    courseSlug: string,
    moduleId: string,
    completed: boolean = false
  ): Promise<void> {
    try {
      // Get existing progress
      const { data: existingProgress } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_slug', courseSlug)
        .single();

      let completedModules: string[] = existingProgress?.completed_modules || [];
      
      if (completed && !completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
      } else if (!completed && completedModules.includes(moduleId)) {
        completedModules = completedModules.filter(id => id !== moduleId);
      }

      // Calculate progress percentage (you may need to adjust this based on total modules)
      const progressPercentage = (completedModules.length / 10) * 100; // Assuming 10 modules per course

      const progressData = {
        user_id: userId,
        course_slug: courseSlug,
        module_id: moduleId,
        completed_modules: completedModules,
        progress_percentage: Math.min(progressPercentage, 100),
        last_accessed: new Date().toISOString(),
        completed_at: progressPercentage >= 100 ? new Date().toISOString() : null
      };

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('course_progress')
          .update(progressData)
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('course_progress')
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
  static async getCourseCompletion(userId: string, courseSlug: string): Promise<{
    isCompleted: boolean;
    progressPercentage: number;
    completedModules: string[];
  }> {
    try {
      const { data } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_slug', courseSlug)
        .single();

      if (!data) {
        return {
          isCompleted: false,
          progressPercentage: 0,
          completedModules: []
        };
      }

      return {
        isCompleted: data.progress_percentage >= 100,
        progressPercentage: data.progress_percentage || 0,
        completedModules: data.completed_modules || []
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
  static async markModuleAccessed(userId: string, courseSlug: string, moduleId: string): Promise<void> {
    try {
      // Update last accessed time and ensure progress record exists
      await this.updateProgress(userId, courseSlug, moduleId, false);
    } catch (error) {
      console.error('Error marking module as accessed:', error);
    }
  }
}