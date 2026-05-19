'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Sparkles, Clock, CheckCircle2, MoreHorizontal, Lightbulb, Loader2, X, Zap, Maximize2 } from 'lucide-react';

const columns = [
  { id: 'col-1', title: 'Concept Vault', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'col-2', title: 'Agent Drafting', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'col-3', title: 'Client Review', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'col-4', title: 'Scheduled', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
];

export default function PipelineEngine() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newConceptText, setNewConceptText] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // NEW: State for expanding/editing a post
  const [activePost, setActivePost] = useState<any | null>(null);
  const [activePostText, setActivePostText] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [supabase]);

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
    }
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggedId) return;

    setPosts(posts.map(p => p.id === draggedId ? { ...p, status: targetColId } : p));
    const { error } = await supabase.from('posts').update({ status: targetColId }).eq('id', draggedId);
    if (error) fetchPosts(); 
    setDraggedId(null);
  };

  const handleAddConcept = async () => {
    if (!newConceptText.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('posts').insert([{
        user_id: user.id,
        text: newConceptText,
        status: 'col-1',
        tag: 'Raw Idea'
      }]);
      await fetchPosts();
      setIsAdding(false);
      setNewConceptText('');
    }
    setSaving(false);
  };

  const handleDeployAgent = async (e: React.MouseEvent, post: any) => {
    e.stopPropagation(); // Prevents opening the modal when clicking the deploy button
    setGeneratingId(post.id);
    
    try {
      // 1. Send the raw concept to our new Gemini API
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: post.text })
      });

      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // 2. Save the real AI generated text to the database and move columns
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('posts').update({ 
          status: 'col-2',
          tag: 'AI Drafted',
          text: data.text
        }).eq('id', post.id);
        
        await fetchPosts();
      }
    } catch (error) {
      console.error("Agent deployment failed:", error);
      alert("Failed to generate draft. Check console for details.");
    } finally {
      setGeneratingId(null);
    }
  };

  // NEW: Save edits from the Focus Modal
  const handleSaveUpdate = async () => {
    if (!activePost) return;
    setSavingUpdate(true);
    
    // Optimistic update
    setPosts(posts.map(p => p.id === activePost.id ? { ...p, text: activePostText } : p));
    
    // DB sync
    await supabase.from('posts').update({ text: activePostText }).eq('id', activePost.id);
    
    setSavingUpdate(false);
    setActivePost(null);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      
      {/* New Concept Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" /> Initialize Concept
                </h2>
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea 
                autoFocus placeholder="Dump your raw idea here..." value={newConceptText} onChange={e => setNewConceptText(e.target.value)} rows={5} 
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4 transition-all resize-none" 
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAddConcept} disabled={saving || !newConceptText.trim()} className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-300 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Drop into Vault'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW: Focus Editor Modal */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Review & Edit Draft</h2>
                  {activePost.tag && (
                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${activePost.tag === 'AI Drafted' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'}`}>
                      {activePost.tag}
                    </span>
                  )}
                </div>
                <button onClick={() => setActivePost(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <textarea 
                value={activePostText} 
                onChange={e => setActivePostText(e.target.value)} 
                className="w-full flex-1 min-h-[400px] px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-6 transition-all resize-none custom-scrollbar" 
              />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Last updated: {new Date(activePost.created_at).toLocaleString()}
                </span>
                <div className="flex gap-3">
                  <button onClick={() => setActivePost(null)} className="px-5 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white transition-colors">Close</button>
                  <button onClick={handleSaveUpdate} disabled={savingUpdate || activePostText === activePost.text} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {savingUpdate ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pipeline Engine</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">
            Drag concepts or deploy the AI Agent to draft content.
          </p>
        </div>
        <motion.button 
          onClick={() => setIsAdding(true)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          <Plus className="h-4 w-4" /> New Concept
        </motion.button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 pb-6">
        {columns.map((col) => {
          const columnPosts = posts.filter(p => p.status === col.id);
          
          return (
            <div key={col.id} className="flex flex-col h-full">
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-md ${col.bg} flex items-center justify-center`}>
                    <col.icon className={`h-3 w-3 ${col.color}`} />
                  </div>
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">{col.title}</h3>
                  <span className="h-5 w-5 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {columnPosts.length}
                  </span>
                </div>
                <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Column Dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex-1 bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-3 flex flex-col gap-3 shadow-inner overflow-y-auto [&::-webkit-scrollbar]:hidden"
              >
                
                {columnPosts.length === 0 && !loading && (
                  <div className="h-24 border-2 border-dashed border-zinc-800/80 rounded-2xl flex items-center justify-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
                    + Drop Concept
                  </div>
                )}

                <AnimatePresence>
                  {columnPosts.map((post) => (
                    <motion.div 
                      key={post.id}
                      layoutId={post.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, post.id)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      // NEW: Click to expand
                      onClick={() => { setActivePost(post); setActivePostText(post.text); }}
                      className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 shadow-lg cursor-pointer hover:border-zinc-500 transition-colors group flex flex-col relative"
                    >
                      {/* Expand Icon Hint */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="h-4 w-4 text-zinc-500" />
                      </div>

                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className="h-4 w-4 text-zinc-700 mt-1 cursor-grab active:cursor-grabbing group-hover:text-zinc-500 shrink-0" />
                        <div className="flex-1 pr-6">
                          
                          {/* Tag */}
                          {post.tag && (
                            <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border mb-3 ${post.tag === 'AI Drafted' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'}`}>
                              {post.tag}
                            </span>
                          )}
                          
                          {/* Content */}
                          <p className="text-sm font-medium text-zinc-300 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                            {post.text}
                          </p>
                        </div>
                      </div>

                      {/* Agent Trigger Button */}
                      {col.id === 'col-1' && (
                        <button 
                          onClick={(e) => handleDeployAgent(e, post)}
                          disabled={generatingId === post.id}
                          className="mt-4 w-full bg-zinc-900 border border-zinc-800 text-zinc-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50"
                        >
                          {generatingId === post.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin text-purple-400" /> Deploying Agent...</>
                          ) : (
                            <><Zap className="h-3 w-3 text-purple-400" /> Draft with AI</>
                          )}
                        </button>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <div className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">DR</span>
                        </div>
                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}