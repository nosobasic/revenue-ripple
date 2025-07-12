import { supabase } from '../supabase/client';

/**
 * Affiliate Data Integration Utility
 * Handles all database operations for the affiliate section
 */

// Training Progress Operations
export const affiliateTrainingService = {
  // Get user's training progress
  async getUserTrainingProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_training_progress')
        .select('*')
        .eq('user_id', userId)
        .order('step_number');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching training progress:', error);
      return [];
    }
  },

  // Initialize training progress for new user
  async initializeTrainingProgress(userId) {
    const steps = [
      {
        user_id: userId,
        step_number: 1,
        step_title: 'Start with the Basics',
        resources_accessed: ['Unlock Your Marketing Potential', 'Unleash the Power of Traffic'],
        estimated_time_spent: 180
      },
      {
        user_id: userId,
        step_number: 2,
        step_title: 'Set Up Your Funnel',
        resources_accessed: ['GetResponse Setup Guide', 'Membership Mastery Bundle', 'Landing Page Templates'],
        estimated_time_spent: 300
      },
      {
        user_id: userId,
        step_number: 3,
        step_title: 'Scale Your Marketing',
        resources_accessed: ['DMD Landing Page Template', 'Scaling Strategies Guide'],
        estimated_time_spent: 240
      },
      {
        user_id: userId,
        step_number: 4,
        step_title: 'Access Advanced Tools',
        resources_accessed: ['DMD Affiliate Sign-up', 'Unique Affiliate Link', 'Advanced Marketing Tools'],
        estimated_time_spent: 120
      },
      {
        user_id: userId,
        step_number: 5,
        step_title: 'Automate Your Success',
        resources_accessed: ['Indoctrination Sequence Template', '26 Bi-weekly Lessons', 'Autoresponder Setup Guide'],
        estimated_time_spent: 180
      },
      {
        user_id: userId,
        step_number: 6,
        step_title: 'Drive Traffic',
        resources_accessed: ['Traffic Generation Strategies', 'Traffic Tracking Tools'],
        estimated_time_spent: 0
      }
    ];

    try {
      const { data, error } = await supabase
        .from('affiliate_training_progress')
        .insert(steps)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing training progress:', error);
      return [];
    }
  },

  // Update step completion status
  async updateStepCompletion(userId, stepNumber, isCompleted, notes = '') {
    try {
      const updateData = {
        is_completed: isCompleted,
        notes,
        updated_at: new Date().toISOString()
      };

      if (isCompleted) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('affiliate_training_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('step_number', stepNumber)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating step completion:', error);
      return null;
    }
  },

  // Get overall progress percentage
  async getProgressPercentage(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_training_progress')
        .select('is_completed')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const completedSteps = data.filter(step => step.is_completed).length;
      const totalSteps = data.length;
      
      return Math.round((completedSteps / totalSteps) * 100);
    } catch (error) {
      console.error('Error calculating progress percentage:', error);
      return 0;
    }
  }
};

