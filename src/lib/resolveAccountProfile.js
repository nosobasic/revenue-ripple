const messages = {
  read: 'Unable to read your account profile. Please retry.',
  create: 'Unable to create your account profile. Please retry.',
  email: 'Unable to verify your account email. Please retry.',
};

export class AccountProfileError extends Error {
  constructor(stage) {
    super(messages[stage] || messages.read);
    this.name = 'AccountProfileError';
    this.code = `PROFILE_${stage.toUpperCase()}_FAILED`;
  }
}

// Own-user RLS calls only. Never infer role/plan/payment rights from Auth metadata.
export async function resolveAccountProfile(client, authUser, isCurrent = () => true, signupDetails = {}) {
  const current = () => {
    if (!isCurrent()) throw new AccountProfileError('read');
  };
  if (!authUser?.id || !authUser.email) throw new AccountProfileError('read');
  async function read() {
    current();
    let result;
    try { result = await client.from('users').select('*').eq('id', authUser.id).maybeSingle(); }
    catch { throw new AccountProfileError('read'); }
    current();
    if (result.error || (result.data && result.data.id !== authUser.id)) throw new AccountProfileError('read');
    return result.data;
  }
  let profile = await read();
  if (!profile) {
    current();
    let result;
    try {
      result = await client.from('users').upsert({
        id: authUser.id, email: authUser.email, role: 'member', plan: '',
        status: 'active', commission_rate: 0,
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
        ...(typeof signupDetails.paypal_email === 'string' ? { paypal_email: signupDetails.paypal_email } : {}),
      }, { onConflict: 'id', ignoreDuplicates: true });
    } catch { throw new AccountProfileError('create'); }
    current();
    if (result.error) throw new AccountProfileError('create');
    profile = await read();
    if (!profile) throw new AccountProfileError('create');
  }
  if (profile.email !== authUser.email) {
    current();
    let result;
    try { result = await client.from('users').update({ email: authUser.email }).eq('id', authUser.id); }
    catch { throw new AccountProfileError('email'); }
    current();
    if (result.error) throw new AccountProfileError('email');
    profile = await read();
    if (!profile || profile.email !== authUser.email) throw new AccountProfileError('email');
  }
  return profile;
}
