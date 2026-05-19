'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, ShieldCheck, ThumbsUp, ThumbsDown, FileText, Loader2, RefreshCw } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }
};

export default function ClearanceQueue() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviewQueue();
  }, [supabase]);

  const fetchReviewQueue = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Fetch posts waiting in Client Review ('col-3')
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'col-3')
        .order('created_at', { ascending: true });
      
      if (data) setPosts(data);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, nextStatus: 'col-4' | 'col-2', nextTag: string) => {
    setActionId(id);

    // Optimistic UI state removal for immediate layout animation response
    const modernQueue = posts.filter(p => p.id !== id);

    const { error } = await supabase
      .from('posts')
      .update({ status: nextStatus, tag: nextTag })
      .eq('id', id);

    if (!error) {
      setPosts(modernQueue);
    } else {
      console.error(error);
      fetchReviewQueue(); // Rollback if backend update fails
    }
    setActionId(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Clearance Queue
          </h1>
          <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-yellow-400" />
            Review and authorized copy payloads before public network deployment.
          </p>
        </div>
        
        <div className="h-9 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-2 text-xs font-bold text-zinc-400 select-none">
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span>{posts.length} Pending Actions</span>
        </div>
      </motion.div>

      {/* Main content processing track */}
      {loading ? (
        <div className="h-[300px] w-full flex flex-col items-center justify-center text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
          <p className="mt-4 text-xs font-bold tracking-widest uppercase text-zinc-500">Syncing clearance queue database items...</p>
        </div>
      ) : posts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-2xl"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide">Queue is Completely Clear</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
            All copy pipelines have been fully cleared. Route back to the Pipeline Engine or Live Radar to harvest new content targets.
          </p>
          <button onClick={fetchReviewQueue} className="mt-6 flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            <RefreshCw className="h-3 w-3" /> Refresh Feed
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants} initial="hidden" animate="show"
          className="space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                layout
                exit="exit"
                className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-2xl flex flex-col relative group overflow-hidden"
              >
                
                {/* Meta Header Information */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-300">Operational Copy Node</span>
                      <span className="text-[10px] font-mono text-zinc-600 block">ID: {post.id.substring(0,8).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  {post.tag && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded">
                      {post.tag}
                    </span>
                  )}
                </div>

                {/* Main Text Presentation Viewport */}
                <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 mb-6 shadow-inner relative">
                  <p className="text-sm font-medium text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {post.text}
                  </p>
                </div>

                {/* Bottom Control Actions */}
                <div className="flex items-center justify-between border-t border-zinc-800/40 pt-4">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    Awaiting authorization signature
                  </span>
                  
                  <div className="flex items-center gap-3">
                    {/* Action Reject Button */}
                    <button
                      onClick={() => handleAction(post.id, 'col-2', 'Needs Revision')}
                      disabled={actionId === post.id}
                      className="h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/30 hover:bg-red-950/10 text-zinc-400 hover:text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-40"
                    >
                      {actionId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsDown className="h-3.5 w-3.5" />}
                      <span>Bounce Draft</span>
                    </button>

                    {/* Action Approve Button */}
                    <button
                      onClick={() => handleAction(post.id, 'col-4', 'Scheduled')}
                      disabled={actionId === post.id}
                      className="h-10 px-5 rounded-xl bg-white text-black hover:bg-zinc-200 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                    >
                      {actionId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-black" /> : <ThumbsUp className="h-3.5 w-3.5 fill-current" />}
                      <span>Authorize Layout</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}