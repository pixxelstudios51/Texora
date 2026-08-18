import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import MotifLibraryClient from './MotifLibraryClient';

export const dynamic = 'force-dynamic';

export default async function MotifLibraryPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all motifs saved in the user's library
  const motifs = await prisma.motif.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <MotifLibraryClient 
      user={user} 
      initialMotifs={motifs} 
    />
  );
}
