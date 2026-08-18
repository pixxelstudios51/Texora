import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, plan, packName, creditsAmount, priceRupees } = body;

    if (!action) {
      return NextResponse.json({ message: 'Missing action' }, { status: 400 });
    }

    // 1. BUY CREDITS PACK
    if (action === 'buy-credits') {
      if (!creditsAmount || !packName) {
        return NextResponse.json({ message: 'Missing purchase details' }, { status: 400 });
      }

      // Update credit wallet (add to purchasedCredits)
      const wallet = await prisma.creditWallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        return NextResponse.json({ message: 'Credit wallet not found' }, { status: 404 });
      }

      const updatedWallet = await prisma.creditWallet.update({
        where: { userId },
        data: {
          purchasedCredits: wallet.purchasedCredits + creditsAmount
        }
      });

      // Create transaction log
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          amount: creditsAmount,
          type: 'ADDITION',
          reason: `Purchased Extra Credits: ${packName} (₹${priceRupees})`
        }
      });

      return NextResponse.json({ success: true, wallet: updatedWallet, transaction });
    }

    // 2. CHANGE SUBSCRIPTION PLAN
    if (action === 'change-plan') {
      if (!plan) {
        return NextResponse.json({ message: 'Missing plan specification' }, { status: 400 });
      }

      // Verify active subscription
      const subscription = await prisma.subscription.findUnique({
        where: { userId }
      });

      if (!subscription) {
        return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
      }

      // Calculate credit changes
      let monthlyCredits = 3;
      if (plan === 'PROFESSIONAL') monthlyCredits = 15;
      else if (plan === 'STUDIO') monthlyCredits = 50;

      // Update Subscription plan
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Reset period
        }
      });

      // Update Credit Wallet limits
      const updatedWallet = await prisma.creditWallet.update({
        where: { userId },
        data: {
          monthlyCredits
        }
      });

      // Create Transaction log
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          amount: monthlyCredits,
          type: 'ADDITION',
          reason: `Subscription Tier Changed: ${plan} Plan Refill`
        }
      });

      const totalBalance = updatedWallet.monthlyCredits + updatedWallet.purchasedCredits;

      return NextResponse.json({ 
        success: true, 
        newCreditsBalance: totalBalance, 
        transaction 
      });
    }

    return NextResponse.json({ message: 'Invalid action option' }, { status: 400 });
  } catch (error: any) {
    console.error('Billing API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
