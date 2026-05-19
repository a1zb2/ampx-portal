'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sliders, Save, Loader2, CheckCircle2, Sparkles, SlidersHorizontal, ToggleLeft, ToggleRight, Terminal, Zap } from 'lucide-react';

export default function AgentConfig() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Layout-accurate states matching your visual blueprint
  const [formality, setFormality] = useState(70);
  const [spiceLevel, setSpiceLevel] = useState(80);
  const [broetryMode, setBroetryMode] = useState(true);
  const [aggressiveHooks, setAggressiveHooks] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('Always position me as a pragmatic builder. Never use words like "synergy", "delve", or "unleash".');
  const [simOutput, setSimOutput] = useState('');

  useEffect(() => {
    fetchAgentConfig();
  }, [supabase]);

  const fetchAgentConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('agent_config').select('*').eq('user_id', user.id).single();
      if (data) {
        setFormality(data.formality ?? 70);
        setSpiceLevel(data.spice_level ?? 80);
        setBroetryMode(data.broetry_mode ?? true);
        setAggressiveHooks(data.aggressive_hooks ?? true);
        setSystemPrompt(data.system_prompt || '');
      }
    }
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('agent_config').upsert({
        user_id: user.id,
        formality,
        spice_level: spiceLevel,
        broetry_mode: broetryMode,
        aggressive_hooks: aggressiveHooks,
        system_prompt: systemPrompt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    setSimOutput('');
    
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept: `Simulating profile generation with Formality at ${formality}% and Spice Level at ${spiceLevel}%. Prompt base: ${systemPrompt}` 
        })
      });
      const data = await res.json();
      setSimOutput(data.text || 'Simulation pipeline returned empty parameters.');
    } catch (e) {
      setSimOutput('Simulation engine failed to execute. Verify API endpoints.');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
        <p className="mt-4 text-xs font-bold tracking-widest uppercase text-zinc-500">Syncing Agent Core...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Top Banner Control Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Agent Configuration</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Calibrate the neural pathways of your ghostwriter.</p>
        </div>
        
        <motion.button
          onClick={handleSaveConfig} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all justify-center border ${
            showSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : showSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {showSuccess ? 'Config Saved' : 'Save Config'}
        </motion.button>
      </div>

      {/* DUAL COLUMN SYSTEM MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: CONTROL PANEL DIALS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Voice & Tone Sliders */}
          <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/60 pb-3">
              <SlidersHorizontal className="h-4 w-4 text-purple-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Voice & Tone</h2>
            </div>
            
            <div className="space-y-6">
              {/* Formality Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-400">Formality</span>
                  <span className="text-purple-400 font-mono">{formality}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={formality} onChange={e => setFormality(parseInt(e.target.value))}
                  className="w-full accent-purple-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-ew-resize"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-1.5">
                  <span>Academic</span>
                  <span>Conversational</span>
                </div>
              </div>

              {/* Spice Level Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-400">Spice Level</span>
                  <span className="text-yellow-400 font-mono">{spiceLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={spiceLevel} onChange={e => setSpiceLevel(parseInt(e.target.value))}
                  className="w-full accent-yellow-400 bg-zinc-800 h-1 rounded-lg appearance-none cursor-ew-resize"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-1.5">
                  <span>Safe / PR</span>
                  <span>Hot Take</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Formatting Constraints Switches */}
          <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/60 pb-3">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Formatting Constraints</h2>
            </div>
            
            <div className="divide-y divide-zinc-800/60">
              {/* Broetry Toggle */}
              <div className="flex items-center justify-between py-4 first:pt-2">
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">LinkedIn 'Broetry' Mode</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Forces 1-2 sentence max per paragraph for optimal mobile scrolling trajectories.</p>
                </div>
                <button onClick={() => setBroetryMode(!broetryMode)} className="text-zinc-400 hover:text-white transition-colors">
                  {broetryMode ? <ToggleRight className="h-7 w-7 text-yellow-400" /> : <ToggleLeft className="h-7 w-7 text-zinc-700" />}
                </button>
              </div>

              {/* Aggressive Hooks Toggle */}
              <div className="flex items-center justify-between py-4 last:pb-2">
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">Aggressive Hooks</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Starts every post with a scroll-stopping, highly contrarian declaration.</p>
                </div>
                <button onClick={() => setAggressiveHooks(!aggressiveHooks)} className="text-zinc-400 hover:text-white transition-colors">
                  {aggressiveHooks ? <ToggleRight className="h-7 w-7 text-yellow-400" /> : <ToggleLeft className="h-7 w-7 text-zinc-700" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Custom Prompt Directives Window */}
          <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-800/60 pb-3">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Custom System Prompt</h2>
            </div>
            <textarea
              value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Inject core behavioral parameters here..." rows={4}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none font-mono leading-relaxed"
            />
          </div>

        </div>

        {/* RIGHT COMPONENT: LIVE CONSOLE SIMULATION VIEWPORT */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[550px] justify-between">
            
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/60 pb-3">
                <Bot className="h-4 w-4 text-zinc-400" />
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Live AI Simulation</h2>
              </div>
              
              {/* Output Content Field */}
              <div className="flex-1 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-center text-center shadow-inner overflow-y-auto">
                {simulating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
                    <span className="font-mono text-xs font-bold uppercase text-zinc-600 tracking-wider">Compiling output...</span>
                  </div>
                ) : simOutput ? (
                  <p className="text-sm font-medium text-zinc-300 text-left w-full align-top whitespace-pre-wrap leading-relaxed font-mono">
                    {simOutput}
                  </p>
                ) : (
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 max-w-[240px] leading-relaxed">
                    Adjust the parameters on the left, then run a simulation to see how Gemini responds based on your dials.
                  </p>
                )}
              </div>
            </div>

            {/* Execute Simulation CTA */}
            <motion.button
              onClick={handleRunSimulation} disabled={simulating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-yellow-400 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors shadow-[0_0_25px_rgba(250,204,21,0.15)] mt-6 shrink-0"
            >
              <Zap className="h-4 w-4 fill-current" /> Generate Test Output
            </motion.button>

          </div>
        </div>

      </div>
    </div>
  );
}