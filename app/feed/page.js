'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { activityFeed, mockConnections, venues, events } from '@/lib/data';
import { Heart, MessageSquare, Share2, Image as ImageIcon, Link as LinkIcon, Send, MoreHorizontal, X, Shield, EyeOff, UserX, CheckCircle, UserPlus, MapPin, Calendar, ArrowRight, Star } from 'lucide-react';

export default function FeedPage() {
    const [posts, setPosts] = useState(() => {
        return activityFeed.map(post => ({
            ...post,
            liked: false,
            comments: typeof post.comments === 'number' ? [] : (Array.isArray(post.comments) ? post.comments : [])
        }));
    });
    const [newPost, setNewPost] = useState('');
    const [user, setUser] = useState(null);
    const [commentingOn, setCommentingOn] = useState(null);
    const [shareToast, setShareToast] = useState(false);
    const [attachedImage, setAttachedImage] = useState('');
    const [attachedLink, setAttachedLink] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [hiddenPostIds, setHiddenPostIds] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    useEffect(() => {
        const checkUser = () => {
            // Wait for session to be determined
            if (sessionStatus === 'loading') return;

            // Ensure we're on the client side
            if (typeof window === 'undefined') return;

            const stored = localStorage.getItem('user_profile');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Normalize avatar field
                if (parsed.image && !parsed.avatar) parsed.avatar = parsed.image;
                setUser(parsed);
            } else if (session) {
                // Navbar will handle populating localStorage, we just wait
                return;
            } else {
                setUser(null);
                router.push('/');
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        window.addEventListener('userLogin', checkUser);

        const storedBlocked = localStorage.getItem('blocked_users');
        if (storedBlocked) setBlockedUsers(JSON.parse(storedBlocked));

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('userLogin', checkUser);
        };
    }, [router, session, sessionStatus]);

    const handlePost = (e) => {
        if (e) e.preventDefault();
        if (!newPost.trim() && !attachedImage) return;

        const post = {
            id: Date.now().toString(),
            user: {
                name: user?.name || 'You',
                avatar: user?.avatar || user?.image || 'https://i.pravatar.cc/150?u=me',
                verified: user?.verified || false
            },
            content: newPost,
            image: attachedImage,
            link: attachedLink,
            likes: 0,
            liked: false,
            comments: [],
            timestamp: 'Just now'
        };

        setPosts([post, ...posts]);
        setNewPost('');
        setAttachedImage('');
        setAttachedLink('');
        setShowLinkInput(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePost();
        }
    };

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.liked ? post.likes - 1 : post.likes + 1
                };
            }
            return post;
        }));
    };

    const handleComment = (postId, commentText) => {
        if (!commentText.trim()) return;
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...(Array.isArray(post.comments) ? post.comments : []), {
                        id: Date.now(),
                        user: user?.name.split(' ')[0] || 'User',
                        avatar: user?.avatar || user?.image || 'https://i.pravatar.cc/150?u=me',
                        text: commentText
                    }]
                };
            }
            return post;
        }));
        setCommentingOn(null);
    };

    const handleShare = async (post) => {
        const shareData = {
            title: 'Checkout this post on Trills',
            text: post.content,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(`${shareData.text}\n\nRead more on Trills: ${shareData.url}`);
            setShareToast(true);
            setTimeout(() => setShareToast(false), 3000);
        }
    };

    const handleDelete = (postId) => {
        if (confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(post => post.id !== postId));
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
        setActiveMenuId(null);
    };

    const handleUpdate = (postId) => {
        if (!editContent.trim()) return;
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return { ...post, content: editContent };
            }
            return post;
        }));
        setEditingPostId(null);
        setEditContent('');
    };

    const handleHide = (postId) => {
        setHiddenPostIds([...hiddenPostIds, postId]);
        setActiveMenuId(null);
        showToast('Post hidden from your feed');
    };

    const handleReport = (post) => {
        // In a real app, this would call an API
        setHiddenPostIds([...hiddenPostIds, post.id]);
        setActiveMenuId(null);
        showToast('Thank you for reporting. We will review this post.');
    };

    const handleBlock = (userName) => {
        if (confirm(`Are you sure you want to block ${userName}? You will no longer see their posts.`)) {
            const newBlocked = [...blockedUsers, userName];
            setBlockedUsers(newBlocked);
            localStorage.setItem('blocked_users', JSON.stringify(newBlocked));
            setActiveMenuId(null);
            showToast(`${userName} has been blocked`);
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const visiblePosts = posts.filter(post =>
        !hiddenPostIds.includes(post.id) &&
        !blockedUsers.includes(post.user.name)
    );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '120px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, maxWidth: '700px' }}>
                <h1 className="title-font" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Community Feed</h1>

                {/* Create Post */}
                <div className="glass-card" style={{ marginBottom: '40px' }}>
                    <form onSubmit={handlePost}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                            <img
                                src={user?.avatar || user?.image || "https://i.pravatar.cc/150?u=me"}
                                alt="Me"
                                style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid var(--border-glass)', objectFit: 'cover' }}
                            />
                            <textarea
                                placeholder="What's happening? Share your latest booking or experience!"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    fontSize: '1.1rem',
                                    fontFamily: 'Inter, sans-serif',
                                    resize: 'none',
                                    outline: 'none',
                                    minHeight: '80px'
                                }}
                            />
                        </div>

                        {(attachedImage || attachedLink) && (
                            <div style={{ padding: '10px 0', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {attachedImage && (
                                    <div style={{ position: 'relative', width: 'fit-content' }}>
                                        <img src={attachedImage} alt="Attachment" style={{ maxWidth: '100px', borderRadius: '8px' }} />
                                        <button onClick={() => setAttachedImage('')} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                {attachedLink && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-glass)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--primary)' }}>🔗 {attachedLink}</span>
                                        <button onClick={() => setAttachedLink('')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <label style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <ImageIcon size={20} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setAttachedImage(ev.target.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowLinkInput(!showLinkInput)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <LinkIcon size={20} />
                                </button>
                            </div>

                            <button type="submit" className="btn-primary" style={{ padding: '8px 25px', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={!newPost.trim() && !attachedImage}>
                                <Send size={16} /> Post
                            </button>
                        </div>

                        {showLinkInput && (
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <input
                                    type="url"
                                    placeholder="Paste a link..."
                                    value={attachedLink}
                                    onChange={(e) => setAttachedLink(e.target.value)}
                                    style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-main)' }}
                                />
                                <button type="button" onClick={() => setShowLinkInput(false)} className="btn-outline" style={{ padding: '8px 15px' }}>Add</button>
                            </div>
                        )}
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {visiblePosts.map(post => (
                        <div key={post.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <img
                                        src={(post.user.name === user?.name || post.user.name === 'You') ? (user?.avatar || user?.image || post.user.avatar) : post.user.avatar}
                                        alt={post.user.name}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h4 className="title-font" style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {post.user.name}
                                            {post.user.verified && <CheckCircle size={14} fill="#4B184C" color="white" />}
                                        </h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{post.timestamp}</p>
                                    </div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>

                                    {activeMenuId === post.id && (
                                        <div className="glass shadow-lg" style={{
                                            position: 'absolute',
                                            right: '0',
                                            top: '30px',
                                            width: '160px',
                                            zIndex: 10,
                                            padding: '8px',
                                            background: 'var(--bg-dark)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '12px'
                                        }}>
                                            {user?.name === post.user.name || post.user.name === 'You' ? (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(post)}
                                                        style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(75, 24, 76, 0.05)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                    >
                                                        Edit Post
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: 'var(--accent)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleHide(post.id)}
                                                        style={{ width: '100%', padding: '10px 8px', background: 'none', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(75, 24, 76, 0.05)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                    >
                                                        <EyeOff size={16} /> Hide Post
                                                    </button>
                                                    <button
                                                        onClick={() => handleReport(post)}
                                                        style={{ width: '100%', padding: '10px 8px', background: 'none', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(75, 24, 76, 0.05)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                    >
                                                        <Shield size={16} /> Report Post
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlock(post.user.name)}
                                                        style={{ width: '100%', padding: '10px 8px', background: 'none', border: 'none', color: 'var(--accent)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                    >
                                                        <UserX size={16} /> Block {post.user.name.split(' ')[0]}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editingPostId === post.id ? (
                                <div style={{ marginBottom: '15px' }}>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(75, 24, 76, 0.02)',
                                            border: '1px solid var(--primary)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            color: 'var(--text-main)',
                                            fontSize: '1rem',
                                            resize: 'none',
                                            minHeight: '100px',
                                            outline: 'none',
                                            marginBottom: '10px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setEditingPostId(null)} className="btn-outline" style={{ padding: '6px 15px', fontSize: '0.85rem' }}>Cancel</button>
                                        <button onClick={() => handleUpdate(post.id)} className="btn-primary" style={{ padding: '6px 20px', fontSize: '0.85rem' }}>Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: '1rem', fontFamily: 'Inter, sans-serif', marginBottom: '15px', lineHeight: '1.6' }}>{post.content}</p>
                            )}

                            {post.image && (
                                <div style={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    marginBottom: '15px',
                                    border: '1px solid var(--border-glass)'
                                }}>
                                    <img src={post.image} alt="Post content" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                            {post.link && (
                                <a
                                    href={post.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'block',
                                        background: 'var(--bg-glass)',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        marginBottom: '15px',
                                        border: '1px solid var(--border-glass)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <span style={{ marginRight: '8px' }}>🔗</span> {post.link}
                                </a>
                            )}

                            <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
                                <button
                                    onClick={() => handleLike(post.id)}
                                    style={{ background: 'none', border: 'none', color: post.liked ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} /> {post.likes}
                                </button>
                                <button
                                    onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                                    style={{ background: 'none', border: 'none', color: commentingOn === post.id ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    <MessageSquare size={18} fill={commentingOn === post.id ? 'rgba(75, 24, 76, 0.1)' : 'none'} /> {Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)}
                                </button>
                                <button
                                    onClick={() => handleShare(post)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <Share2 size={18} /> Share
                                </button>
                            </div>

                            {commentingOn === post.id && (
                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            className="comment-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleComment(post.id, e.target.value);
                                            }}
                                            style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                    {Array.isArray(post.comments) && post.comments.map(comment => (
                                        <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
                                            <img src={comment.avatar || `https://i.pravatar.cc/150?u=${comment.user}`} alt={comment.user} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <div style={{ background: 'rgba(75, 24, 76, 0.03)', padding: '8px 12px', borderRadius: '10px', flex: 1 }}>
                                                <span style={{ fontWeight: '600', marginRight: '8px', color: 'var(--primary)', fontSize: '0.85rem' }}>{comment.user}</span>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, display: 'inline' }}>{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar - Recommendations & Promotions */}
            <aside style={{ width: '320px', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Profile Recommendations */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 className="title-font" style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={18} color="var(--primary)" /> Recommended
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {mockConnections.filter(c => c.name !== user?.name).slice(0, 3).map(rec => {
                            const isSent = (user?.pending_connections || []).includes(rec.email || `${rec.name.toLowerCase().replace(' ', '.')}@trills.com`);

                            return (
                                <div key={rec.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <img src={rec.avatar} alt={rec.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {rec.name}
                                            {rec.verified && <CheckCircle size={12} fill="#4B184C" color="white" />}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.designation}</div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (isSent) return;
                                            const email = rec.email || `${rec.name.toLowerCase().replace(' ', '.')}@trills.com`;
                                            try {
                                                await fetch('/api/connections', {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        requesterEmail: user?.email || 'sreenivas@trills.com',
                                                        recipientEmail: email
                                                    })
                                                });
                                                // Sync local
                                                const updated = { ...user, pending_connections: [...(user?.pending_connections || []), email] };
                                                localStorage.setItem('user_profile', JSON.stringify(updated));
                                                setUser(updated);
                                                showToast(`Connection request sent to ${rec.name}!`);
                                            } catch (e) {
                                                showToast('Demo Mode: Connection sent!');
                                            }
                                        }}
                                        style={{
                                            background: isSent ? 'rgba(75, 24, 76, 0.05)' : 'none',
                                            border: '1px solid var(--border-glass)',
                                            padding: '5px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            cursor: isSent ? 'default' : 'pointer',
                                            color: 'var(--primary)',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {isSent ? 'Sent' : 'Connect'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Promoted Venues */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px 10px' }}>
                        <h3 className="title-font" style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={18} color="#fbbf24" fill="#fbbf24" /> Sponsored
                        </h3>
                    </div>
                    {venues.slice(0, 1).map(venue => (
                        <div key={venue.id}>
                            <div style={{ height: '140px', background: `url(${venue.image}) center/cover` }}></div>
                            <div style={{ padding: '15px 24px' }}>
                                <h4 style={{ margin: '0 0 5px', fontSize: '1rem' }}>{venue.name}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>{venue.category} • {venue.address.split(',').pop()}</p>
                                <a href={`/explore`} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}>Full Experience</a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Events */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 className="title-font" style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} color="var(--accent)" /> Trending Events
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {events.slice(0, 2).map(event => (
                            <div key={event.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `url(${event.image}) center/cover` }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '2px' }}>{event.title}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {event.time}</div>
                                </div>
                                <ArrowRight size={14} color="var(--text-muted)" />
                            </div>
                        ))}
                    </div>
                    <a href="/events" style={{ display: 'block', marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>View All Events →</a>
                </div>
            </aside>
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 5000,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
