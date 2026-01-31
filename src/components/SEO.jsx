import { Helmet } from 'react-helmet-async';

const defaultMeta = {
  title: 'Revenue Ripple',
  description: 'Empowering entrepreneurs with proven marketing strategies, AI-powered tools, and comprehensive training to build sustainable online businesses.',
  image: '/og-image.png',
  url: 'https://revenueripple.org'
};

export default function SEO({ 
  title, 
  description, 
  image,
  url,
  type = 'website',
  noIndex = false 
}) {
  const seoTitle = title ? `${title} | Revenue Ripple` : defaultMeta.title;
  const seoDescription = description || defaultMeta.description;
  const seoImage = image || defaultMeta.image;
  const seoUrl = url || defaultMeta.url;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content="Revenue Ripple" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      <link rel="canonical" href={seoUrl} />
    </Helmet>
  );
}
