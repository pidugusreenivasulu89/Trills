'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockConnections, checkInviteEligibility, designationOptions, locationOptions } from '@/lib/data';
import { User, Mail, MapPin, Briefcase, Camera, Edit2, Users, CheckCircle, ShieldAlert, Send, ArrowRight, ShieldCheck, Loader2, Sparkles, AlertCircle, Calendar, Settings, Shield } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStep, setVerificationStep] = useState(0); // 0: start, 1: scanning, 2: success
    const [activeTab, setActiveTab] = useState('about');
    const [editData, setEditData] = useState({});
    const [toast, setToast] = useState('');
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();

    const [connectionCount, setConnectionCount] = useState(mockConnections.length);

    useEffect(() => {
        const checkUser = async () => {
            const stored = localStorage.getItem('user_profile');
            if (stored) {
                const userData = JSON.parse(stored);
                setUser(userData);
                setEditData(userData);

                // Fetch real connection count
                try {
                    const email = userData.email || 'sreenivas@trills.com';
                    const res = await fetch(`/api/connections?email=${email}`);
                    const data = await res.json();
                    let count = data.count || 0;

                    // Add local pending if any
                    if (userData.pending_connections) {
                        count += userData.pending_connections.length;
                    }
                    setConnectionCount(count);
                } catch (e) {
                    console.error('Failed to fetch connection count');
                }

                // Trigger verification if requested via URL
                if (searchParams.get('verify') === 'true' && !userData.verified) {
                    setIsVerifying(true);
                }
            }
            setIsLoading(false);
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        window.addEventListener('userLogin', checkUser);

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('userLogin', checkUser);
        };
    }, []);

    const handleSave = () => {
        try {
            localStorage.setItem('user_profile', JSON.stringify(editData));
            window.dispatchEvent(new Event('userLogin'));
            setUser({ ...editData });
            setIsEditing(false);
            showToast('Profile updated successfully! ✨');
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                showToast('Storage full! Please use a smaller profile picture. ⚠️');
            } else {
                showToast('An error occurred while saving. ❌');
            }
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleInvite = (connection) => {
        if (checkInviteEligibility(connection.name)) {
            showToast(`Invitation sent to ${connection.name.split(' ')[0]}! 🚀`);
        } else {
            showToast(`You must be a mutual connection to invite ${connection.name.split(' ')[0]}.`);
        }
    };

    const handlePicEdit = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                showToast('Image is too large! Please select a file under 1MB. ⚠️');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setEditData(prev => ({ ...prev, avatar: ev.target.result }));
                showToast('Image uploaded! Save profile to keep changes.');
            };
            reader.readAsDataURL(file);
            // Clear the value so the same file can be selected again
            e.target.value = '';
        }
    };

    const handleBannerEdit = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1.5 * 1024 * 1024) {
                showToast('Banner is too large! Please use a file under 1.5MB. ⚠️');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setEditData(prev => ({ ...prev, banner: ev.target.result }));
                showToast('Banner uploaded! Save profile to keep changes.');
            };
            reader.readAsDataURL(file);
            // Clear the value so the same file can be selected again
            e.target.value = '';
        }
    };

    const startVerification = async () => {
        setIsVerifying(true);
        setVerificationStep(1);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;

            // Wait for re-render so videoRef.current is available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera access denied", err);
            showToast("Camera access denied. Please allow camera for verification.");
            setIsVerifying(false);
            return;
        }

        // Simulate scanning process
        setTimeout(async () => {
            // Capture a frame from video
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            const faceData = canvas.toDataURL('image/jpeg', 0.5);

            // Stop camera stream after scan
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            // Try to get location, but proceed even if it fails
            const sendVerification = async (locationData = null) => {
                try {
                    const res = await fetch('/api/verify-face', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            faceImage: faceData,
                            location: locationData,
                            email: user?.email || 'sreenivas@trills.com',
                            name: user?.name
                        })
                    });

                    if (res.ok) {
                        setVerificationStep(2);
                        setTimeout(() => {
                            const updatedUser = { ...user, verified: true };
                            localStorage.setItem('user_profile', JSON.stringify(updatedUser));
                            window.dispatchEvent(new Event('userLogin'));
                            setUser(updatedUser);
                            setIsVerifying(false);
                            setVerificationStep(0);
                            showToast(locationData ? 'Verification successful with identity and location! ✅' : 'Verification successful! (Location skipped) ✅');
                        }, 2500);
                    } else {
                        const err = await res.json();
                        showToast(err.error || 'Verification failed. Please try again. ❌');
                        setIsVerifying(false);
                    }
                } catch (error) {
                    console.error("Verification network error", error);
                    showToast("Network error. Is the server running? ❌");
                    setIsVerifying(false);
                }
            };

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const locationData = {
                            coords: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            }
                        };
                        sendVerification(locationData);
                    },
                    (err) => {
                        console.warn("Location skipped:", err.message);
                        sendVerification(null); // Proceed without location
                    },
                    { timeout: 5000 }
                );
            } else {
                sendVerification(null);
            }
        }, 5000); // 5 seconds scan
    };

    const cancelVerification = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsVerifying(false);
        setVerificationStep(0);
    };

    if (isLoading) return <div className="container" style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>Loading...</div>;

    if (!user) return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
            <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto', padding: '40px' }}>
                <ShieldAlert size={48} color="var(--accent)" style={{ marginBottom: '20px' }} />
                <h2 className="title-font" style={{ marginBottom: '10px' }}>Access Restricted</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Please sign in to view and manage your profile.</p>
                <a href="/login" className="btn-primary" style={{ width: '100%' }}>Sign In</a>
            </div>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '40px', maxWidth: '900px' }}>
            {/* Header / Banner area */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '30px', position: 'relative' }}>
                <div style={{
                    height: '220px',
                    background: (isEditing ? editData.banner : user.banner) ? `url(${isEditing ? editData.banner : user.banner}) center/cover` : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    position: 'relative',
                    transition: '0.3s'
                }}>
                    {isEditing && (
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Camera size={16} /> Change Cover
                        </button>
                    )}
                    <input type="file" ref={bannerInputRef} onChange={handleBannerEdit} accept="image/*" style={{ display: 'none' }} />

                    <button
                        onClick={() => {
                            if (!isEditing) setEditData({ ...user });
                            setIsEditing(!isEditing);
                        }}
                        style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s', zIndex: 5 }}
                    >
                        <Edit2 size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                </div>

                <div style={{ padding: '0 40px 40px', marginTop: '-50px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={(isEditing ? editData.avatar : user.avatar) || 'https://i.pravatar.cc/150?u=me'}
                                alt={user.name}
                                style={{ width: '130px', height: '130px', borderRadius: '50%', border: '6px solid var(--bg-dark)', objectFit: 'cover', background: 'var(--bg-dark)' }}
                            />
                            {isEditing && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--primary)', padding: '8px', borderRadius: '50%', border: '2px solid var(--bg-dark)', cursor: 'pointer', zIndex: 1 }}
                                >
                                    <Camera size={14} color="white" />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePicEdit}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div style={{ flex: 1, marginBottom: '10px' }}>
                            <h1 className="title-font" style={{ fontSize: '2.2rem', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {user.name}
                                {user.verified && <CheckCircle size={28} fill="#4B184C" color="white" />}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={18} /> {user.designation}
                                {user.verified && <span style={{ fontSize: '0.8rem', background: 'rgba(75, 24, 76, 0.1)', color: '#4B184C', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', marginLeft: '5px' }}>Verified Professional</span>}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ textAlign: 'center', background: 'rgba(75, 24, 76, 0.05)', padding: '10px 20px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{connectionCount}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Connections</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Banner */}
            {!user.verified && !isEditing && (
                <div className="glass-card animate-slide-up" style={{ background: 'linear-gradient(90deg, #4B184C 0%, #7c2d12 100%)', border: 'none', color: 'white', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '15px' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="title-font" style={{ fontSize: '1.4rem' }}>Boost Your Credibility</h3>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Verified profiles get 3x more connection requests and exclusive event access.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVerifying(true)}
                        className="btn-primary"
                        style={{ background: 'white', color: 'var(--primary)', padding: '12px 30px' }}
                    >
                        Verify My Identity
                    </button>
                </div>
            )}

            {/* Profile Content */}
            {isEditing ? (
                <div className="glass-card animate-slide-up">
                    <h2 className="title-font" style={{ marginBottom: '24px' }}>Edit Profile Section</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(75, 24, 76, 0.02)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Designation</label>
                            <select
                                value={editData.designation}
                                onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(75, 24, 76, 0.02)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none' }}
                            >
                                <option value="" disabled>Select your role</option>
                                {designationOptions.map(opt => (
                                    <option key={opt} value={opt} style={{ background: 'var(--bg-dark)' }}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--primary)', zIndex: 1 }} />
                                <select
                                    value={editData.location}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(75, 24, 76, 0.02)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option value="" disabled>Select your city</option>
                                    {locationOptions.map(opt => (
                                        <option key={opt} value={opt} style={{ background: 'var(--bg-dark)' }}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Professional Bio</label>
                            <textarea
                                value={editData.bio}
                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(75, 24, 76, 0.02)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', minHeight: '100px', resize: 'vertical' }}
                                placeholder="Write something about your professional journey..."
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Avatar URL</label>
                            <input
                                type="text"
                                value={editData.avatar?.startsWith('data:') ? 'Image uploaded (Data URL)' : (editData.avatar || '')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== 'Image uploaded (Data URL)') {
                                        setEditData(prev => ({ ...prev, avatar: val }));
                                    }
                                }}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(75, 24, 76, 0.02)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
                                placeholder="Paste image URL or use camera icon above"
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                💡 Tip: Keep images under 1MB to ensure smooth profile saving.
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        <button onClick={handleSave} className="btn-primary" style={{ padding: '12px 40px' }}>Save Profile</button>
                        <button onClick={() => setIsEditing(false)} className="btn-outline" style={{ padding: '12px 40px' }}>Discard Changes</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                    <div className="glass-card" style={{ height: 'fit-content' }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => setActiveTab('about')}
                                style={{ background: activeTab === 'about' ? 'rgba(75, 24, 76, 0.1)' : 'transparent', border: 'none', color: activeTab === 'about' ? 'var(--primary)' : 'var(--text-muted)', padding: '12px 15px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}
                            >
                                <User size={18} /> About Me
                            </button>
                            <button
                                onClick={() => setActiveTab('connections')}
                                style={{ background: activeTab === 'connections' ? 'rgba(75, 24, 76, 0.1)' : 'transparent', border: 'none', color: activeTab === 'connections' ? 'var(--primary)' : 'var(--text-muted)', padding: '12px 15px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}
                            >
                                <Users size={18} /> Connections
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                style={{ background: activeTab === 'bookings' ? 'rgba(75, 24, 76, 0.1)' : 'transparent', border: 'none', color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)', padding: '12px 15px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}
                            >
                                <Calendar size={18} /> My Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                style={{ background: activeTab === 'settings' ? 'rgba(75, 24, 76, 0.1)' : 'transparent', border: 'none', color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)', padding: '12px 15px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}
                            >
                                <Settings size={18} /> Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('privacy')}
                                style={{ background: activeTab === 'privacy' ? 'rgba(75, 24, 76, 0.1)' : 'transparent', border: 'none', color: activeTab === 'privacy' ? 'var(--primary)' : 'var(--text-muted)', padding: '12px 15px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}
                            >
                                <Shield size={18} /> Privacy
                            </button>
                        </nav>
                    </div>

                    <div className="animate-fade-in">
                        {activeTab === 'about' && (
                            <div className="glass-card">
                                <h3 className="title-font" style={{ marginBottom: '20px' }}>Professional Info</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <MapPin color="var(--primary)" size={20} />
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Based in</div>
                                            <div style={{ fontWeight: '500' }}>
                                                {user.location && !isNaN(user.location.charAt(0)) ? 'Assigned Region' : (user.location || 'Not specified')}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Mail color="var(--primary)" size={20} />
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                                            <div style={{ fontWeight: '500' }}>{user.name.toLowerCase().replace(' ', '.')}@trills.com</div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="title-font" style={{ margin: '30px 0 15px' }}>Professional Bio</h3>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-main)', opacity: 0.85 }}>
                                    {user.bio || "No professional bio provided yet. Edit your profile to add one!"}
                                </p>
                                <h3 className="title-font" style={{ margin: '30px 0 15px' }}>Interests</h3>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {user.interests?.map(interest => (
                                        <span key={interest} className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                                            {interest}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h3 className="title-font" style={{ margin: 0 }}>Top Connections</h3>
                                        <button onClick={() => setActiveTab('connections')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>View All</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {mockConnections.slice(0, 4).map(conn => (
                                            <div key={conn.id} style={{ textAlign: 'center' }}>
                                                <img src={conn.avatar} alt={conn.name} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--bg-glass)', marginBottom: '5px' }} />
                                                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conn.name.split(' ')[0]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {mockConnections.map(conn => (
                                    <div key={conn.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <img src={conn.avatar} alt={conn.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                            <div>
                                                <h4 className="title-font" style={{ margin: '0 0 4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {conn.name}
                                                    {conn.verified && <CheckCircle size={14} fill="#4B184C" color="white" />}
                                                </h4>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{conn.designation}</p>
                                                {conn.mutual && (
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                        <CheckCircle size={10} /> Mutual Connection
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleInvite(conn)}
                                            className={conn.mutual ? "btn-primary" : "btn-outline"}
                                            style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            {conn.mutual ? <><Send size={14} /> Invite to Meet</> : <><ShieldAlert size={14} /> Request Access</>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="glass-card">
                                <h3 className="title-font" style={{ marginBottom: '20px' }}>Your Bookings</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ padding: '20px', background: 'rgba(75, 24, 76, 0.05)', borderRadius: '15px', border: '1px solid var(--primary-glow)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>#TRL-8392</span>
                                            <span className="badge badge-success">Confirmed</span>
                                        </div>
                                        <h4 style={{ margin: '0 0 5px' }}>Luminary Dining</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Feb 14, 2026 • 20:00 • 2 Guests</p>
                                        <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '8px 15px' }}>Download Ticket</button>
                                    </div>
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>No other upcoming bookings.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="glass-card">
                                <h3 className="title-font" style={{ marginBottom: '25px' }}>Account Settings</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ padding: '15px', background: 'rgba(75, 24, 76, 0.05)', borderRadius: '12px', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>Profile Information</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update your name, bio, and professional details.</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditData({ ...user });
                                                    setIsEditing(true);
                                                }}
                                                className="btn-primary"
                                                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Email Notifications</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive booking updates and news</div>
                                        </div>
                                        <div style={{ width: '40px', height: '20px', background: 'var(--primary)', borderRadius: '10px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Public Profile</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Make your activity feed visible to all</div>
                                        </div>
                                        <div style={{ width: '40px', height: '20px', background: 'var(--border-glass)', borderRadius: '10px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '2px', top: '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%' }}></div>
                                        </div>
                                    </div>
                                    <button className="btn-outline" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: '20px' }}>Delete Account</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="glass-card">
                                <h3 className="title-font" style={{ marginBottom: '20px' }}>Privacy Policy</h3>
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)', opacity: 0.8 }}>
                                    <p style={{ marginBottom: '15px' }}>We collect information you provide directly to us (name, designation, interests) and automatic location data if permitted, to enhance your personalized booking experience.</p>
                                    <p style={{ marginBottom: '15px' }}>Your data is used to suggest relevant restaurants and coworking spaces, manage your bookings, and build your social identity on the Trills community feed.</p>
                                    <p>We do not sell your personal data to third-party advertisers. We share necessary booking details with the partner venues you select.</p>
                                    <a href="/privacy" style={{ display: 'inline-block', marginTop: '20px', color: 'var(--primary)', fontWeight: '600' }}>Read Full Policy →</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {isVerifying && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zHeight: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100000 }}>
                    <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', background: 'var(--bg-dark)', border: '1px solid var(--primary)' }}>
                        {verificationStep === 0 ? (
                            <div className="animate-fade-in">
                                <div style={{ width: '80px', height: '80px', background: 'rgba(75, 24, 76, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <ShieldCheck size={40} color="var(--primary)" />
                                </div>
                                <h2 className="title-font" style={{ marginBottom: '16px' }}>Identity Verification</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>To maintain community trust, we use AI to verify that your profile picture matches your real identity. This takes less than 30 seconds.</p>
                                <div style={{ background: 'rgba(75, 24, 76, 0.05)', padding: '20px', borderRadius: '16px', textAlign: 'left', marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <CheckCircle size={18} color="var(--primary)" />
                                        <span style={{ fontSize: '0.9rem' }}>Ensures you are a real person</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <CheckCircle size={18} color="var(--primary)" />
                                        <span style={{ fontSize: '0.9rem' }}>Unlocks the "Verified" badge</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <CheckCircle size={18} color="var(--primary)" />
                                        <span style={{ fontSize: '0.9rem' }}>Highly recommended for meeting invites</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={startVerification} className="btn-primary" style={{ flex: 1 }}>Start AI Scan</button>
                                    <button onClick={cancelVerification} className="btn-outline" style={{ flex: 1 }}>Maybe Later</button>
                                </div>
                            </div>
                        ) : verificationStep === 1 ? (
                            <div className="animate-fade-in">
                                <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 40px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--primary)', background: '#000' }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)', animation: 'scan 2.5s ease-in-out infinite' }}></div>
                                    <style>{`
                                        @keyframes scan {
                                            0% { top: 0; }
                                            50% { top: 100%; }
                                            100% { top: 0; }
                                        }
                                    `}</style>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <Loader2 className="animate-spin" size={20} color="var(--primary)" />
                                    <span style={{ fontWeight: '600' }}>Analyzing facial features...</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--primary)', width: '60%', transition: '1s width linear', animation: 'progress 3s forwards' }}></div>
                                    <style>{`
                                        @keyframes progress {
                                            0% { width: 0; }
                                            100% { width: 100%; }
                                        }
                                    `}</style>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <Sparkles size={40} color="#166534" />
                                </div>
                                <h2 className="title-font" style={{ color: '#166534', marginBottom: '16px' }}>Verification Successful!</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Our AI has confirmed your identity. Your profile is now verified and your badge is being activated.</p>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 'bold' }}>
                                    <CheckCircle size={20} /> Identity Confirmed
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '12px 30px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 10000,
                    fontWeight: '600',
                    animation: 'fadeIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
