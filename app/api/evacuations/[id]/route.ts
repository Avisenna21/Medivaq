import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAuditEvent } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const results = await query(
      'SELECT * FROM evacuation_requests WHERE id = ?',
      [id]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Evacuation not found' }, { status: 404 });
    }

    const evacuation = results[0] as any;

    // Check authorization
    const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);
    const userRole = (userResults[0] as any).role;

    if (userRole !== 'admin' && evacuation.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: evacuation,
    });
  } catch (error) {
    console.error('Fetch evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    // Get evacuation
    const results = await query(
      'SELECT * FROM evacuation_requests WHERE id = ?',
      [id]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Evacuation not found' }, { status: 404 });
    }

    const evacuation = results[0] as any;

    // Check authorization
    const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);
    const userRole = (userResults[0] as any).role;

    if (userRole !== 'admin' && evacuation.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Admin can change status, others can only update their own details
    const allowedFields = userRole === 'admin'
      ? ['patient_name', 'patient_age', 'patient_condition', 'location', 
         'destination', 'priority_level', 'status', 'medical_notes', 
         'contact_person', 'contact_phone']
      : ['patient_name', 'patient_age', 'patient_condition', 'location',
         'destination', 'priority_level', 'medical_notes', 
         'contact_person', 'contact_phone'];

    const updateSet = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        updateSet.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (updateSet.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    await query(
      `UPDATE evacuation_requests SET ${updateSet.join(', ')} WHERE id = ?`,
      values
    );

    await logAuditEvent(
      session.userId,
      'EVACUATION_REQUEST_UPDATED',
      'evacuation_requests',
      parseInt(id),
      updates
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get evacuation
    const results = await query(
      'SELECT * FROM evacuation_requests WHERE id = ?',
      [id]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Evacuation not found' }, { status: 404 });
    }

    const evacuation = results[0] as any;

    // Check authorization - only owner or admin can delete
    const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);
    const userRole = (userResults[0] as any).role;

    if (userRole !== 'admin' && evacuation.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await query('DELETE FROM evacuation_requests WHERE id = ?', [id]);

    await logAuditEvent(
      session.userId,
      'EVACUATION_REQUEST_DELETED',
      'evacuation_requests',
      parseInt(id)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
