import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getSessionUser();

  // For safety, let's confirm the user is a default developer admin.
  // In our seeded SQLite default settings, email 'ananya@texora.ai' acts as default admin.
  if (!user || user.email !== 'ananya@texora.ai') {
    redirect('/dashboard');
  }

  // Fetch all users with wallets and subscriptions
  const users = await prisma.user.findMany({
    include: {
      subscription: true,
      creditWallet: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch totals
  const totalProjects = await prisma.project.count();
  const totalMotifs = await prisma.motif.count();

  return (
    <AdminClient 
      user={user} 
      initialUsers={users}
      totalProjects={totalProjects}
      totalMotifs={totalMotifs}
    />
  );
}
