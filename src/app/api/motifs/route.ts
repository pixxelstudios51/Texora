import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, category, tags } = body;

    if (!id || !name || !category) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.motif.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized ownership check failed' }, { status: 401 });
    }

    const updated = await prisma.motif.update({
      where: { id },
      data: {
        name,
        category,
        tags: tags || ''
      }
    });

    return NextResponse.json({ success: true, motif: updated });
  } catch (error: any) {
    console.error('Update Motif API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing motif ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.motif.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized ownership check failed' }, { status: 401 });
    }

    await prisma.motif.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Motif API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
