#!/usr/bin/env ts-node
/**
 * Database Introspection Tool
 * Reads database structure without making any changes
 * Usage: npx ts-node tools/run_db_introspect.ts
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
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TableInfo {
  table_name: string;
  columns: ColumnInfo[];
  indexes: string[];
  rls_enabled: boolean;
  policies: string[];
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position: number;
}

async function introspectDatabase() {
  console.log('🔍 Starting database introspection...\n');

  try {
    // 1. Get all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        ` 
      });

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
      return;
    }

    console.log('📋 Tables found:');
    tables?.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    console.log('');

    // 2. Check for existing agent-related tables
    const { data: agentTables, error: agentError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND (table_name LIKE '%agent%' OR table_name LIKE '%command%' OR table_name LIKE '%run%')
          ORDER BY table_name
        ` 
      });

    if (agentError) {
      console.error('❌ Error checking agent tables:', agentError);
    } else {
      console.log('🤖 Agent-related tables:');
      if (agentTables && agentTables.length > 0) {
        agentTables.forEach((table: any) => {
          console.log(`  - ${table.table_name}`);
        });
      } else {
        console.log('  - None found');
      }
      console.log('');
    }

    // 3. Get RLS status
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            tablename,
            rowsecurity as rls_enabled
          FROM pg_tables 
          WHERE schemaname = 'public'
          ORDER BY tablename
        ` 
      });

    if (rlsError) {
      console.error('❌ Error checking RLS:', rlsError);
    } else {
      console.log('🔒 Row Level Security status:');
      rlsStatus?.forEach((table: any) => {
        console.log(`  - ${table.tablename}: ${table.rls_enabled ? 'ENABLED' : 'DISABLED'}`);
      });
      console.log('');
    }

    // 4. Check for existing policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            tablename,
            policyname,
            cmd
          FROM pg_policies 
          WHERE schemaname = 'public'
          ORDER BY tablename, policyname
        ` 
      });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('🛡️ Existing policies:');
      policies?.forEach((policy: any) => {
        console.log(`  - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
      console.log('');
    }

    console.log('✅ Database introspection complete');
    console.log('\n📝 Next steps:');
    console.log('1. Review existing tables for conflicts');
    console.log('2. Plan new rr_ prefixed tables');
    console.log('3. Create migration files');
    console.log('4. Implement feature flag system');

  } catch (error) {
    console.error('❌ Introspection failed:', error);
  }
}

// Run introspection
introspectDatabase();
