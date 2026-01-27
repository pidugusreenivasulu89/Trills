'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockConnections } from '@/lib/data';
import { CheckCircle, ShieldOff, UserCheck, Shield } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [localVenues, setLocalVenues] = useState([]);
    const [localEvents, setLocalEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('venue');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [profiles, setProfiles] = useState([]);

    // Forms
    // Forms
    const [venueForm, setVenueForm] = useState({
        name: '',
        type: 'restaurant',
        category: 'Fine Dining',
        capacity: 10,
        address: '',
        image: '',
        website: '',
        openTime: '09:00',
        closeTime: '22:00',
        priceRange: '$$',
        layout: { rows: 5, cols: 5 },
        tables: []
    });
    const [eventForm, setEventForm] = useState({ title: '', category: 'Networking', price: 0, description: '', image: '' });

    useEffect(() => {
        const isAdmin = localStorage.getItem('admin_auth') === 'true';
        if (!isAdmin) {
            router.push('/admin/login');
        } else {
            fetchData();
            setIsLoading(false);
        }
    }, [router]);

    const fetchData = async () => {
        const vRes = await fetch('/api/venues');
        const vData = await vRes.json();
        setLocalVenues(vData);

        const eRes = await fetch('/api/events');
        const eData = await eRes.json();
        setLocalEvents(eData);

        // Fetch mock profiles
        setProfiles([...mockConnections]);
    };

    const handleAddVenue = async (e) => {
        e.preventDefault();
        const url = isEditing ? `/api/venues/${editId}` : '/api/venues';
        const method = isEditing ? 'PUT' : 'POST';

        const finalForm = {
            ...venueForm,
            capacity: venueForm.tables.reduce((acc, t) => acc + (t.capacity || 0), 0)
        };

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalForm)
        });
        if (res.ok) {
            fetchData();
            setShowModal(false);
            setIsEditing(false);
            setEditId(null);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        const url = isEditing ? `/api/events/${editId}` : '/api/events';
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventForm)
        });
        if (res.ok) {
            fetchData();
            setShowModal(false);
            setIsEditing(false);
            setEditId(null);
        }
    };

    const handleDeleteVenue = async (id) => {
        if (!confirm('Are you sure you want to delete this venue?')) return;
        const res = await fetch(`/api/venues/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
    };

    const openEditVenue = (venue) => {
        setVenueForm({
            name: venue.name,
            type: venue.type,
            category: venue.category,
            capacity: venue.capacity,
            address: venue.address || '',
            image: venue.image,
            website: venue.website || '',
            openTime: venue.openTime || '09:00',
            closeTime: venue.closeTime || '22:00',
            priceRange: venue.priceRange || '$$',
            layout: venue.layout || { rows: 5, cols: 5 },
            tables: venue.tables || []
        });
        setEditId(venue.id);
        setIsEditing(true);
        setModalType('venue');
        setShowModal(true);
    };

    const openEditEvent = (event) => {
        setEventForm({ title: event.title, category: event.category, price: event.price, description: event.description, image: event.image });
        setEditId(event.id);
        setIsEditing(true);
        setModalType('event');
        setShowModal(true);
    };

    if (isLoading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Authenticating...</div>;

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                <aside className="glass" style={{ width: '250px', padding: '20px', position: 'sticky', top: '100px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Admin Dashboard</h2>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={() => setActiveTab('overview')} className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}>Overview</button>
                        <button onClick={() => setActiveTab('venues')} className={`nav-btn ${activeTab === 'venues' ? 'active' : ''}`}>Venues</button>
                        <button onClick={() => setActiveTab('events')} className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}>Events</button>
                        <button onClick={() => setActiveTab('profiles')} className={`nav-btn ${activeTab === 'profiles' ? 'active' : ''}`}>Profiles</button>
                    </nav>
                </aside>

                <main style={{ flexGrow: 1 }}>
                    {activeTab === 'overview' && (
                        <div>
                            <h1 className="title-font" style={{ fontSize: '2rem', marginBottom: '30px' }}>Quick Stats</h1>
                            <div className="grid-3">
                                <div className="glass-card"><h4>Venues</h4><h2>{localVenues.length}</h2></div>
                                <div className="glass-card"><h4>Events</h4><h2>{localEvents.length}</h2></div>
                                <div className="glass-card"><h4>Capacity</h4><h2>{localVenues.reduce((acc, v) => acc + (v.capacity || 0), 0)} Tables</h2></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'venues' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 className="title-font">Venues</h2>
                                <button className="btn-primary" onClick={() => {
                                    setModalType('venue');
                                    setIsEditing(false);
                                    setVenueForm({
                                        name: '',
                                        type: 'restaurant',
                                        category: 'Fine Dining',
                                        capacity: 25,
                                        address: '',
                                        image: '',
                                        website: '',
                                        openTime: '09:00',
                                        closeTime: '22:00',
                                        priceRange: '$$',
                                        layout: { rows: 5, cols: 5 },
                                        tables: []
                                    });
                                    setShowModal(true);
                                }}>+ New Venue</button>
                            </div>
                            <div className="glass-card">
                                {localVenues.map(v => (
                                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-glass)' }}>
                                        <div>
                                            <h4>{v.name}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Hours: {v.openTime} - {v.closeTime} | Capacity: {v.capacity}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input
                                                    type="number"
                                                    defaultValue={v.capacity - v.bookedCount}
                                                    style={{ width: '50px', background: '#333', border: '1px solid #444', color: 'white', padding: '4px', borderRadius: '4px' }}
                                                    onBlur={async (e) => {
                                                        await fetch('/api/bookings', {
                                                            method: 'POST',
                                                            body: JSON.stringify({ venueId: v.id, guests: Number(e.target.value), action: 'setRemaining' })
                                                        });
                                                        fetchData();
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avail.</span>
                                            </div>
                                            <span className={`badge ${v.bookedCount >= v.capacity ? 'badge-accent' : 'badge-secondary'}`}>
                                                {v.bookedCount >= v.capacity ? 'FULL' : `${v.capacity - v.bookedCount} Left`}
                                            </span>
                                            <button onClick={() => openEditVenue(v)} className="btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Edit</button>
                                            <button onClick={() => handleDeleteVenue(v.id)} className="btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.4)' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 className="title-font">Events</h2>
                                <button className="btn-primary" onClick={() => { setModalType('event'); setIsEditing(false); setEventForm({ title: '', category: 'Networking', price: 0, description: '', image: '' }); setShowModal(true); }}>+ New Event</button>
                            </div>
                            <div className="glass-card">
                                {localEvents.map(e => (
                                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-glass)' }}>
                                        <div>
                                            <h4>{e.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.category} | ${e.price}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => openEditEvent(e)} className="btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Edit</button>
                                            <button onClick={() => handleDeleteEvent(e.id)} className="btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.4)' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'profiles' && (
                        <div>
                            <h2 className="title-font" style={{ marginBottom: '20px' }}>User Profile Database</h2>
                            <div className="glass-card">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', paddingBottom: '15px', borderBottom: '2px solid var(--border-glass)', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <div>User Details</div>
                                    <div>Designation</div>
                                    <div style={{ textAlign: 'center' }}>Status</div>
                                    <div style={{ textAlign: 'center' }}>Actions</div>
                                </div>
                                {profiles.map(p => (
                                    <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border-glass)' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <img src={p.avatar} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {p.name}
                                                    {p.verified && <CheckCircle size={14} fill="#4B184C" color="white" />}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p.id}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem' }}>{p.designation}</div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span className={`badge ${p.verified ? 'badge-primary' : 'badge-accent'}`} style={{ background: p.verified ? 'rgba(75, 24, 76, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: p.verified ? '#4B184C' : '#e11d48' }}>
                                                {p.verified ? 'VERIFIED' : 'UNVERIFIED'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => {
                                                    const updated = profiles.map(pr => pr.id === p.id ? { ...pr, verified: !pr.verified } : pr);
                                                    setProfiles(updated);
                                                }}
                                                className="btn-outline"
                                                style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                {p.verified ? <><ShieldOff size={14} /> Revoke</> : <><UserCheck size={14} /> Verify</>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content" style={{ maxWidth: '500px', background: 'var(--bg-dark)' }}>
                        <h2 className="title-font" style={{ marginBottom: '20px' }}>{isEditing ? 'Edit' : 'Add New'} {modalType === 'venue' ? 'Venue' : 'Event'}</h2>
                        <form onSubmit={modalType === 'venue' ? handleAddVenue : handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {modalType === 'venue' ? (
                                <>
                                    <input placeholder="Venue Name" defaultValue={venueForm.name} className="admin-input" onChange={e => setVenueForm({ ...venueForm, name: e.target.value })} required />
                                    <input placeholder="Capacity (Tables/Desks)" defaultValue={venueForm.capacity} type="number" className="admin-input" onChange={e => setVenueForm({ ...venueForm, capacity: Number(e.target.value) })} required />
                                    <input placeholder="Image URL" defaultValue={venueForm.image} className="admin-input" onChange={e => setVenueForm({ ...venueForm, image: e.target.value })} required />
                                    <input placeholder="Average Budget (e.g. $50 or $$)" defaultValue={venueForm.priceRange} className="admin-input" onChange={e => setVenueForm({ ...venueForm, priceRange: e.target.value })} required />
                                    <input placeholder="Website URL (Optional)" defaultValue={venueForm.website} className="admin-input" onChange={e => setVenueForm({ ...venueForm, website: e.target.value })} />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open Time</label>
                                            <input type="time" defaultValue={venueForm.openTime} className="admin-input" onChange={e => setVenueForm({ ...venueForm, openTime: e.target.value })} required />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Close Time</label>
                                            <input type="time" defaultValue={venueForm.closeTime} className="admin-input" onChange={e => setVenueForm({ ...venueForm, closeTime: e.target.value })} required />
                                        </div>
                                    </div>
                                    <select className="admin-input" value={venueForm.type} onChange={e => setVenueForm({ ...venueForm, type: e.target.value })}>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="coworking">Coworking</option>
                                    </select>

                                    <div style={{ borderTop: '1px solid #333', paddingTop: '15px', marginTop: '10px' }}>
                                        <h3 style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Visual Layout Designer (Grid)</h3>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.65rem', color: '#888' }}>Rows</label>
                                                <input type="number" value={venueForm.layout.rows} className="admin-input" style={{ padding: '8px' }} onChange={e => setVenueForm({ ...venueForm, layout: { ...venueForm.layout, rows: Number(e.target.value) } })} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.65rem', color: '#888' }}>Columns</label>
                                                <input type="number" value={venueForm.layout.cols} className="admin-input" style={{ padding: '8px' }} onChange={e => setVenueForm({ ...venueForm, layout: { ...venueForm.layout, cols: Number(e.target.value) } })} />
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${venueForm.layout.cols}, 1fr)`,
                                            gap: '5px',
                                            maxHeight: '300px',
                                            overflow: 'auto',
                                            background: '#111',
                                            padding: '10px',
                                            borderRadius: '12px'
                                        }}>
                                            {Array.from({ length: venueForm.layout.rows * venueForm.layout.cols }).map((_, i) => {
                                                const r = Math.floor(i / venueForm.layout.cols);
                                                const c = i % venueForm.layout.cols;
                                                const asset = venueForm.tables.find(t => t.row === r && t.col === c);

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            if (asset) {
                                                                // Toggle off or edit? For now, cycle types
                                                                const types = venueForm.type === 'restaurant' ? ['none', 'table'] : ['none', 'single_chair', 'meeting_room', 'group_table'];
                                                                const currentIdx = types.indexOf(asset.type || 'table');
                                                                const nextType = types[(currentIdx + 1) % types.length];

                                                                if (nextType === 'none') {
                                                                    setVenueForm({ ...venueForm, tables: venueForm.tables.filter(t => !(t.row === r && t.col === c)) });
                                                                } else {
                                                                    setVenueForm({ ...venueForm, tables: venueForm.tables.map(t => (t.row === r && t.col === c) ? { ...t, type: nextType } : t) });
                                                                }
                                                            } else {
                                                                const defType = venueForm.type === 'restaurant' ? 'table' : 'single_chair';
                                                                setVenueForm({
                                                                    ...venueForm,
                                                                    tables: [...venueForm.tables, {
                                                                        number: venueForm.tables.length + 1,
                                                                        row: r,
                                                                        col: c,
                                                                        type: defType,
                                                                        capacity: venueForm.type === 'restaurant' ? 4 : (defType === 'meeting_room' ? 8 : (defType === 'group_table' ? 6 : 1)),
                                                                        slots: ["19:00", "20:00", "21:00"]
                                                                    }]
                                                                });
                                                            }
                                                        }}
                                                        className={`layout-cell ${asset ? 'filled' : ''} type-${asset?.type}`}
                                                        style={{
                                                            aspectRatio: '1',
                                                            borderRadius: '4px',
                                                            background: asset ? (asset.type === 'table' ? '#4B184C' : asset.type === 'meeting_room' ? '#10b981' : asset.type === 'group_table' ? '#3b82f6' : '#6366f1') : '#222',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.6rem',
                                                            cursor: 'pointer',
                                                            border: asset ? 'none' : '1px dashed #444'
                                                        }}
                                                    >
                                                        {asset ? (asset.type === 'table' ? 'T' : asset.type === 'single_chair' ? 'C' : asset.type === 'meeting_room' ? 'R' : 'G') : ''}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '10px' }}>
                                            Blue: Single Chair | Green: Meeting Room | Indigo: Group | Purple: Table
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input placeholder="Event Title" defaultValue={eventForm.title} className="admin-input" onChange={e => setEventForm({ ...eventForm, title: e.target.value })} required />
                                    <input placeholder="Price" type="number" defaultValue={eventForm.price} className="admin-input" onChange={e => setEventForm({ ...eventForm, price: Number(e.target.value) })} required />
                                    <input placeholder="Image URL" defaultValue={eventForm.image} className="admin-input" onChange={e => setEventForm({ ...eventForm, image: e.target.value })} required />
                                </>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update' : 'Save'}</button>
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .nav-btn { width: 100%; text-align: left; padding: 12px; border-radius: 10px; background: transparent; border: none; color: white; cursor: pointer; transition: 0.3s; }
                .nav-btn.active { background: var(--primary); }
                .nav-btn:hover:not(.active) { background: var(--bg-glass); }
                .layout-cell { transition: all 0.2s ease; font-weight: bold; position: relative; }
                .layout-cell:hover { transform: scale(1.1); z-index: 10; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 3000; backdrop-filter: blur(5px); }
                .admin-input { width: 100%; padding: 12px; border-radius: 10px; background: #1f1f23; border: 1px solid var(--border-glass); color: white; outline: none; }
            `}</style>
        </div>
    );
}
