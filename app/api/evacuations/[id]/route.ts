import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAuditEvent } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const results = await query(
      'SELECT * FROM air_medical_evacuation WHERE id = ?',
      [id],
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Evacuation not found' },
        { status: 404 },
      );
    }

    const evacuation = results[0] as any;

    const userResults = await query(
      'SELECT role FROM users WHERE id = ?',
      [session.userId],
    );

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
      { status: 500 },
    );

  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingResults = await query(
      'SELECT * FROM air_medical_evacuation WHERE id = ?',
      [id],
    );

    if (!Array.isArray(existingResults) || existingResults.length === 0) {
      return NextResponse.json(
        { error: 'Evacuation not found' },
        { status: 404 },
      );
    }

    const evacuation = existingResults[0] as any;

    if (evacuation.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const namaPasien =
      typeof body?.namaPasien === 'string' ? body.namaPasien.trim() : null;
    const jenisLayanan =
      typeof body?.jenisLayanan === 'string' ? body.jenisLayanan.trim() : null;
    const namaMaskapai =
      typeof body?.namaMaskapai === 'string' ? body.namaMaskapai.trim() : null;
    const noPenerbangan =
      typeof body?.noPenerbangan === 'string' ? body.noPenerbangan.trim() : null;
    const tanggalPerjalanan =
      typeof body?.tanggalPerjalanan === 'string'
        ? body.tanggalPerjalanan.trim()
        : null;

    if (!namaPasien || !tanggalPerjalanan) {
      return NextResponse.json(
        { error: 'Nama pasien dan tanggal perjalanan wajib diisi' },
        { status: 400 },
      );
    }

    await query(
      `UPDATE air_medical_evacuation
       SET namaPasien = ?,
           jenisLayanan = ?,
           namaMaskapai = ?,
           noPenerbangan = ?,
           tanggalPerjalanan = ?,
           status = 'pending'
       WHERE id = ?`,
      [
        namaPasien,
        jenisLayanan,
        namaMaskapai,
        noPenerbangan,
        tanggalPerjalanan,
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
