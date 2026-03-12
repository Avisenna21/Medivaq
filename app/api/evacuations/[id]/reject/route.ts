import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(
  req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

 if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

     const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);
 if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (userResults[0] as any).role;

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

     const body = await req.json().catch(() => ({}));
    const catatanRevisi =
      typeof body?.catatanRevisi === 'string'
        ? body.catatanRevisi.trim()
        : null;

    const { id } = await params;

      const hasNoteColumnResult = await query(
      `SELECT COUNT(*) as total
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'air_medical_evacuation'
         AND COLUMN_NAME = 'catatanRevisi'`,
    );

    
    const hasNoteColumn =
      Array.isArray(hasNoteColumnResult) &&
      Number((hasNoteColumnResult[0] as any)?.total || 0) > 0;

    if (hasNoteColumn) {
      await query(
        "UPDATE air_medical_evacuation SET status = 'reviewed', catatanRevisi = ? WHERE id = ?",
        [catatanRevisi || null, id],
      );
    } else {
      await query(
        "UPDATE air_medical_evacuation SET status = 'reviewed' WHERE id = ?",
        [id],
      );
    }

    return NextResponse.json({ success: true });


  } catch (error) {
    console.error('Reject evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}