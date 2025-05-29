import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define users to create
const users = [
  {
    email: 'admin@revenueripple.org',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    email: 'affiliate@revenueripple.org',
    password: 'Affiliate123!',
    role: 'affiliate'
  },
  {
    email: 'reseller@revenueripple.org',
    password: 'Reseller123!',
    role: 'reseller'
  },
  {
    email: 'proreseller@revenueripple.org',
    password: 'ProReseller123!',
    role: 'pro_reseller'
  },
  {
    email: 'member@revenueripple.org',
    password: 'Member123!',
    role: 'member'
  }
];

async function createUserWithRole(userData) {
  try {
    console.log(`Creating user: ${userData.email} with role: ${userData.role}`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        role: userData.role
      }
    });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    console.log(`✅ Auth user created: ${userData.email}`);

    // Insert into users table
    const { data: userInsertData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        role: userData.role,
        plan: userData.role,
        created_at: new Date().toISOString()
      });

    if (userError) {
      throw new Error(`User record creation error: ${userError.message}`);
    }

    console.log(`✅ User record created for ${userData.email} with role: ${userData.role}`);
    return { success: true, user: authData.user };

  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createAllUsers() {
  console.log('🚀 Starting user creation process...');
  
  const results = [];
  
  for (const user of users) {
    const result = await createUserWithRole(user);
    results.push({
      email: user.email,
      role: user.role,
      ...result
    });
  }

  // Print summary
  console.log('\n📊 Creation Summary:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.email} (${result.role}): Created successfully`);
    } else {
      console.log(`❌ ${result.email} (${result.role}): Failed - ${result.error}`);
    }
  });
}

// Run the script
createAllUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 