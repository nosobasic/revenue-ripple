import { supabase } from '../lib/supabaseClient';
import { getApiBase } from '../config/constants';

export type EventType = 
  | 'briefing_opened'
  | 'briefing_read'
  | 'module_viewed'
  | 'module_completed'
  | 'ai_interaction'
  | 'daily_login';

interface TrackEventOptions {
  contentId?: string;
  eventSource?: string;
  durationSeconds?: number;
  metadata?: Record<string, any>;
}

/**
 * Main function to track engagement events
 */
export async function trackEvent(
  userId: string,
  eventType: EventType,
  options: TrackEventOptions = {}
): Promise<void> {
  try {
    const { contentId, eventSource, durationSeconds, metadata } = options;

    // If contentId is provided, verify it exists in ve_content_items
    if (contentId) {
      const { data: content, error: contentError } = await supabase
        .from('ve_content_items')
        .select('id')
        .eq('id', contentId)
        .single();

      if (contentError || !content) {
        console.warn(`Content ${contentId} not found, tracking event without content reference`);
      }
    }

    // Insert event into ve_content_user_events
    const eventData: any = {
      user_id: userId,
      event_type: eventType,
      event_source: eventSource || 'web',
      created_at: new Date().toISOString(),
    };

    if (contentId) {
      eventData.content_id = contentId;
    }

    if (durationSeconds !== undefined) {
      eventData.duration_seconds = durationSeconds;
    }

    if (metadata) {
      eventData.metadata = metadata;
    }

    const { error: insertError } = await supabase
      .from('ve_content_user_events')
      .insert([eventData]);

    if (insertError) {
      console.error('Error tracking engagement event:', insertError);
      // Fallback: try to track via backend API
      try {
        const apiBase = getApiBase();
        await fetch(`${apiBase}/api/engagement/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            event_type: eventType,
            content_id: contentId,
            event_source: eventSource,
            duration_seconds: durationSeconds,
            metadata: metadata || {},
          }),
        });
      } catch (apiError) {
        console.error('Error tracking event via API fallback:', apiError);
      }
    }

    // Also update users.value_engine_last_seen
    await supabase
      .from('users')
      .update({ value_engine_last_seen: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error in trackEvent:', error);
    // Don't throw - engagement tracking should be non-blocking
  }
}

/**
 * Track when a premium briefing is opened
 */
export async function trackBriefingOpen(userId: string, briefingId: string): Promise<void> {
  await trackEvent(userId, 'briefing_opened', {
    contentId: briefingId,
    eventSource: 'briefing_modal',
  });
}

/**
 * Track when a briefing detail page is read/viewed
 */
export async function trackBriefingRead(userId: string, briefingId: string): Promise<void> {
  await trackEvent(userId, 'briefing_read', {
    contentId: briefingId,
    eventSource: 'briefing_detail',
  });
}

/**
 * Track when a course module is viewed
 */
export async function trackModuleView(userId: string, moduleId: string, courseId?: string): Promise<void> {
  await trackEvent(userId, 'module_viewed', {
    contentId: moduleId,
    eventSource: 'course_module',
    metadata: courseId ? { course_id: courseId } : undefined,
  });
}

/**
 * Track when a course module is completed
 */
export async function trackModuleComplete(userId: string, moduleId: string, courseId?: string): Promise<void> {
  await trackEvent(userId, 'module_completed', {
    contentId: moduleId,
    eventSource: 'course_module',
    metadata: courseId ? { course_id: courseId } : undefined,
  });
}

/**
 * Track AI assistant interactions
 */
export async function trackAIIteraction(
  userId: string,
  interactionType: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent(userId, 'ai_interaction', {
    eventSource: 'ai_assistant',
    metadata: {
      interaction_type: interactionType,
      ...metadata,
    },
  });
}

/**
 * Track daily login (with deduplication - only once per day)
 */
const dailyLoginCache = new Map<string, string>(); // userId -> date string

export async function trackDailyLogin(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastTracked = dailyLoginCache.get(userId);

  // Only track if we haven't tracked for this user today
  if (lastTracked !== today) {
    await trackEvent(userId, 'daily_login', {
      eventSource: 'auth',
    });
    dailyLoginCache.set(userId, today);

    // Clean up old cache entries (older than 2 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    for (const [key, value] of dailyLoginCache.entries()) {
      if (value < twoDaysAgo.toISOString().split('T')[0]) {
        dailyLoginCache.delete(key);
      }
    }
  }
}