// Performance Metrics Operations
export const affiliatePerformanceService = {
  // Get performance metrics for a date range
  async getPerformanceMetrics(userId, startDate, endDate, funnelType = null) {
    try {
      let query = supabase
        .from('affiliate_performance_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('metric_date', startDate)
        .lte('metric_date', endDate);
      
      if (funnelType) {
        query = query.eq('funnel_type', funnelType);
      }
      
      const { data, error } = await query.order('metric_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  },

  // Update daily metrics
  async updateDailyMetrics(userId, date, funnelType, metrics) {
    try {
      const { data, error } = await supabase
        .from('affiliate_performance_metrics')
        .upsert({
          user_id: userId,
          metric_date: date,
          funnel_type: funnelType,
          ...metrics,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating daily metrics:', error);
      return null;
    }
  },

  // Get aggregated metrics for dashboard
  async getAggregatedMetrics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('affiliate_performance_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('metric_date', startDate.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Aggregate the data
      const aggregated = data.reduce((acc, metric) => {
        acc.totalTraffic += metric.total_traffic || 0;
        acc.totalConversions += metric.total_conversions || 0;
        acc.totalEmailSubscribers += metric.email_subscribers || 0;
        acc.totalLandingPageViews += metric.landing_page_views || 0;
        acc.totalConversionValue += parseFloat(metric.conversion_value || 0);
        return acc;
      }, {
        totalTraffic: 0,
        totalConversions: 0,
        totalEmailSubscribers: 0,
        totalLandingPageViews: 0,
        totalConversionValue: 0
      });
      
      // Calculate rates
      aggregated.overallConversionRate = aggregated.totalLandingPageViews > 0 
        ? ((aggregated.totalConversions / aggregated.totalLandingPageViews) * 100).toFixed(2)
        : 0;
      
      return aggregated;
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      return {};
    }
  }
};

// Marketing Materials Operations
export const marketingMaterialsService = {
  // Track material download
  async trackMaterialDownload(userId, materialId, materialTitle, materialType, format, usageContext) {
    try {
      // First, try to get existing record
      const { data: existing, error: selectError } = await supabase
        .from('marketing_materials_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('marketing_materials_usage')
          .update({
            download_count: existing.download_count + 1,
            last_downloaded_at: new Date().toISOString(),
            format_downloaded: format,
            usage_context: usageContext,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();
        
        if (error) throw error;
        return data[0];
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('marketing_materials_usage')
          .insert({
            user_id: userId,
            material_id: materialId,
            material_title: materialTitle,
            material_type: materialType,
            download_count: 1,
            last_downloaded_at: new Date().toISOString(),
            format_downloaded: format,
            usage_context: usageContext
          })
          .select();
        
        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error('Error tracking material download:', error);
      return null;
    }
  },

  // Get user's material usage
  async getUserMaterialUsage(userId) {
    try {
      const { data, error } = await supabase
        .from('marketing_materials_usage')
        .select('*')
        .eq('user_id', userId)
        .order('last_downloaded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching material usage:', error);
      return [];
    }
  },

  // Update performance notes for a material
  async updateMaterialNotes(userId, materialId, notes) {
    try {
      const { data, error } = await supabase
        .from('marketing_materials_usage')
        .update({
          performance_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating material notes:', error);
      return null;
    }
  }
};

// Affiliate Link Performance Operations
export const affiliateLinkService = {
  // Create new affiliate link
  async createAffiliateLink(userId, linkId, campaignName, linkUrl, destinationUrl, trafficSource) {
    try {
      const { data, error } = await supabase
        .from('affiliate_link_performance')
        .insert({
          user_id: userId,
          link_id: linkId,
          campaign_name: campaignName,
          link_url: linkUrl,
          destination_url: destinationUrl,
          traffic_source: trafficSource,
          is_active: true
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      return null;
    }
  },

  // Track link click
  async trackLinkClick(userId, linkId, isUniqueClick = false) {
    try {
      const { data: existing, error: selectError } = await supabase
        .from('affiliate_link_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('link_id', linkId)
        .single();
      
      if (selectError) throw selectError;
      
      const updateData = {
        total_clicks: existing.total_clicks + 1,
        last_click_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (isUniqueClick) {
        updateData.unique_clicks = existing.unique_clicks + 1;
      }
      
      if (!existing.first_click_at) {
        updateData.first_click_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('affiliate_link_performance')
        .update(updateData)
        .eq('id', existing.id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error tracking link click:', error);
      return null;
    }
  },

  // Track conversion
  async trackConversion(userId, linkId) {
    try {
      const { data: existing, error: selectError } = await supabase
        .from('affiliate_link_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('link_id', linkId)
        .single();
      
      if (selectError) throw selectError;
      
      const conversions = existing.conversions + 1;
      const conversionRate = existing.total_clicks > 0 
        ? ((conversions / existing.total_clicks) * 100).toFixed(2)
        : 0;
      
      const { data, error } = await supabase
        .from('affiliate_link_performance')
        .update({
          conversions: conversions,
          conversion_rate: conversionRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error tracking conversion:', error);
      return null;
    }
  },

  // Get user's link performance
  async getUserLinkPerformance(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_link_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching link performance:', error);
      return [];
    }
  }
};

// Enhanced Earnings Operations
export const affiliateEarningsService = {
  // Get detailed earnings
  async getDetailedEarnings(userId, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('affiliate_earnings_detailed')
        .select('*')
        .eq('user_id', userId);
      
      if (startDate) {
        query = query.gte('earned_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('earned_at', endDate);
      }
      
      const { data, error } = await query.order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching detailed earnings:', error);
      return [];
    }
  },

  // Get earnings summary
  async getEarningsSummary(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_earnings_detailed')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const summary = data.reduce((acc, earning) => {
        acc.totalEarnings += parseFloat(earning.net_amount || 0);
        
        if (earning.payout_status === 'pending') {
          acc.pendingEarnings += parseFloat(earning.net_amount || 0);
        } else if (earning.payout_status === 'paid') {
          acc.paidEarnings += parseFloat(earning.net_amount || 0);
        }
        
        // Count by funnel type
        if (earning.funnel_type) {
          acc.funnelBreakdown[earning.funnel_type] = 
            (acc.funnelBreakdown[earning.funnel_type] || 0) + parseFloat(earning.net_amount || 0);
        }
        
        return acc;
      }, {
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        funnelBreakdown: {}
      });
      
      return summary;
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      return {
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        funnelBreakdown: {}
      };
    }
  },

  // Create new earning record
  async createEarningRecord(userId, earningData) {
    try {
      const { data, error } = await supabase
        .from('affiliate_earnings_detailed')
        .insert({
          user_id: userId,
          ...earningData,
          earned_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating earning record:', error);
      return null;
    }
  }
};

// Funnel Setup Operations
export const affiliateFunnelService = {
  // Get user's funnel setups
  async getUserFunnels(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_funnel_setup')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user funnels:', error);
      return [];
    }
  },

  // Create or update funnel setup
  async upsertFunnelSetup(userId, funnelType, funnelData) {
    try {
      const { data, error } = await supabase
        .from('affiliate_funnel_setup')
        .upsert({
          user_id: userId,
          funnel_type: funnelType,
          ...funnelData,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error upserting funnel setup:', error);
      return null;
    }
  },

  // Mark funnel as completed
  async completeFunnelSetup(userId, funnelType) {
    try {
      const { data, error } = await supabase
        .from('affiliate_funnel_setup')
        .update({
          setup_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('funnel_type', funnelType)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error completing funnel setup:', error);
      return null;
    }
  }
};

// Goals and Targets Operations
export const affiliateGoalsService = {
  // Get user's goals
  async getUserGoals(userId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user goals:', error);
      return [];
    }
  },

  // Create new goal
  async createGoal(userId, goalData) {
    try {
      const { data, error } = await supabase
        .from('affiliate_goals')
        .insert({
          user_id: userId,
          ...goalData
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  },

  // Update goal progress
  async updateGoalProgress(userId, goalId, currentValue) {
    try {
      const { data: goal, error: selectError } = await supabase
        .from('affiliate_goals')
        .select('*')
        .eq('id', goalId)
        .single();
      
      if (selectError) throw selectError;
      
      const updateData = {
        current_value: currentValue,
        updated_at: new Date().toISOString()
      };
      
      if (currentValue >= goal.target_value && !goal.is_achieved) {
        updateData.is_achieved = true;
        updateData.achieved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('affiliate_goals')
        .update(updateData)
        .eq('id', goalId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return null;
    }
  }
};

// Utility functions
export const affiliateUtils = {
  // Get comprehensive dashboard data
  async getDashboardData(userId) {
    try {
      const [
        trainingProgress,
        performanceMetrics,
        materialUsage,
        linkPerformance,
        earningsSummary,
        funnels,
        goals
      ] = await Promise.all([
        affiliateTrainingService.getUserTrainingProgress(userId),
        affiliatePerformanceService.getAggregatedMetrics(userId),
        marketingMaterialsService.getUserMaterialUsage(userId),
        affiliateLinkService.getUserLinkPerformance(userId),
        affiliateEarningsService.getEarningsSummary(userId),
        affiliateFunnelService.getUserFunnels(userId),
        affiliateGoalsService.getUserGoals(userId)
      ]);
      
      return {
        trainingProgress,
        performanceMetrics,
        materialUsage,
        linkPerformance,
        earningsSummary,
        funnels,
        goals,
        progressPercentage: await affiliateTrainingService.getProgressPercentage(userId)
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {};
    }
  }
};