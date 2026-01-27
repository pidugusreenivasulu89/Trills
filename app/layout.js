import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'Trills | Dine, Work, & Connect',
  description: 'The ultimate social platform for booking premium dining, co-working spaces, and exclusive events.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body>
        <Providers>
          <Navbar />

          <main style={{ minHeight: '80vh' }}>
            {children}
          </main>
          <BottomNav />

          <footer style={{ marginTop: '40px', padding: '35px 0', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div className="container">
              <img src="/logo.png" alt="Trills Logo" style={{ width: '50px', height: '50px', borderRadius: '12px', marginBottom: '12px' }} />
              <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Trills</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>From network to real places.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.85rem' }}>
                <a href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
                <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
                <a href="mailto:support@trills.in" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</a>
              </div>
              <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>&copy; 2026 Trills. All rights reserved.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
