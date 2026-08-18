import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { 
  Home, 
  Layers, 
  PlusCircle, 
  Wand2, 
  Library, 
  Palette, 
  Layout, 
  DollarSign, 
  Settings, 
  LogOut,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { clearSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Count user's projects
  const { prisma } = await import('@/lib/db');
  const projectCount = await prisma.project.count({
    where: { userId: user.id }
  });

  // Calculate project limit based on plan
  let projectLimit = 3;
  if (user.subscription?.plan === 'PROFESSIONAL') projectLimit = 10;
  if (user.subscription?.plan === 'STUDIO') projectLimit = 30;

  const remainingProjects = Math.max(0, projectLimit - projectCount);

  // Sign out server action
  const handleSignout = async () => {
    'use server';
    await clearSession();
    redirect('/auth/login');
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between shrink-0">
        
        {/* TOP BAR / LOGO */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white shadow shadow-rose-500/20">
              T
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Texora <span className="text-rose-500">AI</span>
            </span>
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <Home className="w-4 h-4 text-zinc-500" />
              Dashboard Home
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <Briefcase className="w-4 h-4 text-zinc-500" />
              Projects
            </Link>
          </div>

          <div className="h-px bg-zinc-900 my-4" />

          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Design Tools</span>
            <Link href="/dashboard?action=create" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <PlusCircle className="w-4 h-4 text-rose-500" />
              Create New Project
            </Link>
            <Link href="/motif-library" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <Library className="w-4 h-4 text-zinc-500" />
              Motif Library
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <Palette className="w-4 h-4 text-zinc-500" />
              Color Palettes
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <Layout className="w-4 h-4 text-zinc-500" />
              Layout Templates
            </Link>
          </div>

          <div className="h-px bg-zinc-900 my-4" />

          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Account</span>
            <Link href="/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <DollarSign className="w-4 h-4 text-zinc-500" />
              Billing & Credits
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors">
              <Settings className="w-4 h-4 text-zinc-500" />
              Settings
            </Link>
          </div>
        </nav>

        {/* BOTTOM METRICS & PROFILE */}
        <div className="p-4 space-y-4">
          {/* Plan stats widget */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-3">
            <div>
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Plan</div>
              <div className="text-xs font-bold text-white mt-0.5">{user.subscription?.plan} Plan</div>
            </div>
            
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                <span>Projects Slots</span>
                <span className="text-zinc-300 font-bold">{projectCount} / {projectLimit}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full" 
                  style={{ width: `${(projectCount / projectLimit) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-zinc-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                AI Credits
              </span>
              <span className="text-zinc-200 font-bold">{(user.creditWallet?.monthlyCredits || 0) + (user.creditWallet?.purchasedCredits || 0)}</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100'} 
                alt={user.name} 
                className="w-9 h-9 rounded-xl object-cover border border-zinc-800 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate leading-tight">{user.name}</div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{user.role}</div>
              </div>
            </div>

            <form action={handleSignout}>
              <button type="submit" title="Sign Out" className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900/50 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 h-full overflow-y-auto bg-zinc-950 relative flex flex-col">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
