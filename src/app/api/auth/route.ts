import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureSeedData } from '@/lib/db';
import { setSessionUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, role, designTypes, plan } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    if (action === 'login') {
      // For local demo, we search for the user. If they type the default email or any email, 
      // we check if they exist. If they do not, we trigger the seed process.
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        if (email.toLowerCase() === 'ananya@texora.ai') {
          // Trigger seeding to ensure default user is loaded
          await ensureSeedData();
          user = await prisma.user.findUnique({
            where: { email: 'ananya@texora.ai' }
          });
        } else {
          // For ease of demoing, we auto-register any new email entered in the login form too!
          user = await prisma.user.create({
            data: {
              name: email.split('@')[0].toUpperCase(),
              email: email.toLowerCase(),
              role: 'Freelance Designer',
              designTypes: 'Saree,Kurti'
            }
          });

          // Add subscription & wallet
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: 'DESIGNER',
              status: 'ACTIVE',
              billingCycle: 'MONTHLY',
              provider: 'MOCK',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          });

          await prisma.creditWallet.create({
            data: {
              userId: user.id,
              monthlyCredits: 3,
              purchasedCredits: 0
            }
          });
        }
      }

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Write session cookie
      await setSessionUser(user.id);
      return NextResponse.json({ success: true, userId: user.id });
    }

    if (action === 'signup') {
      // Validate unique email
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          role: role || 'Freelance Designer',
          designTypes: designTypes || 'Saree'
        }
      });

      // Calculate initial credits based on selected plan
      let monthlyCredits = 3;
      if (plan === 'PROFESSIONAL') monthlyCredits = 15;
      else if (plan === 'STUDIO') monthlyCredits = 50;

      // Create Subscription
      await prisma.subscription.create({
        data: {
          userId: newUser.id,
          plan: plan || 'DESIGNER',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          provider: 'MOCK',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Create Wallet
      await prisma.creditWallet.create({
        data: {
          userId: newUser.id,
          monthlyCredits,
          purchasedCredits: 0
        }
      });

      // Write session cookie
      await setSessionUser(newUser.id);
      return NextResponse.json({ success: true, userId: newUser.id });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
