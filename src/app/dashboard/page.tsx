import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch recent projects
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  });

  // Calculate project limit based on plan
  let projectLimit = 3;
  if (user.subscription?.plan === 'PROFESSIONAL') projectLimit = 10;
  if (user.subscription?.plan === 'STUDIO') projectLimit = 30;

  const projectCount = projects.length;

  return (
    <DashboardClient 
      user={user} 
      initialProjects={projects} 
      projectCount={projectCount}
      projectLimit={projectLimit}
    />
  );
}
