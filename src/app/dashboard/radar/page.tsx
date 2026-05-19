'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, Clock, Plus, Loader2, CheckCircle2, TrendingUp, ExternalLink, Radar } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LiveRadar() {
  const supabase = createClient();
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [injectingId, setInjectingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch Live Hacker News Data (Logic preserved)
  useEffect(() => {
    const fetchRadarData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      try {
        const res = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=12');
        const data = await res.json();
        setTrends(data.hits);
      } catch (error) {
        console.error("Failed to fetch radar data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRadarData();
  }, [supabase]);

  // Inject Trend into the Kanban Vault (Logic preserved)
  const handleInjectToVault = async (trend: any) => {
    if (!user) return;
    setInjectingId(trend.objectID);

    const conceptText = `TREND HIJACK:\nTitle: ${trend.title}\nContext: Currently trending with ${trend.points} points.\nTake an aggressive stance on this topic.`;

    const { error } = await supabase
      .from('posts')
      .insert([{ 
        user_id: user.id, 
        text: conceptText, 
        status: 'col-1', 
        tag: 'Trend Hijack'
      }]);

    setInjectingId(null);

    if (!error) {
      setSuccessId(trend.objectID);
      setTimeout(() => setSuccessId(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Header section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Live Radar 
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              Hot
            </span>
          </h1>
          <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
            <Radar className="h-4 w-4 text-red-400" />
            Real-time telemetry from Hacker News. Hijack momentum instantly.
          </p>
        </div>
        
        {/* Dark Mode Toggle Group */}
        <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 shadow-sm backdrop-blur-md">
          <button className="px-4 py-1.5 text-xs font-bold bg-zinc-800 text-white rounded-lg shadow-sm border border-zinc-700/50">Hacker News</button>
          <button className="px-4 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors opacity-50 cursor-not-allowed" title="Coming Soon">Twitter (X)</button>
          <button className="px-4 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors opacity-50 cursor-not-allowed" title="Coming Soon">Reddit</button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="h-[400px] w-full flex flex-col items-center justify-center text-zinc-500">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin h-16 w-16"></div>
            <Radar className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-widest uppercase text-zinc-400">Scanning global networks...</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {trends.map((trend, idx) => (
            <motion.div 
              key={trend.objectID} 
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5 shadow-xl hover:border-zinc-600 transition-colors group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle gradient hover effect inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-red-500/0 group-hover:to-red-500/5 transition-colors pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Trending
                    </span>
                  </div>
                  <a href={`https://news.ycombinator.com/item?id=${trend.objectID}`} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-red-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <h3 className="text-base font-bold text-zinc-200 leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2 pr-4">
                  {trend.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-2 relative z-10">
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
                  <span className="flex items-center gap-1.5 text-orange-400/80">
                    <Flame className="h-3.5 w-3.5" /> {trend.points} pts
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="h-3.5 w-3.5" /> {new Date(trend.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleInjectToVault(trend)}
                  disabled={injectingId === trend.objectID || successId === trend.objectID}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm
                    ${successId === trend.objectID 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-white hover:text-black hover:border-transparent'
                    } disabled:opacity-80`}
                >
                  {injectingId === trend.objectID ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Hijacking...</>
                  ) : successId === trend.objectID ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> In Vault</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Hijack Trend</>
                  )}
                </button>
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}