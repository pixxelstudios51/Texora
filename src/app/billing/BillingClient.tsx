"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  DollarSign, 
  CreditCard, 
  PlusCircle, 
  Check, 
  AlertCircle,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  reason: string;
  createdAt: Date;
}

interface BillingClientProps {
  user: any;
  initialTransactions: Transaction[];
  projectCount: number;
}

export default function BillingClient({ user, initialTransactions, projectCount }: BillingClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activePlan, setActivePlan] = useState(user.subscription?.plan || 'DESIGNER');
  const [credits, setCredits] = useState((user.creditWallet?.monthlyCredits || 0) + (user.creditWallet?.purchasedCredits || 0));
  const [purchasedCredits, setPurchasedCredits] = useState(user.creditWallet?.purchasedCredits || 0);

  // Billing Actions
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Project Limit
  let projectLimit = 3;
  let planPrice = '₹1,499';
  if (activePlan === 'PROFESSIONAL') {
    projectLimit = 10;
    planPrice = '₹3,999';
  } else if (activePlan === 'STUDIO') {
    projectLimit = 30;
    planPrice = '₹9,999';
  }

  // Credit Pack Purchase Simulation (Stripe / Razorpay abstraction integration)
  const handlePurchasePack = async (packName: string, creditsAmount: number, priceRupees: number) => {
    setLoadingAction(packName);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy-credits',
          packName,
          creditsAmount,
          priceRupees
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment failed');

      // Update local wallet and transactions
      setCredits((prev: number) => prev + creditsAmount);
      setPurchasedCredits((prev: number) => prev + creditsAmount);
      setTransactions((prev: Transaction[]) => [data.transaction, ...prev]);
      setSuccessMsg(`Successfully purchased ${creditsAmount} extra AI credits!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChangePlan = async (targetPlan: string) => {
    if (targetPlan === activePlan) return;
    setLoadingAction(`plan-${targetPlan}`);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-plan',
          plan: targetPlan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upgrade failed');

      setActivePlan(targetPlan);
      setCredits(data.newCreditsBalance);
      setTransactions((prev: Transaction[]) => [data.transaction, ...prev]);
      setSuccessMsg(`Plan changed to ${targetPlan} successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert('Subscription update failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* BILLING SUB-NAV */}
      <aside className="w-56 border-r border-zinc-900 bg-zinc-950 p-4 space-y-6 shrink-0 h-full overflow-y-auto">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-3">Billing Dashboard</span>
        
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white font-bold">
            <CreditCard className="w-4 h-4 text-zinc-500" />
            Plans & Payments
          </button>
          <a href="#history" className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-zinc-400 hover:text-zinc-200">
            <Clock className="w-4 h-4 text-zinc-500" />
            Transaction History
          </a>
        </div>
      </aside>

      {/* BILLING MAIN PANEL */}
      <section className="flex-1 flex flex-col overflow-hidden bg-zinc-950/20">
        
        {/* HEADER */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 text-xs font-bold">← Dashboard</Link>
            <div className="h-4 w-px bg-zinc-900" />
            <h1 className="text-base font-extrabold text-white">Billing & Subscription</h1>
          </div>

          {successMsg && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </span>
          )}
        </header>

        {/* BODY */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8 max-w-5xl">
          
          {/* Active Plan Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PLAN CARD */}
            <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-3xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-rose-500/5 rounded-full blur-2xl" />
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Current Subscription</span>
                <span className="text-xl font-extrabold text-white uppercase tracking-wider mt-1 block">{activePlan}</span>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-extrabold text-white">{planPrice}</span>
                <span className="text-zinc-500 text-xs font-medium">/ month</span>
              </div>
              <div className="text-xs text-zinc-400">
                Billing Cycle: Monthly. Status:{' '}
                <span className="text-emerald-500 font-bold">ACTIVE</span>
              </div>
            </div>

            {/* PROJECT LIMIT CARD */}
            <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-3xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Project slots</span>
                <span className="text-xl font-extrabold text-white tracking-wider mt-1 block">Workspace capacity</span>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-extrabold text-white">{projectCount}</span>
                <span className="text-zinc-500 text-sm">/ {projectLimit} projects used</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(projectCount / projectLimit) * 100}%` }} />
              </div>
            </div>

            {/* CREDIT WALLET CARD */}
            <div className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-3xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">AI Wallet balance</span>
                <span className="text-xl font-extrabold text-white tracking-wider mt-1 block">Operation credits</span>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-extrabold text-white">{credits}</span>
                <span className="text-zinc-500 text-sm">AI Credits remaining</span>
              </div>
              <div className="text-[10px] text-zinc-500 flex justify-between">
                <span>Monthly Refill: {credits - purchasedCredits}</span>
                <span>Purchased Packs: {purchasedCredits}</span>
              </div>
            </div>

          </div>

          {/* PURCHASE PACKS SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Purchase Extra AI Credit Packs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {[
                { name: 'Small Pack', credits: 10, price: 999, rate: '₹99/credit' },
                { name: 'Professional Pack', credits: 30, price: 2499, rate: '₹83/credit' },
                { name: 'Studio Pack', credits: 100, price: 6999, rate: '₹69/credit' }
              ].map((pack) => {
                const isBuying = loadingAction === pack.name;
                return (
                  <div key={pack.name} className="p-6 bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 rounded-3xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="font-bold text-white text-base">{pack.name}</div>
                      <div className="text-3xl font-extrabold text-white">{pack.credits} Credits</div>
                      <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">{pack.rate}</div>
                    </div>
                    
                    <button
                      onClick={() => handlePurchasePack(pack.name, pack.credits, pack.price)}
                      disabled={loadingAction !== null}
                      className="w-full py-3 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-center font-bold text-xs text-zinc-300 hover:text-white rounded-xl transition-all shadow flex items-center justify-center gap-2"
                    >
                      {isBuying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          Processing payment...
                        </>
                      ) : (
                        `Buy Pack for ₹${pack.price.toLocaleString()}`
                      )}
                    </button>
                  </div>
                );
              })}

            </div>
          </div>

          {/* PLAN MANAGEMENT SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Manage Subscription Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {[
                { name: 'DESIGNER', price: 1499, desc: '₹1,499/mo • 3 projects • 3 AI credits' },
                { name: 'PROFESSIONAL', price: 3999, desc: '₹3,999/mo • 10 projects • 15 AI credits' },
                { name: 'STUDIO', price: 9999, desc: '₹9,999/mo • 30 projects • 50 AI credits' }
              ].map((tier) => {
                const isCurrent = activePlan === tier.name;
                const isUpdating = loadingAction === `plan-${tier.name}`;

                return (
                  <div 
                    key={tier.name}
                    className={`p-5 border rounded-3xl flex justify-between items-center transition-all ${
                      isCurrent 
                        ? 'border-rose-500 bg-rose-950/5' 
                        : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-xs tracking-wider uppercase">{tier.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-1 leading-snug">{tier.desc}</div>
                    </div>

                    <button
                      onClick={() => handleChangePlan(tier.name)}
                      disabled={isCurrent || loadingAction !== null}
                      className={`px-4 py-2 text-[10px] font-extrabold uppercase rounded-lg border transition-all ${
                        isCurrent 
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 cursor-default' 
                          : 'border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white'
                      }`}
                    >
                      {isUpdating ? 'Wait...' : isCurrent ? 'Active' : 'Change'}
                    </button>
                  </div>
                );
              })}

            </div>
          </div>

          {/* TRANSACTION HISTORY LEDGER */}
          <div id="history" className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Transaction Ledger</h3>
            <div className="border border-zinc-900 bg-zinc-900/15 rounded-3xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[9px]">
                  <tr>
                    <th className="p-4">Reason / Activity</th>
                    <th className="p-4">Transaction Type</th>
                    <th className="p-4">Credits Amount</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-900/10 text-zinc-350">
                      <td className="p-4 font-bold text-white">{tx.reason}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          tx.type === 'ADDITION' 
                            ? 'border-emerald-500/20 bg-emerald-950/15 text-emerald-400' 
                            : 'border-rose-500/20 bg-rose-950/15 text-rose-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-white">
                        {tx.type === 'ADDITION' ? '+' : '-'}{tx.amount}
                      </td>
                      <td className="p-4 text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
