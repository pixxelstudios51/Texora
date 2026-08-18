"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Plus, 
  Minus, 
  X,
  Search,
  CheckCircle,
  FileText
} from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  subscription: {
    plan: string;
    status: string;
  } | null;
  creditWallet: {
    monthlyCredits: number;
    purchasedCredits: number;
  } | null;
}

interface AdminClientProps {
  user: any;
  initialUsers: SystemUser[];
  totalProjects: number;
  totalMotifs: number;
}

export default function AdminClient({ 
  user, 
  initialUsers, 
  totalProjects, 
  totalMotifs 
}: AdminClientProps) {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Credits Modal State
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [creditAmount, setCreditAmount] = useState(10);
  const [creditType, setCreditType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [creditReason, setCreditReason] = useState('Admin adjustment package');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Calculations
  const totalUsersCount = users.length;
  const premiumCount = users.filter(u => u.subscription?.plan === 'PROFESSIONAL' || u.subscription?.plan === 'STUDIO').length;
  
  // Simulated MRR calculation based on active plans
  let calculatedMrr = 0;
  users.forEach(u => {
    if (u.subscription?.status === 'ACTIVE') {
      if (u.subscription.plan === 'DESIGNER') calculatedMrr += 1499;
      if (u.subscription.plan === 'PROFESSIONAL') calculatedMrr += 3999;
      if (u.subscription.plan === 'STUDIO') calculatedMrr += 9999;
    }
  });

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    setSuccessMsg('');

    try {
      const finalAmount = creditType === 'ADD' ? creditAmount : -creditAmount;
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: finalAmount,
          reason: creditReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      // Update local users wallet state
      setUsers(prev => prev.map(u => {
        if (u.id === selectedUser.id && u.creditWallet) {
          return {
            ...u,
            creditWallet: {
              ...u.creditWallet,
              purchasedCredits: Math.max(0, u.creditWallet.purchasedCredits + finalAmount)
            }
          };
        }
        return u;
      }));

      setSuccessMsg(`Successfully adjusted credits for ${selectedUser.name}!`);
      setSelectedUser(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert('Credit update failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full relative z-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-rose-500" />
            System Administration Panel
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Monitor tenant activities, billing metrics, and credit ledger allocations.</p>
        </div>

        {successMsg && (
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-fade-in bg-emerald-950/20 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </span>
        )}
      </div>

      {/* ADMIN SYSTEM STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Registered Users</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalUsersCount}</div>
          <p className="text-xs text-zinc-500">{premiumCount} active premium subscribers</p>
        </div>

        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estimated Monthly Revenue</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">₹{calculatedMrr.toLocaleString()}</div>
          <p className="text-xs text-zinc-500">Based on active subscription tiers</p>
        </div>

        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Saved Layout Projects</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalProjects}</div>
          <p className="text-xs text-zinc-500">Including active repeating matrices</p>
        </div>

        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Library Saved Motifs</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalMotifs}</div>
          <p className="text-xs text-zinc-500">Reusable vector & scan elements</p>
        </div>
      </div>

      {/* USER LIST DIRECTORY */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">System User Directory</h3>
          
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search user email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl outline-none focus:border-rose-500 w-64"
            />
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/15 rounded-3xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[9px]">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Plan Status</th>
                <th className="p-4">AI Credits Balance</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredUsers.map((u) => {
                let badge = 'border-zinc-800 text-zinc-400';
                if (u.subscription?.plan === 'PROFESSIONAL') badge = 'border-rose-500/20 bg-rose-950/10 text-rose-400';
                if (u.subscription?.plan === 'STUDIO') badge = 'border-amber-500/20 bg-amber-950/10 text-amber-400';

                const totalCredits = (u.creditWallet?.monthlyCredits || 0) + (u.creditWallet?.purchasedCredits || 0);

                return (
                  <tr key={u.id} className="hover:bg-zinc-900/10 text-zinc-300">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 text-zinc-500">{u.role}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${badge}`}>
                        {u.subscription?.plan || 'NONE'}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-white">{totalCredits} credits</td>
                    <td className="p-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-rose-400 hover:text-rose-350 font-semibold text-[10px] rounded-lg transition-colors uppercase tracking-wider"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST CREDITS DIALOG MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Adjust User Credits</h3>
              <p className="text-zinc-500 text-[11px] mt-1">Manually grant or deduct AI operation credits for {selectedUser.name}.</p>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Target User</span>
                <span className="text-white font-bold">{selectedUser.name} ({selectedUser.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Current Balance</span>
                <span className="text-white font-bold">
                  {(selectedUser.creditWallet?.monthlyCredits || 0) + (selectedUser.creditWallet?.purchasedCredits || 0)} Credits
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Transaction Type</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCreditType('ADD')}
                    className={`flex-1 py-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                      creditType === 'ADD' ? 'border-rose-500 bg-rose-500/5 text-white font-bold' : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Grant Additions
                  </button>
                  <button 
                    onClick={() => setCreditType('DEDUCT')}
                    className={`flex-1 py-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                      creditType === 'DEDUCT' ? 'border-rose-500 bg-rose-500/5 text-white font-bold' : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Deduct Balance
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Credits Amount</label>
                <input 
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reason Log</label>
                <input 
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-rose-500"
                  placeholder="e.g. Customer support goodwill refilling"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs font-bold">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 border border-zinc-850 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateCredits}
                disabled={updating}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow"
              >
                {updating ? 'Saving...' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
