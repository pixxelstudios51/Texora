"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  Monitor, 
  Lock, 
  Check, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface SettingsClientProps {
  user: any;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'security'>('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [avatar, setAvatar] = useState(user.avatar || '');

  // Workspace Settings
  const [units, setUnits] = useState('Inches');
  const [resolution, setResolution] = useState('300 DPI');
  const [theme, setTheme] = useState('Dark Workspace');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, avatar })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* SETTINGS SUB-NAV */}
      <aside className="w-56 border-r border-zinc-900 bg-zinc-950 p-4 space-y-6 shrink-0 h-full overflow-y-auto">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-3">System Settings</span>
        
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'profile' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-4 h-4 text-zinc-500" />
            Profile Information
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'workspace' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-zinc-500" />
            Workspace Presets
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'security' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-4 h-4 text-zinc-500" />
            Security & Login
          </button>
        </div>
      </aside>

      {/* SETTINGS MAIN BODY */}
      <section className="flex-1 flex flex-col overflow-hidden bg-zinc-950/20">
        
        {/* HEADER */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 text-xs font-bold">← Dashboard</Link>
            <div className="h-4 w-px bg-zinc-900" />
            <h1 className="text-base font-extrabold text-white">Account Settings</h1>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully!
            </span>
          )}
        </header>

        {/* FORMS */}
        <div className="flex-grow overflow-y-auto p-8 max-w-xl">
          
          {/* A: PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              <div className="space-y-4">
                
                {/* Avatar Preview */}
                <div className="flex items-center gap-4 pb-4 border-b border-zinc-900">
                  <img 
                    src={avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'} 
                    alt="avatar" 
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-800"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Profile Avatar Image</span>
                    <input 
                      type="text" 
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg text-zinc-400 outline-none w-72 mt-1 focus:border-rose-500" 
                      placeholder="Paste image link URL" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-zinc-900 border border-zinc-850 text-sm text-zinc-500 px-4 py-3 rounded-xl outline-none cursor-not-allowed"
                    title="Emails cannot be modified in the local demo"
                  />
                  <span className="text-[10px] text-zinc-600">Email addresses are tied to billing plans and cannot be edited.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Primary Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-zinc-200 px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                  >
                    <option value="Freelance Designer">Freelance Designer</option>
                    <option value="Professional Designer">Professional Designer</option>
                    <option value="Design Studio">Design Studio</option>
                    <option value="Textile Manufacturer">Textile Manufacturer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* B: WORKSPACE PRESETS TAB */}
          {activeTab === 'workspace' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Default Canvas Units</label>
                  <div className="flex gap-2">
                    {['Pixels', 'Inches', 'Centimeters'].map((unitOption) => (
                      <button
                        key={unitOption}
                        onClick={() => setUnits(unitOption)}
                        className={`flex-1 py-3 text-center border rounded-xl font-semibold text-xs transition-colors ${
                          units === unitOption 
                            ? 'border-rose-500 bg-rose-500/5 text-white' 
                            : 'border-zinc-850 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {unitOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Default Resolution (TIFF Export)</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-zinc-200 px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                  >
                    <option value="72 DPI">72 DPI (Web Screen draft)</option>
                    <option value="150 DPI">150 DPI (Mid-res draft)</option>
                    <option value="300 DPI">300 DPI (Factory standard print)</option>
                    <option value="600 DPI">600 DPI (Ultra high definition zari)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Interface Theme Settings</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-zinc-200 px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                  >
                    <option value="Dark Workspace">Dark Workspace (Recommended - Adobe/Figma style)</option>
                    <option value="Light Workspace">Light Workspace</option>
                  </select>
                </div>

              </div>

              <button
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* C: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                    placeholder="••••••••"
                  />
                </div>

              </div>

              <button
                onClick={() => {
                  alert('Password updated!');
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow"
              >
                Change Password
              </button>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-2 pt-4">
                <span className="font-bold text-white block">Active Browser Sessions</span>
                <p className="text-[10px] text-zinc-500 leading-snug">This device: Google Chrome on Windows (Current session). Active since {new Date(user.createdAt).toLocaleDateString()}</p>
                <button className="text-[10px] text-rose-400 font-bold hover:text-rose-350 mt-1 uppercase">Log out all other sessions</button>
              </div>
            </div>
          )}

        </div>

      </section>

    </div>
  );
}
