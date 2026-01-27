// This is a persistent mock data store for demonstration purposes
// In a real app, this would be a database like MongoDB or PostgreSQL

export let venues = [
    {
        id: '1',
        name: 'Luminary Dining',
        type: 'restaurant',
        description: 'Experience gourmet excellence under the stars. Specializing in Mediterranean fusion.',
        address: 'Skyline Plaza, Rooftop, New York',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
        rating: 4.9,
        reviewCount: 124,
        category: 'Fine Dining',
        priceRange: '$$$$',
        capacity: 10, // Total tables/desks available
        bookedCount: 0,
        slots: ['19:00', '20:00', '21:00', '22:00'],
        website: 'https://example.com/luminary',
        openTime: '18:00',
        closeTime: '23:00'
    },
    {
        id: '2',
        name: 'Nexus Co-working',
        type: 'coworking',
        description: 'High-speed connectivity meets professional serenity. Ideal for digital nomads.',
        address: 'Tech District, 5th Avenue',
        image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=1000',
        rating: 4.7,
        reviewCount: 88,
        category: 'Premium Office',
        priceRange: '$$',
        capacity: 20,
        bookedCount: 0,
        amenities: ['Gigabit WiFi', 'Artisanal Coffee'],
        website: 'https://example.com/nexus',
        openTime: '08:00',
        closeTime: '20:00'
    },
    {
        id: '3',
        name: 'Aura Social Lounge',
        type: 'restaurant',
        description: 'A sophisticated space for evening cocktails and gourmet small plates.',
        address: 'Downtown Arts District',
        image: 'https://images.unsplash.com/photo-1550966842-30c29a0dde64?auto=format&fit=crop&q=80&w=1000',
        rating: 4.5,
        reviewCount: 56,
        category: 'Lounge',
        priceRange: '$$$',
        capacity: 15,
        bookedCount: 2,
        slots: ['18:00', '19:30', '21:00'],
        website: 'https://example.com/aura',
        openTime: '17:00',
        closeTime: '01:00'
    },
    {
        id: '4',
        name: 'Zenith Hub',
        type: 'coworking',
        description: 'Focused quiet zones and collaborative pods for high-performance teams.',
        address: 'Financial Center, East Wing',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000',
        rating: 4.8,
        reviewCount: 42,
        category: 'Team Space',
        priceRange: '$$$',
        capacity: 12,
        bookedCount: 4,
        amenities: ['Private Meeting Rooms', 'Podcast Studio'],
        website: 'https://example.com/zenith',
        openTime: '09:00',
        closeTime: '18:00'
    }
];

export let events = [
    {
        id: 'e1',
        title: 'Tech Founders Networking Night',
        description: 'Mingle with the brightest minds in tech.',
        date: '2026-02-15',
        time: '18:30',
        venueId: '2',
        price: 25,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000',
        category: 'Networking'
    },
    {
        id: 'e2',
        title: 'Creative Minds Mixer',
        description: 'Designers, artists, and creators coming together for an evening of inspiration.',
        date: '2026-02-20',
        time: '19:00',
        venueId: '3',
        price: 15,
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000',
        category: 'Social'
    },
    {
        id: 'e3',
        title: 'SaaS Growth Workshop',
        description: 'Strategy session with leading marketing experts in the SaaS space.',
        date: '2026-02-25',
        time: '10:00',
        venueId: '4',
        price: 50,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000',
        category: 'Workshop'
    }
];

export const interestOptions = [
    { id: 'socializing', label: 'Socializing', icon: 'Users' },
    { id: 'business', label: 'Business Networking', icon: 'Briefcase' },
    { id: 'dine-in', label: 'Dine-In Experiences', icon: 'Utensils' },
    { id: 'events', label: 'Attend Events', icon: 'Ticket' },
    { id: 'coworking', label: 'Co-working', icon: 'Monitor' }
];

export const designationOptions = [
    'Senior Software Engineer',
    'Product Designer',
    'UX Lead',
    'Product Manager',
    'Founding Engineer',
    'Venture Capitalist',
    'Marketing Director',
    'CTO / Tech Lead',
    'Digital Nomad',
    'Creative Director'
];

export const locationOptions = [
    'Mumbai, Maharashtra',
    'Delhi NCR',
    'Bangalore, Karnataka',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Pune, Maharashtra',
    'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan',
    'Lucknow, Uttar Pradesh',
    'Chandigarh, Punjab/Haryana',
    'Remote (India)'
];

