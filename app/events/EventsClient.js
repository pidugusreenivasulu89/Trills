'use client';

import { useState } from 'react';
import { events } from '@/lib/data';
import { Calendar, Clock, Check, Ticket, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function EventsClient() {
    const [attendedEvents, setAttendedEvents] = useState([]);

    const toggleAttend = async (event) => {
        if (attendedEvents.includes(event.id)) {
            setAttendedEvents(attendedEvents.filter(id => id !== event.id));
        } else {
            setAttendedEvents([...attendedEvents, event.id]);

            // Simulate a connection notification
            try {
                await fetch('/api/notifications', {
                    method: 'POST',
                    body: JSON.stringify({
                        notification: {
                            type: 'activity',
                            content: `Your connection Marcus is also attending ${event.title}!`,
                            avatar: 'https://i.pravatar.cc/150?u=marcus'
                        }
                    })
                });
            } catch (e) {
                console.error("Failed to send notification:", e);
            }
        }
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '40px' }}>
            <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h1 className="title-font" style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Upcoming Events</h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Discover and attend the most exclusive social gatherings, workshops, and networking sessions.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {events.map(event => (
                    <div key={event.id} className="glass-card" style={{ display: 'flex', gap: '40px', padding: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '250px',
                            height: '180px',
                            borderRadius: '16px',
                            background: `url(${event.image}) center/cover`,
                            flexShrink: 0,
                            minWidth: '250px'
                        }}></div>

                        <div style={{ flexGrow: 1, minWidth: '300px' }}>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="badge badge-accent">{event.category}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Calendar size={14} /> {event.date}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Clock size={14} /> {event.time}
                                </div>
                            </div>
                            <h2 className="title-font" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{event.title}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{event.description}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>${event.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ person</span></span>
                                <button
                                    onClick={() => toggleAttend(event)}
                                    className={attendedEvents.includes(event.id) ? "btn-outline" : "btn-primary"}
                                    style={{ width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {attendedEvents.includes(event.id) ? (
                                        <><Check size={18} /> Attending</>
                                    ) : (
                                        <><Ticket size={18} /> Attend Event</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <section style={{ marginTop: '80px', padding: '60px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)', textAlign: 'center' }}>
                <h2 className="title-font" style={{ fontSize: '2rem', marginBottom: '20px' }}>Hosting an event?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Partner with Trills to reach thousands of urban professionals and food enthusiasts.</p>
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
                    <UserPlus size={18} /> Become a Partner
                </button>
            </section>
        </div>
    );
}
