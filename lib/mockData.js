// Temporary mock data for development when MongoDB is unavailable
export const mockVenues = [
    {
        id: '1',
        name: 'Luminary Dining',
        type: 'restaurant',
        category: 'Fine Dining',
        description: 'An elegant fine dining experience with panoramic city views',
        address: '123 Sky Tower, Downtown',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
        rating: 4.8,
        reviewCount: 142,
        priceRange: '₹₹₹',
        capacity: 25,
        coordinates: { lat: 12.9716, lng: 77.5946 },
        bookedCount: 8,
        website: 'https://luminarydining.com',
        openTime: '11:00',
        closeTime: '23:00',
        layout: { rows: 5, cols: 5 },
        tables: [
            { number: 1, type: 'table', capacity: 4, row: 0, col: 0, slots: ['11:00', '13:00', '15:00', '19:00', '21:00'] },
            { number: 2, type: 'table', capacity: 2, row: 0, col: 2, isWindowSide: true, slots: ['11:00', '13:00', '15:00', '19:00', '21:00'] },
            { number: 3, type: 'table', capacity: 4, row: 1, col: 1, slots: ['11:00', '13:00', '15:00', '19:00', '21:00'] },
            { number: 4, type: 'table', capacity: 6, row: 2, col: 2, slots: ['11:00', '13:00', '15:00', '19:00', '21:00'] },
            { number: 5, type: 'table', capacity: 2, row: 3, col: 0, isQuietZone: true, slots: ['11:00', '13:00', '15:00', '19:00', '21:00'] }
        ]
    },
    {
        id: '2',
        name: 'Nexus Co-working',
        type: 'coworking',
        category: 'Premium Workspace',
        description: 'Modern co-working space with high-speed internet and coffee bar',
        address: '456 Innovation Hub, Tech District',
        image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000',
        rating: 4.6,
        reviewCount: 89,
        priceRange: '₹₹',
        capacity: 30,
        coordinates: { lat: 12.9352, lng: 77.6245 },
        bookedCount: 12,
        website: 'https://nexuscowork.com',
        openTime: '08:00',
        closeTime: '20:00',
        layout: { rows: 6, cols: 6 },
        tables: [
            { number: 1, type: 'single_chair', capacity: 1, row: 0, col: 0, slots: ['09:00', '11:00', '14:00', '16:00'] },
            { number: 2, type: 'single_chair', capacity: 1, row: 0, col: 1, slots: ['09:00', '11:00', '14:00', '16:00'] },
            { number: 3, type: 'meeting_room', capacity: 8, row: 1, col: 3, slots: ['09:00', '11:00', '14:00', '16:00'] },
            { number: 4, type: 'group_table', capacity: 6, row: 2, col: 1, slots: ['09:00', '11:00', '14:00', '16:00'] },
            { number: 5, type: 'single_chair', capacity: 1, row: 3, col: 0, isQuietZone: true, slots: ['09:00', '11:00', '14:00', '16:00'] }
        ]
    },
    {
        id: '3',
        name: 'Zenith Rooftop',
        type: 'restaurant',
        category: 'Rooftop Bar',
        description: 'Stunning rooftop bar with craft cocktails and live music',
        address: '789 Heights Avenue, Uptown',
        image: 'https://images.unsplash.com/photo-1502301103665-0b95cc738def?auto=format&fit=crop&q=80&w=1000',
        rating: 4.9,
        reviewCount: 203,
        priceRange: '₹₹₹₹',
        capacity: 20,
        coordinates: { lat: 12.9784, lng: 77.6408 },
        bookedCount: 15,
        openTime: '17:00',
        closeTime: '02:00',
        layout: { rows: 4, cols: 5 },
        tables: [
            { number: 1, type: 'table', capacity: 4, row: 0, col: 0, isWindowSide: true, slots: ['18:00', '20:00', '22:00'] },
            { number: 2, type: 'table', capacity: 2, row: 0, col: 2, isWindowSide: true, slots: ['18:00', '20:00', '22:00'] },
            { number: 3, type: 'table', capacity: 6, row: 1, col: 1, slots: ['18:00', '20:00', '22:00'] }
        ]
    }
];

export const mockEvents = [
    {
        id: '1',
        title: 'Tech Founders Meetup',
        category: 'Networking',
        price: 0,
        description: 'Connect with fellow entrepreneurs and tech founders',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '2',
        title: 'Jazz Night Live',
        category: 'Music',
        price: 500,
        description: 'An evening of smooth jazz with local artists',
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=1000'
    }
];

export const mockNotifications = [
    {
        id: '1',
        type: 'friend_request',
        userName: 'Aarav Sharma',
        content: 'sent you a connection request. Would you like to connect?',
        timestamp: '5 min ago',
        read: false,
        avatar: 'https://i.pravatar.cc/150?u=aarav',
        verified: true
    },
    {
        id: '2',
        type: 'booking',
        userName: 'Nexus Co-working',
        content: 'Your desk booking for tomorrow at 10:00 AM is confirmed.',
        timestamp: '1 hour ago',
        read: true,
        avatar: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=100',
    },
    {
        id: '3',
        type: 'crush',
        userName: 'Someone',
        content: 'just added you to their crush list! Check your matches.',
        timestamp: '3 hours ago',
        read: false,
        avatar: '',
    },
    {
        id: '4',
        type: 'accepted',
        userName: 'Ishani Gupta',
        content: 'accepted your invitation to meeting at Zenith Rooftop.',
        timestamp: 'Yesterday',
        read: true,
        avatar: 'https://i.pravatar.cc/150?u=ishani',
        verified: true
    }
];
