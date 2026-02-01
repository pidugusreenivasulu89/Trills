'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Star, MapPin, Globe, Users, Clock, CheckCircle, Info, Filter, X, CreditCard, Lock, Navigation } from 'lucide-react';

function ExploreContent() {
    const searchParams = useSearchParams();
    const typeFilter = searchParams.get('type');

    const [filter, setFilter] = useState(typeFilter || 'all');
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [userRatings, setUserRatings] = useState({});

    // Location Features
    const [userLocation, setUserLocation] = useState(null);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        setIsLoading(true);
        const res = await fetch('/api/venues');
        const data = await res.json();
        setVenues(data);
        setIsLoading(false);
    };

    // Location Helper Functions
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationLoading(false);
                setSortByDistance(true); // Auto-enable distance sorting
            },
            () => {
                alert('Unable to retrieve your location');
                setLocationLoading(false);
            }
        );
    };

    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return parseFloat(d.toFixed(1));
    };

    const openDirections = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    // Filter and Sort Logic
    let filteredVenues = filter === 'all'
        ? venues
        : venues.filter(v => v.type === filter);

    if (userLocation) {
        filteredVenues = filteredVenues.map(v => ({
            ...v,
            distance: v.coordinates ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, v.coordinates.lat, v.coordinates.lng) : null
        }));

        if (sortByDistance) {
            filteredVenues.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }
    }

    const initiateBooking = (e) => {
        e.preventDefault();
        if (!selectedTable) {
            setError('Please select a table');
            return;
        }
        const guests = e.target.guests.value;
        const bookingTime = e.target.bookingTime.value;
        const bookingDate = e.target.bookingDate.value;

        setBookingDetails({
            guests,
            bookingTime,
            bookingDate,
            tableNumber: selectedTable.number
        });
        setShowPayment(true);
    };

    const processPaymentAndBook = async (e) => {
        e.preventDefault();
        setIsProcessingPayment(true);
        setError('');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const res = await fetch('/api/bookings', {
            method: 'POST',
            body: JSON.stringify({
                venueId: selectedVenue.id,
                guests: Number(bookingDetails.guests),
                tableNumber: bookingDetails.tableNumber,
                amountPaid: 99,
                currency: 'INR',
                bookingTime: bookingDetails.bookingTime
            })
        });
        const data = await res.json();
        setIsProcessingPayment(false);
        if (res.ok) {
            setBookingSuccess(true);
            setShowPayment(false);
            const pending = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
            pending.push({
                venueId: selectedVenue.id,
                venueName: selectedVenue.name,
                date: bookingDetails.bookingDate,
                time: bookingDetails.bookingTime,
                id: Date.now()
            });
            localStorage.setItem('pending_reviews', JSON.stringify(pending));
            fetchVenues();
            await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ notification: { type: 'feed_update', content: `A professional from your industry just booked a table at ${selectedVenue.name}.`, avatar: 'https://i.pravatar.cc/150?u=pro' } }) });
        } else {
            setError(data.error);
        }
    };

    const closeModals = () => {
        setSelectedVenue(null);
        setSelectedTable(null);
        setShowPayment(false);
        setBookingDetails(null);
        setBookingSuccess(false);
        setError('');
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '40px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <h1 className="title-font" style={{ fontSize: '3rem', margin: 0 }}>Explore Venues</h1>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Location Control */}
                    <button
                        onClick={getUserLocation}
                        className="glass"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
                    >
                        <MapPin size={16} color={userLocation ? 'var(--primary)' : 'var(--text-main)'} />
                        {locationLoading ? 'Locating...' : userLocation ? 'Near Me' : 'Locate Me'}
                    </button>

                    <div className="glass" style={{ padding: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <Filter size={16} style={{ margin: '0 10px', opacity: 0.5 }} />
                        {['all', 'restaurant', 'coworking'].map(t => (
                            <button key={t} onClick={() => setFilter(t)} className={`filter-btn ${filter === t ? 'active' : ''}`}>
                                {t === 'all' ? 'All' : t === 'restaurant' ? 'Dining' : 'Workspaces'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Distance Sort Toggle */}
            {userLocation && (
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Found {filteredVenues.length} places near you</span>
                    <button
                        onClick={() => setSortByDistance(!sortByDistance)}
                        style={{ background: 'none', border: 'none', color: sortByDistance ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                    >
                        {sortByDistance ? 'Sorting by Distance' : 'Sort by Distance'}
                    </button>
                </div>
            )}

            {isLoading ? <p>Loading experiences...</p> : (
                <div className="grid-3">
                    {filteredVenues.map(venue => {
                        const isFull = venue.bookedCount >= venue.capacity;
                        return (
                            <div key={venue.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', opacity: isFull ? 0.8 : 1 }}>
                                <div style={{ height: '200px', background: `url(${venue.image}) center/cover`, position: 'relative' }}>
                                    {isFull && <div className="sold-out">FULLY BOOKED</div>}
                                    {venue.distance && (
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Navigation size={12} /> {venue.distance} km
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h3 className="title-font" style={{ margin: 0 }}>{venue.name}</h3>
                                        <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} fill="#fbbf24" /> {venue.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({venue.reviewCount})</span>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>{venue.category} • {venue.capacity - venue.bookedCount} spots left</p>
                                    <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '15px' }}>
                                        Average Budget: {venue.priceRange}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                disabled={isFull}
                                                onClick={() => setSelectedVenue(venue)}
                                                className="btn-primary"
                                                style={{ flex: 1, background: isFull ? 'var(--text-muted)' : 'var(--primary)', opacity: isFull ? 0.3 : 1 }}
                                            >
                                                {isFull ? 'Sold Out' : 'Book Now'}
                                            </button>

                                            {venue.coordinates && (
                                                <button
                                                    onClick={() => openDirections(venue.coordinates.lat, venue.coordinates.lng)}
                                                    className="btn-outline"
                                                    title="Get Directions"
                                                    style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Navigation size={18} />
                                                </button>
                                            )}
                                        </div>
                                        {venue.website && (
                                            <a
                                                href={venue.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-outline"
                                                style={{ textAlign: 'center', fontSize: '0.85rem' }}
                                            >
                                                Know More ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedVenue && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content" style={{ maxWidth: '450px', background: 'var(--bg-dark)', width: '100%' }}>

                        {/* 1. Success State */}
                        {bookingSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2rem' }}>✓</div>
                                <h3 className="title-font" style={{ marginBottom: '10px' }}>Booking Confirmed!</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Your experience at {selectedVenue.name} is scheduled.</p>

                                <button
                                    onClick={closeModals}
                                    className="btn-primary"
                                    style={{ marginTop: '30px', width: '100%' }}
                                >
                                    Done
                                </button>
                            </div>
                        ) : showPayment ? (
                            /* 2. Payment State */
                            <form onSubmit={processPaymentAndBook}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h2 className="title-font" style={{ fontSize: '1.5rem' }}>Secure Booking</h2>
                                    <div style={{ background: 'var(--bg-glass)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedTable?.type.replace('_', ' ')} #{selectedTable?.number}</div>
                                </div>

                                {error && <p style={{ color: 'var(--accent)', marginBottom: '10px' }}>{error}</p>}

                                <div style={{ background: 'var(--bg-glass)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-glass)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Base Reservation</span>
                                        <span style={{ textDecoration: 'line-through' }}>{selectedVenue.priceRange}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Booking Advance (Service Fee)</span>
                                        <span style={{ fontWeight: 'bold' }}>₹99</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '1px solid var(--border-glass)', paddingTop: '10px', fontSize: '1.1rem' }}>
                                        <span>Total Due Now</span>
                                        <span style={{ color: 'var(--primary)' }}>₹99</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', fontStyle: 'italic' }}>Pay the remainder directly at the venue.</p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <CreditCard size={14} /> Card Information
                                    </label>
                                    <input placeholder="0000 0000 0000 0000" className="booking-input" style={{ margin: '0 0 10px 0' }} required />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input placeholder="MM/YY" className="booking-input" style={{ margin: 0 }} required />
                                        <input placeholder="CVC" className="booking-input" style={{ margin: 0 }} required />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    disabled={isProcessingPayment}
                                >
                                    {isProcessingPayment ? 'Processing...' : <><Lock size={14} /> Pay ₹99 & Confirm</>}
                                </button>
                                <button type="button" className="btn-outline" onClick={() => setShowPayment(false)} style={{ width: '100%' }}>Change Table</button>
                            </form>
                        ) : (
                            /* 3. Booking Input State */
                            <form onSubmit={initiateBooking}>
                                <h2 className="title-font" style={{ marginBottom: '20px' }}>Book {selectedVenue.name}</h2>
                                {error && <p style={{ color: 'var(--accent)', marginBottom: '10px' }}>{error}</p>}

                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Choose your spot</label>
                                <div className="table-grid" style={{
                                    gridTemplateColumns: `repeat(${selectedVenue.layout?.cols || 5}, 1fr)`,
                                    gap: '8px'
                                }}>
                                    {Array.from({ length: (selectedVenue.layout?.rows || 5) * (selectedVenue.layout?.cols || 5) }).map((_, i) => {
                                        const r = Math.floor(i / (selectedVenue.layout?.cols || 5));
                                        const c = i % (selectedVenue.layout?.cols || 5);
                                        const asset = selectedVenue.tables?.find(t => t.row === r && t.col === c);

                                        if (!asset) return <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />;

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedTable(asset)}
                                                className={`table-node ${selectedTable?.id === asset.id || selectedTable?.number === asset.number ? 'selected' : ''} type-${asset.type}`}
                                                style={{
                                                    aspectRatio: '1',
                                                    background: (selectedTable?.id === asset.id || selectedTable?.number === asset.number)
                                                        ? 'var(--primary)'
                                                        : (asset.type === 'meeting_room' ? 'rgba(16, 185, 129, 0.2)' : asset.type === 'group_table' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-glass)'),
                                                    border: (selectedTable?.id === asset.id || selectedTable?.number === asset.number) ? 'none' : `1px solid ${asset.type === 'meeting_room' ? '#10b981' : asset.type === 'group_table' ? '#3b82f6' : 'var(--border-glass)'}`
                                                }}
                                            >
                                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                    {asset.type === 'meeting_room' ? 'Room' : asset.type === 'single_chair' ? 'Chair' : asset.type === 'group_table' ? 'Group' : `T${asset.number}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedTable && (
                                    <div style={{ marginTop: '20px', animation: 'slideIn 0.3s ease-out' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Available Timings for {selectedTable.type.replace('_', ' ')}</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {(selectedTable.slots?.length > 0 ? selectedTable.slots : ["09:00", "11:00", "14:00", "16:00", "19:00"]).map(slot => (
                                                <div key={slot} className="time-pill">
                                                    <input type="radio" name="bookingTime" value={slot} id={`time-${slot}`} style={{ display: 'none' }} required />
                                                    <label htmlFor={`time-${slot}`} className="slot-label">{slot}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.9rem' }}>Date</label>
                                        <input name="bookingDate" type="date" required className="booking-input" />
                                    </div>
                                </div>
                                <label style={{ fontSize: '0.9rem' }}>Guests / Desks</label>
                                <input name="guests" type="number" min="1" defaultValue={selectedTable?.capacity || 1} className="booking-input" />

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ marginTop: '20px', width: '100%', opacity: !selectedTable ? 0.5 : 1 }}
                                    disabled={!selectedTable}
                                >
                                    {selectedTable ? 'Confirm & Secure Seat' : 'Select a Spot First'}
                                </button>
                                <button type="button" className="btn-outline" onClick={() => setSelectedVenue(null)} style={{ marginTop: '10px', width: '100%' }}>Cancel</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .filter-btn { padding: 8px 20px; border-radius: 10px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: 0.3s; font-weight: 500; }
                .filter-btn.active { background: var(--primary); color: white; }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(75, 24, 76, 0.15); display: flex; align-items: center; justify-content: center; z-index: 3000; backdrop-filter: blur(8px); }
                .booking-input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 10px; background: rgba(75, 24, 76, 0.05); border: 1px solid var(--border-glass); color: var(--text-main); outline: none; transition: 0.3s; }
                .booking-input:focus { border-color: var(--primary); background: white; }
                .table-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
                .table-node { aspect-ratio: 1; border: 1px solid var(--border-glass); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; background: var(--bg-glass); }
                .table-node:hover { border-color: var(--primary); transform: translateY(-2px); }
                .table-node.selected { background: var(--primary); border-color: var(--primary); color: white; }
                .slot-label { display: block; padding: 8px 15px; border-radius: 8px; background: var(--bg-glass); border: 1px solid var(--border-glass); cursor: pointer; font-size: 0.85rem; transition: 0.2s; }
                .time-pill input:checked + .slot-label { background: var(--primary); border-color: var(--primary); color: white; }
                .sold-out { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; color: var(--primary); font-weight: 800; font-size: 1.5rem; letter-spacing: 2px; }
            `}</style>
        </div>
    );
}

export default function ExploreClient() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading experiences...</div>}>
            <ExploreContent />
        </Suspense>
    );
}
