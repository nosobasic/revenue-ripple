import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://revenueripple.org';
const DEFAULT_IMAGE = `${SITE_URL}/assets/icons/revenue_ripple_icon_transparent.png`;

/**
 * Use on any page to set title, description, and social meta for SEO and link previews.
 * @param {string} title - Page title (e.g. "Login | Revenue Ripple")
 * @param {string} [description] - Meta description; omit to use default
 * @param {string} [path] - Path for canonical/og:url (e.g. "/login"); defaults to current path
 * @param {string} [image] - Full URL for og:image; defaults to site icon
 * @param {boolean} [noIndex] - Set true for thank-you or private pages to avoid indexing
 */
export default function SEO({ title, description, path, image = DEFAULT_IMAGE, noIndex = false }) {
  const fullTitle = title ? `${title} | Revenue Ripple` : 'Revenue Ripple – AI-Powered Marketing Training & Membership';
  const metaDescription = description || 'Revenue Ripple helps entrepreneurs master AI, email marketing, funnels, and paid traffic. Join the membership for courses, training, and community support.';
  const canonicalPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
