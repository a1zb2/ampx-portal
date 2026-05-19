'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Key, Bell, CreditCard, LogOut, Loader2, 
  CheckCircle2, Save, Upload, Shield, Link2, ToggleLeft, ToggleRight
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'General Profile', icon: User },
  { id: 'api', label: 'API & Integrations', icon: Key },
  { id: 'billing', label: 'Billing & Limits', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Current Tab Controller
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form States
  const [fullName, setFullName] = useState('Divyanshu R.');
  const [email, setEmail] = useState('divyanshuraman5may2006@gmail.com');
  const [company, setCompany] = useState('AmpX');
  const [role, setRole] = useState('Founder');

  // Integrations States
  const [webhookUrl, setWebhookUrl] = useState('https://api.ampx.portal/v1/webhooks/linkedin');

  // Notification States
  const [clearanceAlerts, setClearanceAlerts] = useState(true);
  const [radarTracking, setRadarTracking] = useState(true);

  useEffect(() => {
    async function syncUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || 'divyanshuraman5may2006@gmail.com');
        const { data } = await supabase.from('profiles').select('name, company, role').eq('id', user.id).single();
        if (data) {
          if (data.name) setFullName(data.name);
          if (data.company) setCompany(data.company);
          if (data.role) setRole(data.role);
        }
      }
      setLoading(false);
    }
    syncUserData();
  }, [supabase]);

  const handleSaveSettings = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Persist values safely to DB tables
      await supabase.from('profiles').upsert({
        id: user.id,
        name: fullName,
        company: company,
        role: role,
        updated_at: new Date().toISOString()
      });

      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        clearance_alerts: clearanceAlerts,
        radar_tracking: radarTracking,
        webhook_url: webhookUrl
      }, { onConflict: 'user_id' });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
        <p className="mt-4 text-xs font-bold tracking-widest uppercase text-zinc-500">Syncing Matrix Environment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Configuration Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Preferences</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Manage your account, integrations, and security protocols.</p>
        </div>

        <motion.button
          onClick={handleSaveSettings} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all justify-center border ${
            showSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white text-black hover:bg-zinc-200 border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]'
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : showSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {showSuccess ? 'Changes Saved' : 'Save Changes'}
        </motion.button>
      </div>

      {/* HORIZONTAL SPLIT GRID PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: TABBED CONTROLLER SIDEBAR */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1 bg-zinc-950/20 p-2 border border-zinc-900 rounded-2xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all relative text-left outline-none
                  ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeSettingsTabIndicator"
                    className="absolute inset-0 bg-zinc-900/60 border border-zinc-800/80 rounded-xl -z-10 shadow-inner"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <tab.icon className={`h-4 w-4 ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-zinc-800/60 px-2">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-xs font-bold transition-all text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* RIGHT COMPONENT: DYNAMIC WORKSPACE INTERFACE */}
        <div className="md:col-span-8 lg:col-span-9 bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-8 shadow-2xl min-h-[460px]">
          <AnimatePresence mode="wait">
            
            {/* PANEL SECTOR 1: GENERAL PROFILE */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Personal Information</h3>
                  <p className="text-xs text-zinc-500">Configure your administrative identity values.</p>
                </div>

                {/* Avatar Display Section */}
                <div className="flex items-center gap-5 bg-zinc-950/30 p-4 border border-zinc-900 rounded-2xl shadow-inner">
                  <div className="h-14 w-14 rounded-xl bg-yellow-400 font-black text-black text-xl flex items-center justify-center shadow-md">
                    DR
                  </div>
                  <div>
                    <button className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm">
                      <Upload className="h-3.5 w-3.5" /> Upload Avatar
                    </button>
                    <p className="text-[10px] font-medium text-zinc-600 mt-1.5 uppercase tracking-wider">JPG or PNG. Max 2MB.</p>
                  </div>
                </div>

                {/* Form Input Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company / Brand</label>
                    <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</label>
                    <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* PANEL SECTOR 2: API & INTEGRATIONS (WIRED FOR OAUTH) */}
            {activeTab === 'api' && (
              <motion.div key="api" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">API & Integrations</h3>
                  <p className="text-xs text-zinc-500">Synchronize authorization structures for external networks.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">LinkedIn Integration Handshake</label>
                    <button 
                      onClick={() => window.location.href = '/api/auth/linkedin'}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 active:scale-[0.99]"
                    >
                      <Link2 className="h-4 w-4" /> Connect Live LinkedIn Profile
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Inbound Webhook Sync Route</label>
                    <div className="relative">
                      <Link2 className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm font-mono text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PANEL SECTOR 3: BILLING & LIMITS */}
            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Billing & Tier Limits</h3>
                  <p className="text-xs text-zinc-500">Monitor active subscription weights and account bounds.</p>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-inner">
                  <div className="flex gap-4 items-start">
                    <div className="h-9 w-9 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400 shrink-0">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Elite Operational License</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Your subscription cycles update automatically on a standard 30-day index sequence.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-3 py-1 rounded-md shadow-md shrink-0">Active</span>
                </div>

                <div className="border-t border-zinc-900 pt-4">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-zinc-400">Database Action CEILING</span>
                    <span className="text-yellow-400 font-mono">24 / 30 Operations</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full w-[80%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.4)]"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PANEL SECTOR 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Telemetry Notifications</h3>
                  <p className="text-xs text-zinc-500">Calibrate system log updates and inbound signal interceptions.</p>
                </div>

                <div className="divide-y divide-zinc-900">
                  <div className="flex items-center justify-between py-4 first:pt-2">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Real-time Clearance Intercepts</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Fire push alerts instantly when a payload slides into the approval column index.</p>
                    </div>
                    <button onClick={() => setClearanceAlerts(!clearanceAlerts)} className="text-zinc-400 hover:text-white transition-all outline-none">
                      {clearanceAlerts ? <ToggleRight className="h-7 w-7 text-yellow-400" /> : <ToggleLeft className="h-7 w-7 text-zinc-800" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 last:pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">High-Velocity Radar Tracking</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Log an alert entry when monitored Hacker News nodes cross standard scoring thresholds.</p>
                    </div>
                    <button onClick={() => setRadarTracking(!radarTracking)} className="text-zinc-400 hover:text-white transition-all outline-none">
                      {radarTracking ? <ToggleRight className="h-7 w-7 text-yellow-400" /> : <ToggleLeft className="h-7 w-7 text-zinc-800" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}