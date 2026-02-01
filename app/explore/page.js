
import ExploreClient from './ExploreClient';

// SEO Metadata Configuration
export const metadata = {
    title: 'Explore Premium Venues - Restaurants & Coworking Spaces | Trills',
    description: 'Discover and book premium dining experiences, coworking spaces, and exclusive venues. Connect with professionals while enjoying curated restaurants, cafes, and workspaces. Book your table or desk now!',
    keywords: 'premium restaurants, coworking spaces, book table online, dining experiences, workspace booking, professional networking, exclusive venues, restaurant reservations, desk booking, Trills',
    openGraph: {
        title: 'Explore Premium Venues - Restaurants & Coworking Spaces | Trills',
        description: 'Discover and book premium dining experiences, coworking spaces, and exclusive venues. Connect with professionals in curated spaces.',
        url: 'https://trills.in/explore',
        siteName: 'Trills',
        images: [
            {
                url: 'https://trills.in/og-explore.jpg',
                width: 1200,
                height: 630,
                alt: 'Trills - Explore Premium Venues',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Explore Premium Venues - Restaurants & Coworking Spaces | Trills',
        description: 'Discover and book premium dining experiences, coworking spaces, and exclusive venues.',
        images: ['https://trills.in/og-explore.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://trills.in/explore',
    },
};

export default function ExplorePage() {
    // Basic Organization Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Explore Premium Venues",
        "description": metadata.description,
        "url": metadata.openGraph.url,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://trills.in"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Explore",
                    "item": "https://trills.in/explore"
                }
            ]
        },
        "publisher": {
            "@type": "Organization",
            "name": "Trills",
            "url": "https://trills.in",
            "logo": {
                "@type": "ImageObject",
                "url": "https://trills.in/logo.png"
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ExploreClient />
        </>
    );
}
