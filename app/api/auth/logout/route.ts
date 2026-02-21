import { NextRequest, NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/session';
import { logAuditEvent } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (session) {
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';
      
      await logAuditEvent(
        session.userId,
        'USER_LOGOUT',
        'users',
        session.userId,
        {},
        ipAddress,
        userAgent
      );
    }

    await destroySession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
