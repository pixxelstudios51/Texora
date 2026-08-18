"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Upload, 
  Paintbrush, 
  Layers, 
  Grid, 
  Palette, 
  Maximize2, 
  FileJson, 
  Check, 
  ChevronDown, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Workflow,
  MousePointerClick,
  Info
} from 'lucide-react';

export default function LandingPage() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const faqData = [
    {
      question: "Can I upload WhatsApp images?",
      answer: "Yes, absolutely! Texora AI is optimized to handle low-resolution, heavily compressed images sent via WhatsApp or social media. It upscales and cleans fabric textures automatically."
    },
    {
      question: "Can the AI restore damaged artwork?",
      answer: "Yes. Using the AI Restore tool, you can select scratched, folded, faded, or torn areas, and the AI will rebuild the missing motif structure, matching the original style and colors."
    },
    {
      question: "Can I extract saree borders?",
      answer: "Yes. You can isolate borders, pallu bands, and body repeat motifs separately. You can define specific design zones on the canvas and organize them into layers."
    },
    {
      question: "Can I create screen-print color separations?",
      answer: "Yes. The system automatically detects colors and separates them into distinct printing screen layers (masks). You can adjust density, tolerance, and merge screens to optimize setups."
    },
    {
      question: "Can I export production files?",
      answer: "Yes. You can export final previews (PNG/JPG), high-res artwork (PNG/TIFF), and complete production packages containing grayscale separation screens, palettes, and production specs."
    },
    {
      question: "What happens when I run out of credits?",
      answer: "You can purchase extra AI credit packs (10, 30, or 100 credits) directly from the billing dashboard. Monthly included credits reset automatically with your subscription cycle."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-500 selection:text-white overflow-x-hidden relative">
      {/* Structural dark-grey grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none z-0" />
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/20">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Texora <span className="text-rose-500">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#features" className="hover:text-white transition-colors">Core Features</a>
            <a href="#slider-section" className="hover:text-white transition-colors">Before / After</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-rose-600/10 hover:shadow-rose-600/20"
            >
              Start Designing Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI-Powered Textile Workspace
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] md:leading-[1.05]">
            Turn Any Textile Reference Into a <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">Production-Ready</span> Design
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Restore damaged artwork, extract motifs, rebuild missing patterns, create saree layouts, generate colorways, and prepare screen-print color separations — all in one professional AI workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/auth/signup" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] shadow-lg shadow-rose-600/20"
            >
              Start Designing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#slider-section" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-base transition-all"
            >
              Watch Demo
            </Link>
          </div>

          {/* Core Pipeline Visual Flow */}
          <div className="pt-20">
            <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-8">
              Visual Design Pipeline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-5xl mx-auto relative px-4">
              {[
                { label: 'UPLOAD', desc: 'Fabric references, photos, low-res scans', icon: Upload },
                { label: 'RESTORE', desc: 'AI damage repair & motif reconstruction', icon: Paintbrush },
                { label: 'EXTRACT', desc: 'Isolate main design, borders, backgrounds', icon: Layers },
                { label: 'CREATE', desc: 'Saree presets & repeat layout grids', icon: Grid },
                { label: 'SEPARATE', desc: 'Prepare color separations & screens', icon: Palette },
                { label: 'EXPORT', desc: 'ZIP package, TIFFs, production sheets', icon: ShieldCheck }
              ].map((step, idx) => (
                <div key={idx} className="relative group p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col items-center text-center space-y-3 hover:border-zinc-800 hover:bg-zinc-900/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs tracking-wider text-rose-400">{step.label}</div>
                  <div className="text-[11px] text-zinc-500 leading-snug">{step.desc}</div>
                  
                  {idx < 5 && (
                    <div className="hidden md:block absolute top-[30px] -right-[15px] translate-x-1/2 z-20 text-zinc-800 font-bold text-lg">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Comparison Section */}
      <section id="problem" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest text-rose-500 font-extrabold">The Workflow Shift</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Goodbye Photoshop Struggles</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Setting up repeats, colorways, and screens in traditional editing suites takes hours of manual cleanup. Texora AI automates the mechanical work so you focus entirely on creation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional Photoshop */}
            <div className="p-8 bg-zinc-950/80 border border-red-950/30 rounded-3xl relative">
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-red-950/50 text-red-400 text-xs font-semibold">
                Slow & Manual
              </div>
              <h4 className="text-xl font-bold text-white mb-6">Traditional Workflow</h4>
              <div className="space-y-4 text-sm text-zinc-400">
                {[
                  'Upload heavily compressed Whatsapp reference',
                  'Hours cleaning noise, scan textures, and dirt lines',
                  'Manually clone stamp cropped saree border boundaries',
                  'Lasso and crop out motifs, rebuilding details',
                  'Setup tiling grids manually (Half drop offset math)',
                  'Tedious RGB color-key selections for print screens',
                  'No layout validation for print boundaries'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Texora AI */}
            <div className="p-8 bg-gradient-to-b from-rose-950/10 to-amber-950/5 border border-rose-500/20 rounded-3xl relative shadow-lg shadow-rose-950/10">
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
                Fast & AI-Powered
              </div>
              <h4 className="text-xl font-bold text-white mb-6">Texora AI Workspace</h4>
              <div className="space-y-4 text-sm text-zinc-300">
                {[
                  'Upload reference image directly',
                  'AI automatically analyzes resolution & estimated colors',
                  'Rebuild cropped borders and missing areas with AI Restore',
                  'Separate layout assets (Design, Background, Texture) in 1 click',
                  'Configure straight, half drop, or border repeats dynamically',
                  'Auto-separate colors into printing screen masks instantly',
                  'Real-time saree preset visualizer & production health checking'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Visual Slider Demo */}
      <section id="slider-section" className="py-24 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold">Visual Proof</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Restoration in Action</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Drag the slider below to see how our AI heals faded colors, fixes folds/damage, upscales pixelation, and isolates design motifs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Interactive Slider Container */}
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl select-none">
              
              {/* After (Clean/Restored Version) */}
              <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200')" }} />
              
              {/* Before (Damaged/Low-res Version) */}
              <div 
                className="absolute inset-y-0 left-0 h-full overflow-hidden bg-cover bg-center" 
                style={{ 
                  width: `${sliderPosition}%`, 
                  backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200')",
                  filter: "contrast(85%) brightness(90%) sepia(20%) saturate(140%) blur(2px)" 
                }}
              />

              {/* Slider Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-zinc-950 flex items-center justify-center shadow-lg font-bold text-zinc-950 text-xs">
                  ↔
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-zinc-950/80 px-3 py-1 rounded-full text-xs text-zinc-400 font-semibold border border-zinc-800 z-30">
                Low-Res Damaged Reference
              </div>
              <div className="absolute top-4 right-4 bg-rose-600/90 px-3 py-1 rounded-full text-xs text-white font-semibold shadow z-30">
                Restored & Separated AI Design
              </div>

              {/* HTML range slider overlaying the container */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPosition} 
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
              />
            </div>

            <div className="flex justify-between mt-4 text-xs text-zinc-500 font-medium px-2">
              <span>← Slide Left to see Restored Design</span>
              <span>Slide Right to see Original Reference →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest text-rose-500 font-extrabold">Professional Features</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Full-Stack Design Workspace</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Everything you need to transform inspiration into fabric, built custom for Indian saree and print designers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'AI Artwork Restoration', desc: 'Remove fold lines, dirt, noise, and visual artifacts from WhatsApp scans automatically.', icon: Sparkles },
              { title: 'Missing Design Reconstruction', desc: 'Extend cropped borders, fill missing motifs, and expand fabric design boundaries.', icon: Maximize2 },
              { title: 'Intelligent Motif Extraction', desc: 'Isolate flowers, leaves, and patterns to build a personalized, drag-and-drop motif library.', icon: MousePointerClick },
              { title: 'Background & Texture Separation', desc: 'Split the main design, raw background base, and fabric texture into separate layers.', icon: Layers },
              { title: 'Seamless Repeat Creator', desc: 'Create perfect straight, half-drop, brick, or border repeats with automatic seam checks.', icon: Grid },
              { title: 'Saree Layout Designer', desc: 'Configure specific body, border, and pallu presets with precise real-world dimensions.', icon: Workflow },
              { title: 'AI Colorway Generator', desc: 'Generate multiple colorways across Bridal, Pastel, and Traditional palettes instantly.', icon: Palette },
              { title: 'Screen Color Separation', desc: 'Separate layouts into 4 to 12 printing screens with custom tolerances and grayscale masks.', icon: FileJson },
              { title: 'Interactive Production Check', desc: 'Advisory validation highlighting micro lines, bleeding details, and screen merges.', icon: Info }
            ].map((f, idx) => (
              <div key={idx} className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl hover:border-zinc-800 transition-all flex flex-col space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-rose-500">
                  <f.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">{f.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold">Plans & Pricing</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">SaaS Plans Built for Scale</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Select the pricing tier that matches your design volume. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* DESIGNER PLAN */}
            <div className="p-8 bg-zinc-900/20 border border-zinc-900 rounded-3xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white">DESIGNER</h4>
                  <p className="text-xs text-zinc-500 mt-1">For freelance textile designers</p>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₹1,499<span className="text-sm font-medium text-zinc-500">/month</span>
                </div>
                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  {[
                    '3 active projects per month',
                    'Basic artwork restoration',
                    'Background removal/separation',
                    'Motif extraction',
                    'Repeat creation grids',
                    'Up to 5 colorways per project',
                    '3 AI Credits included',
                    'Single user access'
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link 
                href="/auth/signup?plan=designer" 
                className="w-full mt-8 block py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-center font-semibold text-sm text-zinc-300 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* PROFESSIONAL PLAN */}
            <div className="p-8 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 border-2 border-rose-500 rounded-3xl flex flex-col justify-between relative shadow-xl shadow-rose-950/15">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-500 text-white text-xs font-bold tracking-widest uppercase">
                MOST POPULAR
              </div>
              <div className="space-y-6">
                <div className="pt-2">
                  <h4 className="text-xl font-bold text-white">PROFESSIONAL</h4>
                  <p className="text-xs text-rose-400 mt-1 font-semibold">For professional studio designers</p>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₹3,999<span className="text-sm font-medium text-zinc-500">/month</span>
                </div>
                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  {[
                    '10 active projects per month',
                    'Advanced restoration & healing',
                    'Missing area reconstruction',
                    'Texture & weave reconstruction',
                    'Full Saree Designer templates',
                    'Dress material / Kurti presets',
                    'Up to 10 colorways per project',
                    '15 AI Credits included',
                    'High-resolution output exports'
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link 
                href="/auth/signup?plan=professional" 
                className="w-full mt-8 block py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-center font-bold text-sm text-white transition-all shadow-md shadow-rose-600/20"
              >
                Choose Professional
              </Link>
            </div>

            {/* STUDIO PLAN */}
            <div className="p-8 bg-zinc-900/20 border border-zinc-900 rounded-3xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white">STUDIO</h4>
                  <p className="text-xs text-zinc-500 mt-1">For print houses & factories</p>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₹9,999<span className="text-sm font-medium text-zinc-500">/month</span>
                </div>
                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  {[
                    '30 active projects per month',
                    'Everything in Professional',
                    'Team Workspace (5 users)',
                    'Shared Motif Library',
                    'Full project version history',
                    'Batch upscaling / restoration',
                    'Advanced screen separation filters',
                    'Secure client approval links',
                    '50 AI Credits included'
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link 
                href="/auth/signup?plan=studio" 
                className="w-full mt-8 block py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-center font-semibold text-sm text-zinc-300 transition-all"
              >
                Get Started
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest text-rose-500 font-extrabold">Got Questions?</h2>
            <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm md:text-base text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed border-t border-zinc-900/50 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white">
              T
            </div>
            <span className="font-bold text-white tracking-tight">Texora AI</span>
          </div>

          <p>© 2026 Texora AI. Built for premium textile designers. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
