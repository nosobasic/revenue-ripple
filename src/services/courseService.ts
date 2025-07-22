import { supabase } from '../supabase/client';
import { UserProgress, UserModuleCompletion } from '../types/user';

export class CourseService {
  /**
   * Mark a module as completed for a user
   */
  static async markModuleCompleted(userId: string, courseId: string, moduleId: string): Promise<void> {
    // Upsert into user_module_completion
    const { error } = await supabase
      .from('user_module_completion')
      .upsert([
        {
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        }
      ], { onConflict: 'user_id,course_id,module_id' });
    if (error) throw error;
    // Update overall course progress
    await this.updateCourseProgress(userId, courseId);
  }

  /**
   * Update overall course progress for a user
   */
  static async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    // Count completed modules
    const { data: completedModules, error } = await supabase
      .from('user_module_completion')
      .select('module_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true);
    if (error) throw error;
    // For now, assume 10 modules per course
    const totalModules = 10;
    const percentDone = Math.min(((completedModules?.length || 0) / totalModules) * 100, 100);
    // Upsert into user_progress
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert([
        {
          user_id: userId,
          course_id: courseId,
          percent_done: Math.round(percentDone),
          status: percentDone >= 100 ? 'completed' : 'in_progress',
          last_updated: new Date().toISOString(),
        }
      ], { onConflict: 'user_id,course_id' });
    if (progressError) throw progressError;
  }

  /**
   * Get user's completed modules for a course
   */
  static async getCompletedModules(userId: string, courseId: string): Promise<UserModuleCompletion[]> {
    const { data, error } = await supabase
      .from('user_module_completion')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true)
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * Get overall course progress for a user
   */
  static async getUserProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    if (error) return null;
    return data;
  }
}