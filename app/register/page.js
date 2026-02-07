'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Camera, Loader2, User, Mail, Lock, AtSign } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        avatar: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    authProvider: 'email'
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Store initial profile data
                const profile = {
                    name: formData.name,
                    email: formData.email,
                    avatar: formData.avatar || 'https://i.pravatar.cc/150?u=' + formData.username,
                    designation: 'Member',
                    location: 'Earth',
                    verified: false,
                    bio: 'A passionate professional exploring the intersection of technology and lifestyle.',
                    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000'
                };
                localStorage.setItem('user_profile', JSON.stringify(profile));
                window.dispatchEvent(new Event('userLogin'));

                // Redirect to onboarding to finish profile details
                router.push('/onboarding');
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: 'radial-gradient(circle at top right, rgba(75, 24, 76, 0.15), transparent 400px), radial-gradient(circle at bottom left, rgba(124, 45, 18, 0.1), transparent 400px)'
        }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary)', borderRadius: '15px', marginBottom: '15px' }}>
                        <Rocket size={32} color="white" />
                    </div>
                    <h1 className="title-font" style={{ fontSize: '2rem', marginBottom: '8px' }}>Join Trills</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create your account to start connecting</p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                    <Camera size={24} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add Photo</span>
                                </>
                            )}
                        </div>
                        <input id="avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>A great photo helps you stand out</p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <AtSign size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Username"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary"
                        style={{ marginTop: '10px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
