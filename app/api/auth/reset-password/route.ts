import { NextRequest, NextResponse } from 'next/server';
import { validateResetToken, resetPassword, logAuditEvent } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, otp, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate token
    if (!token) {
      return NextResponse.json(
        { error: 'Reset token required' },
        { status: 400 }
      );
    }

    const resetRecord = await validateResetToken(token);
    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Verify OTP if token type is OTP
    if (resetRecord.token_type === 'otp' && resetRecord.otp_code !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Reset password
    const success = await resetPassword(token, newPassword);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    await logAuditEvent(
      resetRecord.user_id,
      'PASSWORD_RESET_COMPLETED',
      'users',
      resetRecord.user_id,
      {},
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
