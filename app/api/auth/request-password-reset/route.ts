import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPasswordResetToken, sendPasswordResetEmail, logAuditEvent } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, resetType } = await request.json();

    if (!email || !resetType) {
      return NextResponse.json(
        { error: 'Email and reset type required' },
        { status: 400 }
      );
    }

    const validTypes = ['email_verification', 'otp'];
    if (!validTypes.includes(resetType)) {
      return NextResponse.json(
        { error: 'Invalid reset type' },
        { status: 400 }
      );
    }

    // Find user
    const results = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(results) || results.length === 0) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent',
      });
    }

    const userId = (results[0] as any).id;

    // Create reset token
    const { token, otp } = await createPasswordResetToken(userId, resetType);

    // Send email
    try {
      await sendPasswordResetEmail(email, token, resetType, otp);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request if email fails, but log it
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    await logAuditEvent(
      userId,
      'PASSWORD_RESET_REQUESTED',
      'users',
      userId,
      { resetType },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link will be sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
