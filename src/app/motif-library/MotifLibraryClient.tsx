"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Library, 
  Search, 
  Folder, 
  Tag, 
  Trash2, 
  Edit3, 
  Plus, 
  FolderPlus,
  ArrowRight,
  MoreVertical,
  X,
  FileImage,
  Upload
} from 'lucide-react';

interface Motif {
  id: string;
  name: string;
  category: string;
  tags: string;
  imageUrl: string;
  createdAt: Date;
}

interface MotifLibraryClientProps {
  user: any;
  initialMotifs: Motif[];
}

export default function MotifLibraryClient({ user, initialMotifs }: MotifLibraryClientProps) {
  const [motifs, setMotifs] = useState<Motif[]>(initialMotifs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');

  // Edit states
  const [editingMotif, setEditingMotif] = useState<Motif | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Flowers');
  const [editTags, setEditTags] = useState('');

  // Add state
  const [uploading, setUploading] = useState(false);

  const categories = [
    'My Motifs',
    'Flowers',
    'Paisleys',
    'Leaves',
    'Borders',
    'Traditional',
    'Modern'
  ];

  // Extract all unique tags
  const allTagsSet = new Set<string>();
  motifs.forEach(m => {
    m.tags.split(',').forEach(t => {
      const trimmed = t.trim();
      if (trimmed) allTagsSet.add(trimmed);
    });
  });
  const uniqueTags = Array.from(allTagsSet);

  // Deletion
  const handleDeleteMotif = async (id: string) => {
    if (!confirm('Are you sure you want to delete this motif from your library?')) return;
    
    try {
      const res = await fetch(`/api/motifs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMotifs(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  // Renaming/Editing
  const startEdit = (motif: Motif) => {
    setEditingMotif(motif);
    setEditName(motif.name);
    setEditCategory(motif.category);
    setEditTags(motif.tags);
  };

  const handleUpdateMotif = async () => {
    if (!editingMotif) return;

    try {
      const res = await fetch('/api/motifs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMotif.id,
          name: editName,
          category: editCategory,
          tags: editTags
        })
      });

      if (res.ok) {
        setMotifs(prev => prev.map(m => m.id === editingMotif.id ? { ...m, name: editName, category: editCategory, tags: editTags } : m));
        setEditingMotif(null);
      }
    } catch (e) {
      alert('Update failed');
    }
  };

  // Filtering
  const filteredMotifs = motifs.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.tags.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesTag = selectedTag === 'All' || m.tags.split(',').map(t => t.trim()).includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-1 overflow-hidden h-full">
      
      {/* SIDEBAR NESTED PANEL FOR FOLDERS */}
      <aside className="w-56 border-r border-zinc-900 bg-zinc-950 p-4 space-y-6 shrink-0 h-full overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Library Folders</span>
          <button className="p-1 hover:text-white text-zinc-500" title="New Folder">
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              selectedCategory === 'All' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Library className="w-4 h-4 text-zinc-500" />
            All Motifs
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === cat ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Folder className="w-4 h-4 text-zinc-500" />
              {cat}
            </button>
          ))}
        </div>

        <div className="h-px bg-zinc-900 my-4" />

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Tag Filters</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                selectedTag === 'All' ? 'border-rose-500/20 bg-rose-950/10 text-rose-400' : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:border-zinc-800'
              }`}
            >
              All Tags
            </button>
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  selectedTag === tag ? 'border-rose-500/20 bg-rose-950/10 text-rose-400' : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:border-zinc-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CATALOG */}
      <section className="flex-1 flex flex-col overflow-hidden bg-zinc-950/20">
        
        {/* HEADER */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-350 text-xs font-bold">← Dashboard</Link>
            <div className="h-4 w-px bg-zinc-900" />
            <h1 className="text-base font-extrabold text-white">Motif Library Catalog</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search catalog tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl outline-none w-48 focus:border-rose-500"
              />
            </div>

            <button className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4.5 py-2 rounded-xl transition-all shadow shadow-rose-600/10">
              <Plus className="w-3.5 h-3.5" />
              Import Motif
            </button>
          </div>
        </header>

        {/* MOTIFS GRID */}
        <div className="flex-grow overflow-y-auto p-8">
          {filteredMotifs.length === 0 ? (
            <div className="p-16 border border-dashed border-zinc-900 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
              <Library className="w-8 h-8 text-zinc-700 mx-auto" />
              <div>
                <h4 className="font-bold text-white text-sm">No Motifs Found</h4>
                <p className="text-xs text-zinc-500 mt-1">This folder or tag selection is empty. Import new motifs or select "All Motifs" folder.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {filteredMotifs.map((m) => (
                <div 
                  key={m.id}
                  className="bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 rounded-3xl overflow-hidden group transition-all"
                >
                  <div className="aspect-square bg-zinc-950 relative overflow-hidden flex items-center justify-center p-4">
                    <img 
                      src={m.imageUrl} 
                      alt={m.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                    
                    {/* Action hover overlay */}
                    <div className="absolute inset-0 bg-zinc-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => startEdit(m)}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        title="Edit properties"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMotif(m.id)}
                        className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Delete motif"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="font-bold text-white text-xs truncate leading-tight">{m.name}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 mt-1 block">{m.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {m.tags.split(',').map((t, idx) => (
                        <span key={idx} className="text-[8px] font-semibold text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded uppercase">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* EDIT MOTIF DIALOG MODAL */}
      {editingMotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-6">
            <div>
              <h3 className="font-extrabold text-white text-base">Edit Motif Attributes</h3>
              <p className="text-zinc-500 text-[11px] mt-1">Configure metadata directories and search tags for your motif catalog.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Motif Name</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Folder Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-zinc-200 outline-none focus:border-rose-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Search Tags</label>
                <input 
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-rose-500"
                  placeholder="e.g. traditional, zari, border (comma-separated)"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs font-bold">
              <button 
                onClick={() => setEditingMotif(null)}
                className="px-4 py-2.5 border border-zinc-850 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateMotif}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
