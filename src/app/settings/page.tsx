import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <SettingsClient user={user} />
  );
}
