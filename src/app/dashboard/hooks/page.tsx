'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Filter, Copy, CheckCircle2, Sparkles, Bookmark, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const FILTERS = ['All', 'Contrarian', 'Authority', 'Storytelling'];

export default function HooksLibrary() {
  const supabase = createClient();
  const [hooks, setHooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHooks();
  }, [supabase]);

  const fetchHooks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('hooks').select('*').order('created_at', { ascending: false });
      if (data) setHooks(data);
    }
    setLoading(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHooks = activeFilter === 'All' 
    ? hooks 
    : hooks.filter(h => h.category?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hooks Library</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-yellow-500" />
            Your structural armory. Deploy proven viral frameworks instantly.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" /> Custom Template
        </motion.button>
      </motion.div>

      {/* Filter Matrix */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-r border-zinc-800 pr-4">
          <Filter className="h-3.5 w-3.5" /> Filter Matrix
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === filter 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Hooks Grid */}
      <div className="pb-12">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
        ) : filteredHooks.length === 0 ? (
          <div className="text-center py-16 bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl">
            <BookOpen className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No frameworks found in this matrix.</p>
            <p className="text-xs text-zinc-500 mt-1">Clone a competitor or create a custom template.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHooks.map((hook) => (
              <motion.div 
                key={hook.id} 
                variants={itemVariants}
                className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl flex flex-col group hover:border-zinc-600 transition-colors"
              >
                
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
                      <Bookmark className="h-3 w-3" /> {hook.category || 'Framework'}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">{hook.title}</h3>
                  </div>
                  
                  {/* Copy Button */}
                  <button 
                    onClick={() => handleCopy(hook.id, hook.template)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm border ${
                      copiedId === hook.id 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    title="Copy Template"
                  >
                    {copiedId === hook.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Template Code Block */}
                <div className="flex-1 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 mb-5 shadow-inner">
                  <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {hook.template}
                  </pre>
                </div>

                {/* Active Application Variant */}
                <div className="border-t border-zinc-800/80 pt-4 mt-auto">
                  <div className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> Active Application Variant
                  </div>
                  <p className="text-sm font-medium text-zinc-400 italic leading-relaxed pl-4 border-l-2 border-zinc-800">
                    "{hook.example || 'Example missing from matrix.'}"
                  </p>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

    </div>
  );
}