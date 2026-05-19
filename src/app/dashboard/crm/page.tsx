'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Users, Plus, MessageSquare, Loader2, UserPlus, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

export default function CRMPage() {
  const supabase = createClient();
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Foldout drawer state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('HOT LEAD');
  const [newSignal, setNewSignal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTargets();
  }, [supabase]);

  const fetchTargets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('crm_targets').select('*').order('created_at', { ascending: false });
      if (data) setTargets(data);
    }
    setLoading(false);
  };

  const handleAddTarget = async () => {
    if (!newName.trim() || !newRole.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('crm_targets').insert([{
        user_id: user.id,
        name: newName,
        role: newRole,
        status: newStatus,
        signal: newSignal.trim() || 'Initialized tracking sequences.'
      }]);
      await fetchTargets();
      setIsAdding(false);
      setNewName(''); 
      setNewRole(''); 
      setNewSignal('');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Engagement CRM</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" /> Track high-value interactions and convert attention into pipeline.
          </p>
        </div>
        <motion.button 
          onClick={() => setIsAdding(!isAdding)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border shadow-md
            ${isAdding 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' 
              : 'bg-white text-black hover:bg-zinc-200 border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]'
            }`}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Cancel Action' : 'Add High-Value Target'}
        </motion.button>
      </motion.div>

      {/* Add Target Foldout Container */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }} 
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 shadow-2xl">
              <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" /> Target Profile Initialization Matrix
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input 
                  type="text" placeholder="Name (e.g., Sarah Jenkins)" value={newName} onChange={e => setNewName(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" 
                />
                <input 
                  type="text" placeholder="Role & Company" value={newRole} onChange={e => setNewRole(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" 
                />
                <select 
                  value={newStatus} onChange={e => setNewStatus(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer"
                >
                  <option value="HOT LEAD">Hot Lead</option>
                  <option value="WARM">Warm</option>
                  <option value="COLD">Cold</option>
                  <option value="NETWORKING">Networking</option>
                </select>
                <input 
                  type="text" placeholder="Latest Signal (e.g., DM received)" value={newSignal} onChange={e => setNewSignal(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" 
                />
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddTarget} disabled={saving || !newName.trim() || !newRole.trim()} 
                  className="bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-2.5 px-6 rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-600/10"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Commit Target Record'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRM Main Directory Board */}
      <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Metric Directory Columns Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800/60 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/30">
          <div className="col-span-5 pl-4">Target Profile</div>
          <div className="col-span-2">Pipeline Status</div>
          <div className="col-span-5">Latest Signal Trace</div>
        </div>

        {loading ? (
          <div className="p-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
        ) : targets.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-zinc-700 mb-3" />
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">No tracking targets mapped</p>
            <p className="text-xs text-zinc-600 mt-1">Deploy high-value target handles into the dashboard database loop above.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-zinc-800/40">
            {targets.map((target) => (
              <motion.div 
                key={target.id}
                variants={itemVariants}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-900/30 transition-colors group"
              >
                {/* Profile Identity Info */}
                <div className="col-span-5 pl-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center justify-center font-black text-xs shadow-inner uppercase tracking-wider group-hover:border-zinc-700 transition-colors">
                    {target.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">{target.name}</h4>
                    <p className="text-xs font-semibold text-zinc-500 mt-0.5">{target.role}</p>
                  </div>
                </div>
                
                {/* Pipeline Status Tag Mappings */}
                <div className="col-span-2">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border
                    ${target.status === 'HOT LEAD' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      target.status === 'WARM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                      target.status === 'COLD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-zinc-800/50 text-zinc-400 border-zinc-700'}`}
                  >
                    {target.status}
                  </span>
                </div>
                
                {/* Latest Interaction Tracking Signal */}
                <div className="col-span-5 flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-zinc-700 mt-0.5 group-hover:text-emerald-400 transition-colors shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-300 leading-normal pr-4 line-clamp-2">{target.signal}</p>
                    <p className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-widest">Active Connection</p>
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