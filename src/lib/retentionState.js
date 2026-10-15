export function retentionMessage(status, code) {
  if (status === 401) return 'Sign in to view your membership content.';
  if (status === 403 && code === 'membership_required')
    return 'Playbooks and briefings are paid membership benefits. Your free courses remain available.';
  if (status === 404) return 'This content is not available.';
  return 'We could not verify your membership access. Please contact support if you have already paid; do not purchase again.';
}

export function visibleRetentionState(state, key, token, authLoading, now) {
  if (authLoading || state.key !== key || (state.data && state.token !== token)
      || (state.data && state.expires <= now))
    return { data: null, loading: true, error: null };
  return state;
}
