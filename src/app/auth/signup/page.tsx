"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan')?.toUpperCase() || 'DESIGNER';

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Onboarding Options
  const [role, setRole] = useState('Freelance Designer');
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>(['Saree']);

  const roles = [
    'Freelance Designer',
    'Professional Designer',
    'Design Studio',
    'Textile Manufacturer',
    'Other'
  ];

  const designTypes = [
    'Saree',
    'Dress Material',
    'Kurti',
    'Dupatta',
    'Lehenga',
    'Blouse',
    'Other Textile'
  ];

  const handleDesignToggle = (type: string) => {
    if (selectedDesigns.includes(type)) {
      setSelectedDesigns(selectedDesigns.filter(d => d !== type));
    } else {
      setSelectedDesigns([...selectedDesigns, type]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          name,
          email,
          password,
          role,
          designTypes: selectedDesigns.join(','),
          plan: initialPlan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep(1); // Drop back to step 1 so they can adjust credentials if email taken
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 selection:bg-rose-500 text-zinc-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand logo */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/20">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Texora <span className="text-rose-500">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-white pt-2">
            Create your designer workspace
          </h2>
          <p className="text-sm text-zinc-400">
            {step === 1 ? 'Step 1: Set up your profile' : 'Step 2: Customize your workspace'}
          </p>
        </div>

        {/* Card panel */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md shadow-xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-white pl-10 pr-4 py-3 rounded-xl transition-all outline-none"
                    placeholder="Ananya Sharma"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-white pl-10 pr-4 py-3 rounded-xl transition-all outline-none"
                    placeholder="name@studio.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-white pl-10 pr-4 py-3 rounded-xl transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-md shadow-rose-600/10 hover:scale-[1.01]"
              >
                Continue to Onboarding
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Question 1: Role */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">What best describes you?</label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-4 py-3 text-left rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                        role === r 
                          ? 'border-rose-500 bg-rose-500/5 text-white' 
                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {r}
                      {role === r && <Check className="w-4 h-4 text-rose-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Designs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">What do you mainly design?</label>
                <div className="grid grid-cols-2 gap-2">
                  {designTypes.map((type) => {
                    const isChecked = selectedDesigns.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleDesignToggle(type)}
                        className={`px-4 py-2.5 text-left rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          isChecked 
                            ? 'border-rose-500 bg-rose-500/5 text-white' 
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {type}
                        {isChecked && <Check className="w-3.5 h-3.5 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-semibold text-sm transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSignup}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-md shadow-rose-600/10 hover:scale-[1.01]"
                >
                  {loading ? 'Creating Account...' : 'Complete Signup'}
                  {!loading && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Seed helper option */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-rose-400 hover:text-rose-300 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs">
        Loading onboarding wizard...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
