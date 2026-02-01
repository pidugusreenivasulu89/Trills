'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomeClient() {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [localVenues, setLocalVenues] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchPageData();
        const stored = localStorage.getItem('user_profile');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const fetchPageData = async () => {
        // 1. Fetch Venues
        const vRes = await fetch('/api/venues');
        const vData = await vRes.json();
        setLocalVenues(vData);

        // 2. Check Pending Reviews
        const pending = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
        const now = new Date();

        const toReview = pending.filter(b => {
            const visitTime = new Date(`${b.date}T${b.time}`);
            return visitTime < now;
        });
        setPendingReviews(toReview);
    };

    const submitRating = async (bookingId, venueId, rating) => {
        const res = await fetch('/api/ratings', {
            method: 'POST',
            body: JSON.stringify({ venueId, rating })
        });

        if (res.ok) {
            // Remove from pending
            const updated = JSON.parse(localStorage.getItem('pending_reviews') || '[]')
                .filter(b => b.id !== bookingId);
            localStorage.setItem('pending_reviews', JSON.stringify(updated));
            setPendingReviews(pendingReviews.filter(b => b.id !== bookingId));
            fetchPageData(); // Refresh venue ratings on page
            alert('Thanks for your feedback!');
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Pending Reviews Alert */}
            {pendingReviews.length > 0 && (
                <div className="container" style={{ paddingTop: '20px' }}>
                    <div className="glass-card" style={{ background: 'linear-gradient(90deg, rgba(75, 24, 76, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)', border: '1px solid var(--primary)' }}>
                        <h3 className="title-font" style={{ marginBottom: '10px' }}>Rate Your Recent Visits</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '0.9rem' }}>We hope you enjoyed your visit! Please share your feedback.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pendingReviews.map(review => (
                                <div key={review.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(75, 24, 76, 0.03)', borderRadius: '12px' }}>
                                    <div>
                                        <span style={{ fontWeight: '600', display: 'block' }}>{review.venueName}</span>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visited on {new Date(review.date).toLocaleDateString()} at {review.time}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => submitRating(review.id, review.venueId, star)}
                                                onMouseOver={(e) => e.target.style.color = '#fbbf24'}
                                                onMouseOut={(e) => e.target.style.color = '#fbbf24'}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#fbbf24', transition: '0.2s' }}
                                            >
                                                ☆
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Nudge Alert */}
            {user && !user.verified && (
                <div className="container" style={{ paddingTop: '20px' }}>
                    <div className="glass-card" style={{ background: 'linear-gradient(135deg, #4B184C 0%, #6d236f 100%)', border: 'none', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                        <div>
                            <h3 className="title-font" style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Trust is our priority</h3>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>You're currently unverified. Verified members get priority access to premium venues.</p>
                        </div>
                        <Link href="/profile?verify=true" className="btn-primary" style={{ background: 'white', color: '#4B184C', whiteSpace: 'nowrap' }}>Get Verified Now</Link>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section style={{
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    background: 'var(--primary)',
                    filter: 'blur(150px)',
                    opacity: '0.1',
                    zIndex: -1,
                    borderRadius: '50%'
                }}></div>

                <h1 className="title-font" style={{ fontSize: '4.5rem', fontWeight: '800', marginBottom: '20px', lineHeight: '1.1' }}>
                    Work, Dine, & <span style={{ color: 'var(--primary)' }}>Experience</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '40px' }}>
                    Discover the city's finest dining, premium co-working spaces, and exclusive social events all in one place.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link href="/explore" className="btn-primary">Explore Now</Link>
                    <Link href="/feed" className="btn-outline">View Activity</Link>
                </div>
            </section>

            <div className="container">
                {/* Categories */}
                <section style={{ marginBottom: '100px' }}>
                    <h2 className="title-font" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Featured Experiences</h2>
                    <div className="grid-3">
                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ height: '200px', background: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000") center/cover' }}></div>
                            <div style={{ padding: '24px' }}>
                                <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Dineout</span>
                                <h3 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Premium Dining</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>Book a table at the city's most exclusive restaurants and enjoy curated menus.</p>
                                <Link href="/explore?type=restaurant" className="btn-primary" style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>Book Table</Link>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ height: '200px', background: 'url("https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=1000") center/cover' }}></div>
                            <div style={{ padding: '24px' }}>
                                <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Workspace</span>
                                <h3 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Co-working Spaces</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>Pick a desk, grab a coffee, and get productive in our premium partner spaces.</p>
                                <Link href="/explore?type=coworking" className="btn-primary" style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>Book Workspace</Link>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ height: '200px', background: 'url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000") center/cover' }}></div>
                            <div style={{ padding: '24px' }}>
                                <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Events</span>
                                <h3 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Exclusive Events</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>Never miss out on what's happening. From tech meetups to jazz nights.</p>
                                <Link href="/events" className="btn-primary" style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>Attend Events</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Picks */}
                <section style={{ marginBottom: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                        <div>
                            <h2 className="title-font" style={{ fontSize: '2.5rem' }}>Top Venues</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Highly rated by our community</p>
                        </div>
                        <Link href="/explore" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>View All →</Link>
                    </div>

                    <div className="grid-3">
                        {localVenues.slice(0, 3).map(venue => (
                            <div key={venue.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '180px', background: `url(${venue.image}) center/cover` }}></div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <h3 className="title-font" style={{ margin: 0 }}>{venue.name}</h3>
                                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {venue.rating}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>{venue.address}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span className="badge badge-primary" style={{ width: 'fit-content' }}>{venue.category}</span>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Average Budget: <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{venue.priceRange}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
