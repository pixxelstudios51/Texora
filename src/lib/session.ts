import { cookies } from 'next/headers';
import { prisma, ensureSeedData } from './db';

// Simple, fully functional cookie-based session management for the local MVP
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('user_id')?.value;

    // For a seamless demo experience, if no session cookie exists, we automatically
    // load or seed the default developer user ("Ananya Sharma")
    if (!userId) {
      const defaultId = await ensureSeedData();
      if (defaultId) {
        userId = defaultId;
        // Note: We can't set cookies during standard render, but we return the user
      } else {
        return null;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        creditWallet: true
      }
    });

    return user;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

export async function setSessionUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}
