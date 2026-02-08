import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DebugAuthPage() {
    let dbStatus = 'Unknown';
    let dbError = null;

    try {
        const mongoose = await dbConnect();
        dbStatus = `Connected (${mongoose.connection.readyState})`;
    } catch (e) {
        dbStatus = 'Connection Failed';
        dbError = e.message;
    }

    const envVars = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'PRESENT' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'PRESENT' : 'MISSING',
        FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID ? 'PRESENT' : 'MISSING',
        MONGODB_URI: process.env.MONGODB_URI ? 'PRESENT' : 'MISSING',
    };

    return (
        <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
            <h1>Auth Debugger</h1>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>Environment Variables</h2>
                <pre>{JSON.stringify(envVars, null, 2)}</pre>
            </div>

            <div style={{ background: dbStatus.includes('Connected') ? '#dcfce7' : '#fee2e2', padding: '20px', borderRadius: '8px' }}>
                <h2>Database Status</h2>
                <p><strong>Status:</strong> {dbStatus}</p>
                {dbError && <p style={{ color: 'red' }}><strong>Error:</strong> {dbError}</p>}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <h3>Diagnosis Guide</h3>
                <ul>
                    <li><strong>NEXTAUTH_URL:</strong> Must be exactly <code>https://www.trills.in</code> (or matched to your browser URL)</li>
                    <li><strong>Secrets:</strong> Must all be PRESENT</li>
                    <li><strong>Database:</strong> Must be Connected</li>
                </ul>
                <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>
                    ⚠️ WARNING: Delete this page (app/debug-auth) after debugging!
                </p>
            </div>
        </div>
    );
}
