import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminUserId = cookieStore.get('user_id')?.value;

    if (!adminUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin identity
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!adminUser || adminUser.email !== 'ananya@texora.ai') {
      return NextResponse.json({ message: 'Forbidden admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, amount, reason } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json({ message: 'Missing userId or credit amount' }, { status: 400 });
    }

    const wallet = await prisma.creditWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return NextResponse.json({ message: 'Credit wallet not found for target user' }, { status: 404 });
    }

    // Update purchasedCredits balance (preventing negative values)
    const newPurchased = Math.max(0, wallet.purchasedCredits + amount);

    const updatedWallet = await prisma.creditWallet.update({
      where: { userId },
      data: {
        purchasedCredits: newPurchased
      }
    });

    // Create transaction log
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'ADDITION' : 'DEDUCTION',
        reason: reason || 'Administrative wallet adjustment'
      }
    });

    return NextResponse.json({ success: true, wallet: updatedWallet });
  } catch (error: any) {
    console.error('Admin Credits API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
