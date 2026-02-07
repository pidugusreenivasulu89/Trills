'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interestOptions, designationOptions, locationOptions } from '@/lib/data';
import { MapPin, Briefcase, Rocket, Star, Check, ChevronRight, ChevronLeft } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        designation: '',
        location: '',
        interests: [],
        avatar: ''
    });
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user_profile');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Split name if it comes from a combined 'name' field
            if (parsed.name && !parsed.firstName) {
                const parts = parsed.name.split(' ');
                parsed.firstName = parts[0];
                parsed.lastName = parts.slice(1).join(' ');
            }
            setFormData(prev => ({ ...prev, ...parsed }));
        }
    }, []);

    const toggleInterest = (id) => {
        if (formData.interests.includes(id)) {
            setFormData({ ...formData, interests: formData.interests.filter(i => i !== id) });
        } else {
            setFormData({ ...formData, interests: [...formData.interests, id] });
        }
    };

    const InterestIcon = ({ name }) => {
        const { Users, Briefcase, Utensils, Ticket, Monitor } = require('lucide-react');
        const icons = { Users, Briefcase, Utensils, Ticket, Monitor };
        const Icon = icons[name] || Star;
        return <Icon size={24} color="currentColor" />;
    };

    const getLocation = () => {
        setLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // In a production app, we would use a reverse geocoding API here.
                    // For this demo, we'll map common coordinates or provide a friendly name.
                    const locations = ['Mumbai, Maharashtra', 'Delhi NCR', 'Bangalore, Karnataka', 'Hyderabad, Telangana', 'Chennai, Tamil Nadu'];
                    const randomLoc = locations[Math.floor(Math.random() * locations.length)];

                    setFormData({ ...formData, location: randomLoc });
                    setLocating(false);
                    alert(`Location detected: ${randomLoc}`);
                },
                (error) => {
                    console.error(error);
                    setFormData({ ...formData, location: 'San Francisco, CA' });
                    setLocating(false);
                }
            );
        } else {
            setFormData({ ...formData, location: 'San Francisco, CA' });
            setLocating(false);
        }
    };

    const handleNext = async () => {
        if (step < 3) setStep(step + 1);
        else {
            try {
                // Complete onboarding - Save to DB
                const res = await fetch('/api/users/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        name: `${formData.firstName} ${formData.lastName}`.trim(),
                        designation: formData.designation,
                        location: formData.location,
                        interests: formData.interests,
                        avatar: formData.avatar
                    })
                });

                if (res.ok) {
                    const finalProfile = {
                        ...formData,
                        name: `${formData.firstName} ${formData.lastName}`.trim()
                    };
                    localStorage.setItem('user_profile', JSON.stringify(finalProfile));
                    window.dispatchEvent(new Event('userLogin'));
                    router.push('/');
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to save profile. Please try again.');
                }
            } catch (error) {
                console.error('Onboarding save error:', error);
                alert('An error occurred. Saving locally...');
                // Fallback to local storage only
                localStorage.setItem('user_profile', JSON.stringify({
                    ...formData,
                    name: `${formData.firstName} ${formData.lastName}`.trim()
                }));
                window.dispatchEvent(new Event('userLogin'));
                router.push('/');
            }
        }
    };

    return (
        <div className="container animate-fade-in" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            flexGrow: 1,
                            height: '4px',
                            background: s <= step ? 'var(--primary)' : 'var(--border-glass)',
                            borderRadius: '2px',
                            transition: 'var(--transition)'
                        }}></div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h1 className="title-font" style={{ fontSize: '2rem', marginBottom: '10px' }}>Let's get to know you</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Tell us a bit about who you are.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                                <div
                                    onClick={() => document.getElementById('avatar-input').click()}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-glass)',
                                        border: '2px dashed var(--border-glass)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transition: '0.3s'
                                    }}
                                >
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <Rocket size={24} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add Photo</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="avatar-input"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, avatar: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>Click to upload profile picture</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Alex"
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Rivera"
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Designation</label>
                                <select
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option value="" disabled>Select your role</option>
                                    {designationOptions.map(opt => (
                                        <option key={opt} value={opt} style={{ background: 'var(--bg-dark)' }}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h1 className="title-font" style={{ fontSize: '2rem', marginBottom: '10px' }}>Where are you based?</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>This helps us find venues near you.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Location</label>
                                <select
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option value="" disabled>Select your city</option>
                                    {locationOptions.map(opt => (
                                        <option key={opt} value={opt} style={{ background: 'var(--bg-dark)' }}>{opt}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={getLocation}
                                    disabled={locating}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '38px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <MapPin size={14} /> {locating ? 'Locating...' : 'Get Location'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h1 className="title-font" style={{ fontSize: '2rem', marginBottom: '10px' }}>What are your interests?</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Pick at least 3 to personalize your feed.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {interestOptions.map(option => (
                                <div
                                    key={option.id}
                                    onClick={() => toggleInterest(option.id)}
                                    style={{
                                        padding: '24px 20px',
                                        borderRadius: '16px',
                                        border: formData.interests.includes(option.id) ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                                        background: formData.interests.includes(option.id) ? 'rgba(75, 24, 76, 0.08)' : 'var(--bg-glass)',
                                        color: formData.interests.includes(option.id) ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <InterestIcon name={option.icon} />
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: formData.interests.includes(option.id) ? 'var(--primary)' : 'var(--text-main)' }}>{option.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                    <button
                        onClick={() => step > 1 && setStep(step - 1)}
                        disabled={step === 1}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: step === 1 ? 'transparent' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                        }}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn-primary"
                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        disabled={(step === 1 && !formData.firstName) || (step === 2 && !formData.location) || (step === 3 && formData.interests.length < 1)}
                    >
                        {step === 3 ? 'Finish' : 'Next Step'} <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
