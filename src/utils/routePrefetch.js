// Match the imports used by React.lazy so navigation reuses the module cache.
const routes = {
  '/': () => import('../pages/Home'),
  '/login': () => import('../pages/Login'),
  '/register': () => import('../pages/Register'),
  '/affiliate-login': () => import('../pages/AffiliateLogin'),
  '/courses': () => import('../pages/Courses'),
  '/dashboard': () => import('../pages/Dashboard'),
  '/training': () => import('../pages/Training'),
  '/ai-visibility': () => import('../pages/AIVisibilityDashboard'),
  '/community': () => import('../pages/Community'),
  '/community/forum': () => import('../pages/CommunityForum'),
  '/community/success-stories': () => import('../pages/SuccessStories'),
  '/profile': () => import('../pages/Profile'),
  '/special': () => import('../pages/Reseller'),
  '/dfy-funnel-consultation': () => import('../pages/DFYFunnelConsultation'),
  '/privacy-policy': () => import('../pages/PrivacyPolicy'),
  '/terms-of-service': () => import('../pages/TermsOfService'),
  '/cookie-policy': () => import('../pages/CookiePolicy'),
  '/refund-policy': () => import('../pages/RefundPolicy'),
  '/unsubscribe': () => import('../pages/Unsubscribe'),
};
const pending = new Map();

export function prefetchRoute(event) {
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  const load = routes[url.pathname];
  if (!load || pending.has(url.pathname)) return;
  // Failed speculation must not prevent the normal navigation from retrying.
  pending.set(url.pathname, load().catch(() => pending.delete(url.pathname)));
}
