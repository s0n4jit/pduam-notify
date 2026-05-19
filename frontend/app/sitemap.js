/**
 * Dynamic sitemap — /sitemap.xml
 * Next.js App Router generates this automatically at build time.
 */

export default function sitemap() {
  const base = 'https://notify.pduam.dpdns.org';
  const now  = new Date().toISOString();

  return [
    {
      url:              base,
      lastModified:     now,
      changeFrequency:  'daily',
      priority:         1.0,
    },
    {
      url:              `${base}/notices`,
      lastModified:     now,
      changeFrequency:  'hourly',
      priority:         0.9,
    },
    {
      url:              `${base}/about`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.6,
    },
    {
      url:              `${base}/privacy-policy`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.4,
    },
    {
      url:              `${base}/terms-of-service`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.4,
    },
  ];
}