export let activityFeed = [
    {
        id: 'p1',
        user: { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex', verified: true },
        content: 'Just booked a desk at Nexus Co-working. The coffee here is actually insane! ☕️💻',
        image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000',
        likes: 24,
        comments: 3,
        timestamp: '2 hours ago'
    },
    {
        id: 'p2',
        user: { name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=sarah', verified: true },
        content: 'Lovely evening at Luminary Dining. That sunset view over the city is unbeatable! 🌅🍷',
        image: 'https://images.unsplash.com/photo-1502301103665-0b95cc738def?auto=format&fit=crop&q=80&w=1000',
        likes: 42,
        comments: 5,
        timestamp: '5 hours ago'
    },
    {
        id: 'p3',
        user: { name: 'Marcus Chen', avatar: 'https://i.pravatar.cc/150?u=marcus', verified: false },
        content: 'Anyone heading to the Tech Founders night tomorrow? Looking to connect with some React experts! 🚀',
        likes: 12,
        comments: 8,
        timestamp: '1 day ago'
    }
];

export let notifications = [
    {
        id: 'n1',
        type: 'connection_request',
        userName: 'Sarah Jenkins',
        content: 'sent you a connection request.',
        timestamp: '10 mins ago',
        read: false,
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        verified: true
    },
    {
        id: 'n4',
        type: 'verification_nudge',
        userName: 'Trills Safety',
        content: 'Verification recommended: Verified profiles are 3x more likely to be accepted for meetups!',
        timestamp: 'Just now',
        read: false,
        avatar: 'https://i.pravatar.cc/150?u=safety',
        link: '/profile'
    },
    {
        id: 'n5',
        type: 'activity',
        userName: 'Alex Rivera',
        content: 'accepted your connection request.',
        timestamp: '2 hours ago',
        read: false,
        avatar: 'https://i.pravatar.cc/150?u=alex',
        verified: true
    },
    {
        id: 'n2',
        type: 'feed_update',
        userName: '',
        content: 'A new tech meetup was posted near your location.',
        timestamp: '1 hour ago',
        read: true,
        avatar: 'https://i.pravatar.cc/150?u=tech'
    },
    {
        id: 'n3',
        type: 'activity',
        userName: 'Marcus',
        content: 'liked your post about Nexus Co-working.',
        timestamp: '2 hours ago',
        read: true,
        avatar: 'https://i.pravatar.cc/150?u=marcus'
    }
];

export let mockConnections = [
    { id: 'c1', name: 'Sarah Jenkins', designation: 'UX Lead @ Google', avatar: 'https://i.pravatar.cc/150?u=sarah', mutual: true, verified: true },
    { id: 'c2', name: 'Marcus Chen', designation: 'Founding Engineer @ Vercel', avatar: 'https://i.pravatar.cc/150?u=marcus', mutual: true, verified: true },
    { id: 'c3', name: 'Elena Rodriguez', designation: 'Product Manager @ Meta', avatar: 'https://i.pravatar.cc/150?u=elena', mutual: false, verified: false },
    { id: 'c4', name: 'David Smith', designation: 'VC @ Andreessen Horowitz', avatar: 'https://i.pravatar.cc/150?u=david', mutual: true, verified: true },
];

export const checkInviteEligibility = (connectionName) => {
    const conn = mockConnections.find(c => c.name === connectionName);
    return conn ? conn.mutual : false;
};

// Helper functions to manage the "DB"
export const addVenue = (venue) => {
    const newVenue = { id: Date.now().toString(), bookedCount: 0, ...venue };
    venues = [...venues, newVenue];
    return newVenue;
};

export const addEvent = (event) => {
    const newEvent = { id: Date.now().toString(), ...event };
    events = [...events, newEvent];
    return newEvent;
};

export const deleteVenue = (id) => {
    venues = venues.filter(v => v.id !== id);
};

export const updateVenue = (id, data) => {
    venues = venues.map(v => v.id === id ? { ...v, ...data } : v);
};

export const deleteEvent = (id) => {
    events = events.filter(e => e.id !== id);
};

export const updateEvent = (id, data) => {
    events = events.map(e => e.id === id ? { ...e, ...data } : e);
};

export const updateBookedCount = (venueId, count) => {
    venues = venues.map(v =>
        v.id === venueId ? { ...v, bookedCount: Math.max(0, v.bookedCount + Number(count)) } : v
    );
};

export const setBookedCount = (venueId, count) => {
    venues = venues.map(v =>
        v.id === venueId ? { ...v, bookedCount: Number(count) } : v
    );
};

export const addRating = (venueId, newRating) => {
    venues = venues.map(v => {
        if (v.id === venueId) {
            const totalScore = (v.rating * v.reviewCount) + newRating;
            const newCount = v.reviewCount + 1;
            return {
                ...v,
                rating: Number((totalScore / newCount).toFixed(1)),
                reviewCount: newCount
            };
        }
        return v;
    });
};

export const addNotification = (notif) => {
    const newNotif = {
        id: Date.now().toString(),
        read: false,
        timestamp: 'Just now',
        ...notif
    };
    notifications = [newNotif, ...notifications];
    return newNotif;
};

export const markNotificationsAsRead = () => {
    // Get the list of notification IDs that have been read from localStorage
    const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');

    // Mark all current notifications as read
    notifications.forEach(n => {
        n.read = true;
        if (!readNotifs.includes(n.id)) {
            readNotifs.push(n.id);
        }
    });

    // Save to localStorage
    localStorage.setItem('read_notifications', JSON.stringify(readNotifs));

    // Dispatch event to update UI in other components
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notificationsRead'));
    }
};

// Initialize notifications with read state from localStorage
if (typeof window !== 'undefined') {
    const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    notifications.forEach(n => {
        if (readNotifs.includes(n.id)) {
            n.read = true;
        }
    });
}
