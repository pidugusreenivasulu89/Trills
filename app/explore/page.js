import ExploreClient from './ExploreClient';

// SEO Metadata Configuration
export const metadata = {
    title: 'Explore Premium Venues - Restaurants & Coworking Spaces | Trills',
    description: 'Discover and book premium dining experiences and co-working spaces in your city with Trills. Real-time availability and instant booking.',
    openGraph: {
        title: 'Explore Premium Venues | Trills',
        description: 'Find the perfect spot for work or leisure. Browse top-rated restaurants and coworking hubs near you.',
        url: 'https://trills.in/explore',
        images: [{ url: 'https://trills.in/og-explore.jpg' }],
    },
    alternates: {
        canonical: 'https://trills.in/explore',
    },
};

export default function ExplorePage() {
    // JSON-LD for Search Results Page
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Explore Venues on Trills",
        "description": "Browse our curated list of premium restaurants and coworking spaces.",
        "url": "https://trills.in/explore",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://trills.in" },
                { "@type": "ListItem", "position": 2, "name": "Explore", "item": "https://trills.in/explore" }
            ]
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
