import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';

interface WorkspacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const user = await getSessionUser();
  const { id } = await params;

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch project with its versions, layers, and screen separations
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' }
      },
      layers: {
        orderBy: { order: 'asc' }
      },
      screenSeparations: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!project) {
    redirect('/dashboard');
  }

  // Fetch saved motifs from user library to allow drag-and-drop
  const libraryMotifs = await prisma.motif.findMany({
    where: { userId: user.id }
  });

  return (
    <WorkspaceClient 
      user={user} 
      project={project} 
      initialLayers={project.layers}
      initialScreens={project.screenSeparations}
      libraryMotifs={libraryMotifs}
    />
  );
}
