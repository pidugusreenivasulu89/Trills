
import HomeClient from './HomeClient';

// SEO Metadata Configuration
export const metadata = {
  title: 'Trills | Work, Dine & Connect - Premium Venues & Events',
  description: 'The ultimate social platform for booking premium dining experiences, co-working spaces, and exclusive events. Join Trills to work, network, and enjoy the best venues in your city.',
  keywords: 'social platform, coworking spaces, premium dining, event booking, professional networking, Trills, work from cafe, restaurant booking app',
  openGraph: {
    title: 'Trills | Work, Dine & Connect',
    description: 'The ultimate social platform for booking premium dining experiences, co-working spaces, and exclusive events.',
    url: 'https://trills.in',
    siteName: 'Trills',
    images: [
      {
        url: 'https://trills.in/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Trills - Work, Dine, & Connect',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trills | Work, Dine & Connect',
    description: 'Discover the city\'s finest dining, premium co-working spaces, and exclusive social events.',
    images: ['https://trills.in/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://trills.in',
  },
};

export default function Home() {
  // Structured Data for Home Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Trills",
        "url": "https://trills.in",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://trills.in/explore?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "Trills",
        "url": "https://trills.in",
        "logo": "https://trills.in/logo.png",
        "sameAs": [
          "https://twitter.com/trills_app",
          "https://instagram.com/trills_app",
          "https://linkedin.com/company/trills"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9876543210",
          "contactType": "customer service"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
