'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, Users, ArrowUpRight, Search, Loader2, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CompetitorIntel() {
  const supabase = createClient();
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [handle, setHandle] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [clonedId, setClonedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitors();
  }, [supabase]);

  const fetchCompetitors = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('competitors').select('*').order('created_at', { ascending: false });
      if (data) setCompetitors(data);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    if (!handle.trim()) return;
    setSyncing(true);
    setErrorMsg('');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch('/api/competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle })
      });

      const profileData = await res.json();
      if (profileData.error) throw new Error(profileData.error);

      const cleanHandle = handle.startsWith('@') ? handle : `@${handle.replace(/\s+/g, '').toLowerCase()}`;

      await supabase.from('competitors').insert([{
        user_id: user.id,
        handle: cleanHandle,
        name: profileData.name || handle,
        audience: profileData.audience || 'Unknown',
        velocity: profileData.velocity || '+0.0%',
        playbook: profileData.playbook || 'Data missing.',
        sequence: profileData.sequence || 'Data missing.'
      }]);
      
      await fetchCompetitors();
      setHandle('');
    } catch (error) {
      setErrorMsg('Failed to analyze target. AI matrix rejected the handle.');
    } finally {
      setSyncing(false);
    }
  };

  const handleClone = async (comp: any) => {
    setCloningId(comp.id);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('hooks').insert([{
        user_id: user.id,
        title: `${comp.name} Master Framework`,
        category: 'Authority',
        template: `[Insert Target Audience/Topic here]\n\n${comp.playbook}\n\n[Insert Call to Action]`,
        example: comp.sequence
      }]);

      setCloningId(null);
      setClonedId(comp.id);
      setTimeout(() => setClonedId(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Competitor Intelligence</h1>
        <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
          <Target className="h-4 w-4 text-red-400" />
          Dynamically reverse-engineer high-performance accounts.
        </p>
      </motion.div>

      {/* Input Sync Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 mb-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-yellow-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Lock New Target Handle</h2>
          </div>
          {errorMsg && <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded shadow-sm">{errorMsg}</span>}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 ${syncing ? 'text-yellow-400 animate-pulse' : 'text-zinc-500'}`} />
            <input 
              type="text" 
              placeholder="e.g., @naval, @justinwelsh, or 'Sam Altman'"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              disabled={syncing}
              className="w-full pl-11 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all disabled:opacity-50"
            />
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing || !handle}
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all disabled:opacity-50 shrink-0 w-48 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
          >
            {syncing ? (
              <><Activity className="h-4 w-4 animate-pulse text-black" /> Analyzing...</>
            ) : (
              <><Zap className="h-4 w-4 fill-current" /> Initialize Sync</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Competitors List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
        ) : competitors.length === 0 ? (
          <div className="text-center py-12 bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl text-zinc-500 font-medium">No targets locked. Initialize an AI sync above.</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            {competitors.map((comp) => (
              <motion.div 
                key={comp.id} 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl flex flex-col group hover:border-zinc-600 transition-colors"
              >
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-black border border-zinc-800 text-yellow-400 font-black text-xl flex items-center justify-center shadow-inner uppercase">
                      {comp.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {comp.name} <span className="text-xs font-medium text-zinc-500">{comp.handle}</span>
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-zinc-400"><Users className="h-3.5 w-3.5 text-zinc-500" /> {comp.audience} audience</span>
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"><TrendingUp className="h-3 w-3" /> {comp.velocity} velocity</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clone Button */}
                  <button 
                    onClick={() => handleClone(comp)}
                    disabled={cloningId === comp.id || clonedId === comp.id}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-80 w-40
                      ${clonedId === comp.id 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                  >
                    {cloningId === comp.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    ) : clonedId === comp.id ? (
                      <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cloned to Vault</>
                    ) : (
                      <>Clone Framework <ArrowUpRight className="h-3 w-3" /></>
                    )}
                  </button>
                </div>

                <div className="border-t border-zinc-800/80 pt-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-yellow-400" /> AI Reverse-Engineered Playbook
                  </div>
                  <p className="text-sm font-medium text-zinc-300 leading-relaxed mb-5">
                    {comp.playbook}
                  </p>
                  
                  <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/80 shadow-inner">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Outperforming Sequence Variant
                    </div>
                    <p className="text-sm font-semibold text-zinc-200 italic leading-relaxed">
                      "{comp.sequence}"
                    </p>
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

    </div>
  );
}