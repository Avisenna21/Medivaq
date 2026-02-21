import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAuditEvent } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const userResults = await query(
      'SELECT role FROM users WHERE id = ?',
      [session.userId]
    );

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (userResults[0] as any).role;

    let results;
    if (userRole === 'admin') {
      // Admins see all evacuations
      results = await query(`
        SELECT e.*, u.full_name, u.email
        FROM evacuation_requests e
        JOIN users u ON e.user_id = u.id
        ORDER BY e.request_date DESC
      `);
    } else {
      // Users see only their own
      results = await query(
        `SELECT * FROM evacuation_requests WHERE user_id = ? ORDER BY request_date DESC`,
        [session.userId]
      );
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Fetch evacuations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      patientName,
      patientAge,
      patientCondition,
      location,
      destination,
      priorityLevel,
      medicalNotes,
      contactPerson,
      contactPhone,
    } = await request.json();

    if (!patientName || !location) {
      return NextResponse.json(
        { error: 'Patient name and location are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO evacuation_requests 
       (user_id, patient_name, patient_age, patient_condition, location, destination, 
        priority_level, medical_notes, contact_person, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.userId,
        patientName,
        patientAge || null,
        patientCondition || null,
        location,
        destination || null,
        priorityLevel || 'medium',
        medicalNotes || null,
        contactPerson || null,
        contactPhone || null,
      ]
    );

    const evacuationId = (result as any).insertId;

    await logAuditEvent(
      session.userId,
      'EVACUATION_REQUEST_CREATED',
      'evacuation_requests',
      evacuationId,
      { patientName, location, priorityLevel }
    );

    return NextResponse.json(
      {
        success: true,
        id: evacuationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
