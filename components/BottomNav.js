'use client';

export default function BottomNav() {
    return (
        <div className="bottom-nav glass" style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            height: '65px',
            zIndex: 2000,
            display: 'none', // Shown only via media query in globals.css
            justifyContent: 'space-around',
            alignItems: 'center',
            borderRadius: '20px',
            padding: '0 10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            <a href="/" className="nav-item">
                <span style={{ fontSize: '1.2rem' }}>🏠</span>
                <span style={{ fontSize: '0.6rem' }}>Home</span>
            </a>
            <a href="/explore" className="nav-item">
                <span style={{ fontSize: '1.2rem' }}>🔍</span>
                <span style={{ fontSize: '0.6rem' }}>Explore</span>
            </a>
            <a href="/events" className="nav-item">
                <span style={{ fontSize: '1.2rem' }}>🎟️</span>
                <span style={{ fontSize: '0.6rem' }}>Events</span>
            </a>
            <a href="/feed" className="nav-item">
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <span style={{ fontSize: '0.6rem' }}>Feed</span>
            </a>
            <a href="/profile" className="nav-item">
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <span style={{ fontSize: '0.6rem' }}>Profile</span>
            </a>

            <style jsx>{`
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: var(--text-muted);
          transition: 0.3s;
          padding: 10px;
        }
        .nav-item:hover, .nav-item:active {
          color: var(--primary);
        }
      `}</style>
        </div>
    );
}
