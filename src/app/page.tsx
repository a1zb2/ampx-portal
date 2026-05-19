'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Shield, Zap, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Vault created. You can now sign in.', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-yellow-400 selection:text-black">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10 text-center relative z-10"
      >
        <div className="h-16 w-16 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center text-black font-black text-2xl shadow-[0_0_40px_rgba(250,204,21,0.4)] mb-6">
          A
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">AmpX Portal</h1>
        <p className="text-zinc-400 font-medium tracking-wide uppercase text-xs">Elite Command Center</p>
      </motion.div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Initialize Profile' : 'Secure Access'}
          </h2>
          <p className="text-sm text-zinc-400 font-medium">
            {isSignUp ? 'Create your operational vault.' : 'Enter your credentials to access the system.'}
          </p>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message.type === 'error' ? <Shield className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)] disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{isSignUp ? 'Deploy Infrastructure' : 'Authorize Connection'} <ArrowRight className="h-4 w-4" /></>}
          </motion.button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-400 font-medium">
            {isSignUp ? 'Already have clearance?' : 'No active vault found?'}
            <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 font-bold text-white hover:text-yellow-400 transition-colors">
              {isSignUp ? 'Sign In' : 'Request Access'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}