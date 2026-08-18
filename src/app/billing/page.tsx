import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import BillingClient from './BillingClient';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch credit transactions
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch project count
  const projectCount = await prisma.project.count({
    where: { userId: user.id }
  });

  return (
    <BillingClient 
      user={user} 
      initialTransactions={transactions}
      projectCount={projectCount}
    />
  );
}
