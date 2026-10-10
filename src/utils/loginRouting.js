// Return destinations are navigation hints only, never access grants.
export function safeReturnTo(value) {
  const path = typeof value === 'string' ? value : value?.pathname &&
    `${value.pathname}${value.search || ''}${value.hash || ''}`;
  if (!path || !path.startsWith('/') || path.startsWith('//') || /[\\\s%]/.test(path.split('?')[0])) return '/dashboard';
  const url = new URL(path, 'https://local.invalid');
  if (url.origin !== 'https://local.invalid' || ['/login', '/register', '/auth/callback'].includes(url.pathname)) return '/dashboard';
  return `${url.pathname}${url.search}${url.hash}`;
}

export function clearPurchaseIntent() {
  localStorage.removeItem('oauth-redirect-path');
  sessionStorage.removeItem('intended-plan');
  sessionStorage.removeItem('intended-path');
  sessionStorage.removeItem('navigating-to-checkout');
  sessionStorage.removeItem('oauth-return-to');
}
