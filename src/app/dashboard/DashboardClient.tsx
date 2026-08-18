"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/navigation';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  TrendingUp, 
  Briefcase, 
  Sparkles,
  ChevronRight,
  X,
  Compass,
  Zap,
  CheckCircle,
  FileImage,
  AlertCircle
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  productType: string;
  status: string;
  originalImageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardClientProps {
  user: any;
  initialProjects: Project[];
  projectCount: number;
  projectLimit: number;
}

export default function DashboardClient({ 
  user, 
  initialProjects, 
  projectCount, 
  projectLimit 
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreateParam = searchParams.get('action') === 'create';

  // Greeting based on time
  const [greeting, setGreeting] = useState('Good morning');
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs >= 12 && hrs < 17) setGreeting('Good afternoon');
    else if (hrs >= 17) setGreeting('Good evening');
  }, []);

  // Project List State
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Upload States
  const [isModalOpen, setIsModalOpen] = useState(showCreateParam);
  const [projectName, setProjectName] = useState('Floral Saree Design 01');
  const [productType, setProductType] = useState('Saree');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (showCreateParam) {
      setIsModalOpen(true);
    }
  }, [showCreateParam]);

  // Quick Action handler
  const triggerQuickAction = (type: string) => {
    setProductType(type);
    setProjectName(`${type} Design ${projects.length + 1}`);
    setIsModalOpen(true);
  };

  // Preset Sample Images
  const samples = [
    { name: 'Red Zari Silk Saree', type: 'Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', analysis: { res: '2400 × 1800', colors: 8, estimated: 6, quality: 'High', damaged: '5%', motifs: 3 } },
    { name: 'Jaipur Indigo Block Print', type: 'Dress Material', url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&q=80&w=800', analysis: { res: '1600 × 1200', colors: 4, estimated: 4, quality: 'Medium', damaged: '2%', motifs: 4 } },
    { name: 'Lotus Creeper Pattern', type: 'Dupatta', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800', analysis: { res: '2000 × 2000', colors: 12, estimated: 8, quality: 'High', damaged: '12%', motifs: 5 } },
    { name: 'Gold Brocade Textile', type: 'Custom Textile', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800', analysis: { res: '1200 × 900', colors: 6, estimated: 5, quality: 'Medium', damaged: '8%', motifs: 2 } }
  ];

  const handleSelectSample = (sample: any) => {
    setImageUrl(sample.url);
    setProjectName(sample.name + ' Workspace');
    setProductType(sample.type);
    
    // Simulate AI analysis sequence
    setAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setAnalysisResult({
            resolution: sample.analysis.res,
            colors: sample.analysis.colors,
            estimated: sample.analysis.estimated,
            quality: sample.analysis.quality,
            damaged: sample.analysis.damaged,
            motifs: sample.analysis.motifs,
            background: 'Detected',
            texture: 'Detected',
            workflow: [
              'Sharpen motif boundaries',
              'Isolate crimson background from gold print',
              'Reconstruct 12% damaged weave structure',
              'Extract 3 central floral bouquets',
              'Generate 8-color separations for screen printing'
            ]
          });
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleCreateProject = async () => {
    if (!imageUrl) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          productType,
          imageUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Project creation failed');

      // Direct to main design workspace
      router.push(`/workspace/${data.project.id}`);
    } catch (err) {
      alert('Error creating project. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImageUrl('');
    setAnalysisResult(null);
    setAnalyzing(false);
    // Remove query param to clean url
    router.replace('/dashboard');
  };

  // Filtering Logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || p.productType === typeFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full relative z-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{greeting}, {user.name.split(' ')[0]}</h1>
          <p className="text-zinc-500 text-sm mt-1">Here is what is happening in your textile design studio today.</p>
        </div>

        <button 
          onClick={() => triggerQuickAction('Saree')}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-rose-600/10 hover:scale-[1.01]"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Project
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Workspace Quota</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{projectCount}</span>
            <span className="text-zinc-500 text-sm">/ {projectLimit} projects</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(projectCount / projectLimit) * 100}%` }} />
          </div>
        </div>

        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Operations Balance</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{(user.creditWallet?.monthlyCredits || 0) + (user.creditWallet?.purchasedCredits || 0)}</span>
            <span className="text-zinc-500 text-sm">credits remaining</span>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Basic cleanup operations are free of charge.
          </div>
        </div>

        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Plan Billing Details</span>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-white uppercase tracking-wider">{user.subscription?.plan} Tier</span>
          </div>
          <div className="text-xs text-zinc-500">
            Next renewal date: {new Date(user.subscription?.currentPeriodEnd).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Create Saree Layout', type: 'Saree', icon: Compass, desc: 'Setup body, borders, and pallu boundaries' },
            { label: 'Create Dress Layout', type: 'Dress Material', icon: Briefcase, desc: 'Isolate top, bottom, and dupatta panels' },
            { label: 'Restore Old Artwork', type: 'Custom Textile', icon: Sparkles, desc: 'Clean noise, scan artifacts, and defects' },
            { label: 'Screen Separation', type: 'Saree', icon: FileImage, desc: 'Extract colors into printing films' },
            { label: 'Custom Fabric Repeat', type: 'Custom Textile', icon: PlusCircle, desc: 'Setup brick or half-drop repeats' }
          ].map((act, i) => (
            <button 
              key={i}
              onClick={() => triggerQuickAction(act.type)}
              className="p-5 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/50 rounded-2xl flex flex-col items-center text-center space-y-3 transition-all hover:scale-[1.01] group text-zinc-300 hover:text-white"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-rose-500/20 group-hover:bg-rose-950/10 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 transition-colors">
                <act.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs">{act.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{act.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN PROJECTS DIRECTORY */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">Recent Design Projects</h3>
          
          {/* Filters Dock */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 w-48 transition-all"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-300 px-3 py-2 rounded-xl outline-none"
            >
              <option value="All">All Types</option>
              <option value="Saree">Sarees</option>
              <option value="Dress Material">Dress Material</option>
              <option value="Kurti">Kurtis</option>
              <option value="Dupatta">Dupattas</option>
              <option value="Blouse">Blouses</option>
              <option value="Custom Textile">Custom Textiles</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-300 px-3 py-2 rounded-xl outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready for Export">Ready for Export</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* PROJECTS GRID */}
        {filteredProjects.length === 0 ? (
          <div className="p-16 border border-dashed border-zinc-900 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">No Projects Found</h4>
              <p className="text-xs text-zinc-500 mt-1">Your next textile design starts here. Create a new project to get started.</p>
            </div>
            <button 
              onClick={() => triggerQuickAction('Saree')}
              className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl font-bold text-xs transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {filteredProjects.map((p) => {
              // Map statuses to premium color badges
              let badgeColor = 'bg-zinc-900 text-zinc-400 border-zinc-800';
              if (p.status === 'In Progress') badgeColor = 'bg-amber-950/40 text-amber-400 border-amber-500/20';
              if (p.status === 'Ready for Export') badgeColor = 'bg-rose-950/40 text-rose-400 border-rose-500/20';
              if (p.status === 'Completed') badgeColor = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20';

              return (
                <div 
                  key={p.id}
                  onClick={() => router.push(`/workspace/${p.id}`)}
                  className="bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/40 rounded-3xl overflow-hidden cursor-pointer group transition-all"
                >
                  <div className="aspect-[4/3] w-full bg-zinc-950 relative overflow-hidden">
                    {p.thumbnailUrl ? (
                      <img 
                        src={p.thumbnailUrl} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-950">
                        <FileImage className="w-12 h-12" />
                      </div>
                    )}
                    {/* Badge */}
                    <div className={`absolute top-4 left-4 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badgeColor}`}>
                      {p.status}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors line-clamp-1">{p.name}</h4>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{p.productType}</div>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-900/50 pt-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* HEADER */}
            <div className="p-6 border-b border-zinc-850">
              <h3 className="text-xl font-extrabold text-white">Create New Design Project</h3>
              <p className="text-zinc-500 text-xs mt-1">Upload a textile reference image to analyze colors and extract motifs.</p>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN: SETTINGS */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Name</label>
                  <input 
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                    placeholder="e.g. Traditional Banarasi Border 01"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Type</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-sm text-zinc-200 px-4 py-3 rounded-xl outline-none focus:border-rose-500"
                  >
                    <option value="Saree">Saree</option>
                    <option value="Dress Material">Dress Material</option>
                    <option value="Kurti">Kurti</option>
                    <option value="Dupatta">Dupatta</option>
                    <option value="Lehenga">Lehenga</option>
                    <option value="Blouse">Blouse</option>
                    <option value="Custom Textile">Custom Textile</option>
                  </select>
                </div>

                {/* Dropzone Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Upload Reference Image</label>
                  <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center hover:border-zinc-700 transition-colors cursor-pointer bg-zinc-950/40 relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // For demo, we just load Jaipur Paisley sample since uploading local files to SQLite needs servers
                          handleSelectSample(samples[1]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                    <div className="text-xs text-zinc-300 font-semibold">Drag and drop, or click to upload</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Supports PNG, JPG, WEBP up to 20MB</div>
                  </div>
                </div>

                {/* Preset samples picker */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Or select a premium design reference</label>
                  <div className="grid grid-cols-2 gap-2">
                    {samples.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(s)}
                        className={`p-2 bg-zinc-950 border rounded-xl flex items-center gap-3 text-left transition-all ${
                          imageUrl === s.url 
                            ? 'border-rose-500 bg-rose-950/5' 
                            : 'border-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        <img src={s.url} alt={s.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-800 shrink-0" />
                        <span className="text-[10px] font-bold text-zinc-300 truncate">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: AI ARTWORK ANALYSIS */}
              <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-6 flex flex-col justify-center">
                
                {/* 1. Empty State */}
                {!imageUrl && !analyzing && (
                  <div className="text-center py-12 space-y-3">
                    <Compass className="w-10 h-10 text-zinc-700 mx-auto" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No Image Selected</h4>
                      <p className="text-[11px] text-zinc-600 mt-1">Upload a photo or select a demo preset above to run the AI Artwork Analysis.</p>
                    </div>
                  </div>
                )}

                {/* 2. Loading State */}
                {analyzing && (
                  <div className="text-center py-12 space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-rose-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {analysisProgress}%
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Analyzing Reference...</h4>
                      <p className="text-[11px] text-zinc-500 mt-1">Extracting color palettes, mapping coordinates, and estimating print screens.</p>
                    </div>
                  </div>
                )}

                {/* 3. Analysis Result Pane */}
                {analysisResult && !analyzing && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Analysis Complete
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">Estimated Cost: 0 Credits</span>
                    </div>

                    <div className="border-t border-b border-zinc-900 py-4 space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Image Resolution</span>
                        <span className="text-white font-bold">{analysisResult.resolution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Detected Colors</span>
                        <span className="text-white font-bold">{analysisResult.colors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Estimated Print Screens</span>
                        <span className="text-white font-bold">{analysisResult.estimated} colors</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Reference Quality</span>
                        <span className="text-white font-bold">{analysisResult.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Damaged/Faded Area</span>
                        <span className="text-rose-400 font-bold">{analysisResult.damaged}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Main Motifs Detected</span>
                        <span className="text-white font-bold">{analysisResult.motifs} elements</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Suggested AI Workflow</span>
                      <div className="space-y-1.5">
                        {analysisResult.workflow.map((w: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-[11px] text-zinc-400 leading-snug">
                            <span className="text-rose-500 font-bold mt-0.5">•</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-zinc-850 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject}
                disabled={!analysisResult}
                className="px-5 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow shadow-rose-600/10"
              >
                Continue to Design Workspace
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
