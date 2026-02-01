import EventsClient from './EventsClient';

export const metadata = {
    title: 'Exclusive Events & Networking | Trills',
    description: 'Discover and attend exclusive social gatherings, workshops, and professional networking sessions.',
    openGraph: {
        title: 'Exclusive Events & Networking | Trills',
        description: 'Join the city\'s most exclusive social and professional events.',
        url: 'https://www.trills.in/events',
        images: [{ url: 'https://www.trills.in/og-events.jpg' }],
    },
    alternates: {
        canonical: 'https://www.trills.in/events',
    },
};

export default function EventsPage() {
    return <EventsClient />;
}
