#!/usr/bin/env ts-node
/**
 * Backfill Script for Command Center
 * Migrates existing data to new agent tables (dry run by default)
 * Usage: npx ts-node tools/backfill_instances.ts [--apply]
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface BackfillPlan {
  users: any[];
  instances: any[];
  credentials: any[];
  runs: any[];
}

async function analyzeExistingData(): Promise<BackfillPlan> {
  console.log('🔍 Analyzing existing data...\n');

  try {
    // Get all users with paid subscriptions
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, plan, has_paid')
      .eq('has_paid', true);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return { users: [], instances: [], credentials: [], runs: [] };
    }

    console.log(`📊 Found ${users?.length || 0} paid users`);

    // Check for existing agent-related data
    const { data: existingInstances, error: instancesError } = await supabase
      .from('agent_instances')
      .select('id, user_id')
      .limit(1);

    if (instancesError && instancesError.code !== 'PGRST116') {
      console.error('❌ Error checking existing instances:', instancesError);
    } else if (existingInstances && existingInstances.length > 0) {
      console.log('⚠️  Agent instances already exist - skipping backfill');
      return { users: [], instances: [], credentials: [], runs: [] };
    }

    // Generate backfill plan
    const plan: BackfillPlan = {
      users: users || [],
      instances: [],
      credentials: [],
      runs: []
    };

    // Create sample instances for each user
    for (const user of users || []) {
      // Create a Daily Pulse instance for each user
      plan.instances.push({
        user_id: user.id,
        catalog_id: 'daily-pulse', // Assuming this exists in agent_catalog
        name: `${user.email.split('@')[0]}'s Daily Pulse`,
        config: {
          metrics: ['revenue', 'conversions', 'traffic'],
          frequency: 'daily'
        },
        is_active: true
      });

      // Create sample credentials
      plan.credentials.push({
        user_id: user.id,
        instance_id: `instance-${user.id}`, // Will be updated after instance creation
        credential_type: 'api_key',
        encrypted_data: 'encrypted_sample_data'
      });

      // Create sample runs
      plan.runs.push({
        user_id: user.id,
        instance_id: `instance-${user.id}`, // Will be updated after instance creation
        status: 'completed',
        started_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        finished_at: new Date(Date.now() - 86340000).toISOString(), // 10 minutes later
        output_json: {
          metrics: {
            revenue: Math.floor(Math.random() * 10000) + 5000,
            conversions: Math.floor(Math.random() * 50) + 10,
            traffic: Math.floor(Math.random() * 1000) + 500
          }
        }
      });
    }

    return plan;

  } catch (error) {
    console.error('❌ Error analyzing data:', error);
    return { users: [], instances: [], credentials: [], runs: [] };
  }
}

async function executeBackfill(plan: BackfillPlan, apply: boolean = false): Promise<void> {
  console.log(`\n${apply ? '🚀 EXECUTING' : '📋 DRY RUN'} - Backfill Plan\n`);

  if (!apply) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
    console.log('   Use --apply flag to execute changes\n');
  }

  try {
    // 1. Create agent instances
    console.log('📝 Creating agent instances...');
    for (const instance of plan.instances) {
      if (apply) {
        const { data, error } = await supabase
          .from('agent_instances')
          .insert(instance)
          .select()
          .single();

        if (error) {
          console.error(`❌ Error creating instance for user ${instance.user_id}:`, error);
          continue;
        }

        // Update credentials and runs with actual instance ID
        const instanceId = data.id;
        plan.credentials.find(c => c.user_id === instance.user_id)!.instance_id = instanceId;
        plan.runs.find(r => r.user_id === instance.user_id)!.instance_id = instanceId;

        console.log(`✅ Created instance ${instanceId} for user ${instance.user_id}`);
      } else {
        console.log(`   Would create instance for user ${instance.user_id}: ${instance.name}`);
      }
    }

    // 2. Create credentials
    console.log('\n🔐 Creating credentials...');
    for (const credential of plan.credentials) {
      if (apply) {
        const { error } = await supabase
          .from('agent_credentials')
          .insert(credential);

        if (error) {
          console.error(`❌ Error creating credential for user ${credential.user_id}:`, error);
          continue;
        }

        console.log(`✅ Created credential for user ${credential.user_id}`);
      } else {
        console.log(`   Would create credential for user ${credential.user_id}`);
      }
    }

    // 3. Create runs
    console.log('\n🏃 Creating runs...');
    for (const run of plan.runs) {
      if (apply) {
        const { error } = await supabase
          .from('agent_runs')
          .insert(run);

        if (error) {
          console.error(`❌ Error creating run for user ${run.user_id}:`, error);
          continue;
        }

        console.log(`✅ Created run for user ${run.user_id}`);
      } else {
        console.log(`   Would create run for user ${run.user_id}`);
      }
    }

    // 4. Create usage counters
    console.log('\n📊 Creating usage counters...');
    for (const user of plan.users) {
      const usageCounter = {
        user_id: user.id,
        counter_type: 'daily_runs',
        count: 1,
        reset_at: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };

      if (apply) {
        const { error } = await supabase
          .from('usage_counters')
          .insert(usageCounter);

        if (error) {
          console.error(`❌ Error creating usage counter for user ${user.id}:`, error);
          continue;
        }

        console.log(`✅ Created usage counter for user ${user.id}`);
      } else {
        console.log(`   Would create usage counter for user ${user.id}`);
      }
    }

    if (apply) {
      console.log('\n🎉 Backfill completed successfully!');
    } else {
      console.log('\n📋 Dry run completed. Review the plan above.');
      console.log('   To execute: npx ts-node tools/backfill_instances.ts --apply');
    }

  } catch (error) {
    console.error('❌ Backfill failed:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');

  console.log('🔄 Command Center Backfill Tool');
  console.log('================================\n');

  if (apply) {
    console.log('⚠️  APPLY MODE - Changes will be written to database');
    console.log('   This will create agent instances for all paid users\n');
  }

  try {
    const plan = await analyzeExistingData();
    
    if (plan.users.length === 0) {
      console.log('ℹ️  No users found or no data to backfill');
      return;
    }

    console.log(`\n📋 Backfill Plan Summary:`);
    console.log(`   Users: ${plan.users.length}`);
    console.log(`   Instances: ${plan.instances.length}`);
    console.log(`   Credentials: ${plan.credentials.length}`);
    console.log(`   Runs: ${plan.runs.length}`);

    await executeBackfill(plan, apply);

  } catch (error) {
    console.error('❌ Backfill tool failed:', error);
    process.exit(1);
  }
}

// Run the backfill
main();
