// Auth identity is separate from the application profile. Never copy role,
// billing, partner, or founder claims from user-editable OAuth metadata.
export function unpaidProfile(authUser) {
  if (!authUser?.id || !authUser?.email) {
    throw new Error('Unable to verify your account. Please retry.');
  }
  const metadata = authUser.user_metadata || {};
  const name = [metadata.name, metadata.full_name].find(value => typeof value === 'string' && value.trim()) || '';
  return {
    id: authUser.id,
    email: authUser.email,
    name,
    role: 'member',
    plan: '',
    status: 'active',
    commission_rate: 0,
    has_paid: false,
    payment_status: 'pending',
    is_founder: false,
    subscription_type: null,
    founder_benefits: {},
    username: null,
    value_engine_segment: null,
  };
}
