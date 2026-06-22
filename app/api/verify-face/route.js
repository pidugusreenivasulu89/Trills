import { NextResponse } from 'next/server';

// Fail closed until a server-side identity provider with liveness detection is configured.
// No client-provided email, selfie, or location can grant a verification badge.
export async function POST() {
    return NextResponse.json({
        error: 'Identity verification is temporarily unavailable while secure face and liveness verification is being configured.'
    }, { status: 503 });
}
