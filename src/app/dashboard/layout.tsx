'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { 
  Home, Calendar, CheckSquare, Activity, 
  Settings, Bell, Command, LogOut,
  BarChart2, Crosshair, BookOpen, Users, Search, Check
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  // OPTIMISTIC ROUTING STATE: Provides instant visual feedback on click
  const [optimisticPath, setOptimisticPath] = useState(pathname);

  // Utility Dropdown UI States
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Dynamic Data States
  const [pendingClearanceCount, setPendingClearanceCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // DOM Refs for Click-Outside Detection
  const notifyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync optimistic path with the real path (handles browser back/forward buttons)
  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    fetchRealtimeMetrics();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
        setIsNotifyOpen(false);
        setIsProfileOpen(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setIsNotifyOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [supabase]);

  const fetchRealtimeMetrics = async () => {
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'col-3');
    
    const realCount = count || 0;
    setPendingClearanceCount(realCount);

    const activeNotifs = [];
    if (realCount > 0) {
      activeNotifs.push({ 
        id: 'n-1', 
        text: `${realCount} post${realCount > 1 ? 's' : ''} awaiting clearance approvals`, 
        category: 'Clearance' 
      });
    }
    activeNotifs.push({ id: 'n-2', text: 'Hacker News trend spike detected (>400 pts)', category: 'Radar' });
    activeNotifs.push({ id: 'n-3', text: 'LinkedIn sync loop executed successfully', category: 'System' });

    setNotifications(activeNotifs);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const navTo = (path: string) => {
    setOptimisticPath(path); // Instant visual update for Command Palette navigation
    router.push(path);
    setIsCommandOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-zinc-100 font-sans overflow-hidden selection:bg-yellow-400 selection:text-black relative">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence>
        {isCommandOpen && (
          <div 
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsCommandOpen(false)}
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="w-full max-w-xl bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/40">
                <Search className="h-4 w-4 text-zinc-500" />
                <input type="text" placeholder="Search paths, configurations, pipelines..." className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-600" autoFocus />
                <button onClick={() => setIsCommandOpen(false)} className="text-zinc-600 hover:text-white px-1.5 py-0.5 border border-zinc-800 rounded-md text-[10px] font-mono">ESC</button>
              </div>
              <div className="p-2 max-h-[280px] overflow-y-auto space-y-1 font-medium text-xs text-zinc-400">
                <div className="px-3 py-1 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Navigation Targets</div>
                <button onClick={() => navTo('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 hover:text-white text-left transition-all"><Home className="h-4 w-4 text-zinc-500" /> Core Overview</button>
                <button onClick={() => navTo('/dashboard/calendar')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 hover:text-white text-left transition-all"><Calendar className="h-4 w-4 text-yellow-500" /> Pipeline Engine</button>
                <button onClick={() => navTo('/dashboard/radar')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 hover:text-white text-left transition-all"><Activity className="h-4 w-4 text-red-400" /> Live Momentum Radar</button>
                <button onClick={() => navTo('/dashboard/settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 hover:text-white text-left transition-all"><Settings className="h-4 w-4 text-zinc-500" /> System Matrices</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="w-[280px] bg-[#09090B]/60 backdrop-blur-3xl border-r border-zinc-800/50 flex flex-col h-full flex-shrink-0 z-20 text-zinc-400 select-none shadow-2xl relative">
        <div className="h-24 flex items-center px-6 pt-4">
          <Link href="/dashboard" onClick={() => setOptimisticPath('/dashboard')} className="flex items-center gap-3 w-full p-2 rounded-xl group outline-none">
            <motion.div whileHover={{ scale: 1.05, rotate: -5 }} whileTap={{ scale: 0.95 }} className="h-10 w-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-shadow relative overflow-hidden"><span className="relative z-10">A</span></motion.div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-zinc-100 group-hover:text-white transition-colors">AmpX Portal</h1>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Command Center</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 mt-2 pb-4 [&::-webkit-scrollbar]:hidden relative z-10">
          <NavSection title="Operations" />
          <NavItem href="/dashboard" icon={Home} label="Overview" active={optimisticPath === '/dashboard'} onClick={() => setOptimisticPath('/dashboard')} />
          <NavItem href="/dashboard/calendar" icon={Calendar} label="Pipeline Engine" active={optimisticPath?.includes('/calendar')} onClick={() => setOptimisticPath('/dashboard/calendar')} />
          <NavItem href="/dashboard/clearance" icon={CheckSquare} label="Clearance Queue" badge={pendingClearanceCount > 0 ? pendingClearanceCount.toString() : undefined} badgeColor="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" active={optimisticPath?.includes('/clearance')} onClick={() => setOptimisticPath('/dashboard/clearance')} />
          
          <NavSection title="Intelligence" />
          <NavItem href="/dashboard/radar" icon={Activity} label="Live Radar" badge="HOT" badgeColor="bg-red-500/10 text-red-400 border border-red-500/20" active={optimisticPath?.includes('/radar')} onClick={() => setOptimisticPath('/dashboard/radar')} />
          <NavItem href="/dashboard/competitors" icon={Crosshair} label="Competitor Intel" active={optimisticPath?.includes('/competitors')} onClick={() => setOptimisticPath('/dashboard/competitors')} />
          <NavItem href="/dashboard/analytics" icon={BarChart2} label="Analytics" active={optimisticPath?.includes('/analytics')} onClick={() => setOptimisticPath('/dashboard/analytics')} />
          
          <NavSection title="Assets & CRM" />
          <NavItem href="/dashboard/hooks" icon={BookOpen} label="Hooks Library" active={optimisticPath?.includes('/hooks')} onClick={() => setOptimisticPath('/dashboard/hooks')} />
          <NavItem href="/dashboard/agent" icon={Command} label="Agent Config" active={optimisticPath?.includes('/agent')} onClick={() => setOptimisticPath('/dashboard/agent')} />
          <NavItem href="/dashboard/crm" icon={Users} label="Engagement CRM" badge="New" badgeColor="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" active={optimisticPath?.includes('/crm')} onClick={() => setOptimisticPath('/dashboard/crm')} />
          
          <NavSection title="System" />
          <NavItem href="/dashboard/settings" icon={Settings} label="Settings" active={optimisticPath?.includes('/settings')} onClick={() => setOptimisticPath('/dashboard/settings')} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="h-20 absolute top-0 w-full bg-[#09090B]/60 backdrop-blur-2xl border-b border-zinc-800/50 flex items-center justify-between px-10 z-20">
          <div className="flex items-center gap-4">
            <div className="h-6 w-1.5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
            {mounted && (
              <motion.span key={pathname} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-extrabold text-white text-lg tracking-tight capitalize">
                {pathname === '/dashboard' ? 'Overview' : pathname?.split('/').pop()?.replace('-', ' ')}
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-4 relative">
            <div onClick={() => setIsCommandOpen(true)} className="hidden md:flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all select-none">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs font-bold text-zinc-500 pr-4">Command (⌘K)</span>
            </div>
            
            <div className="relative" ref={notifyRef}>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsProfileOpen(false); }}
                className={`h-9 w-9 rounded-full border bg-zinc-900/50 flex items-center justify-center transition-all relative
                  ${isNotifyOpen ? 'border-yellow-400 text-white' : 'border-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
              </motion.button>

              <AnimatePresence>
                {isNotifyOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-4 overflow-hidden z-50"
                  >
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2 flex justify-between items-center">
                      <span>Operational Logs</span><span>{notifications.length} Nodes</span>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-medium text-center py-4">All system diagnostics clear.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[240px] overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="flex gap-3 bg-zinc-950/40 p-2.5 border border-zinc-900 rounded-xl relative group">
                            <div className="flex-1">
                              <span className="text-[8px] font-black tracking-widest bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 uppercase">{n.category}</span>
                              <p className="text-xs font-semibold text-zinc-300 mt-1.5 leading-normal">{n.text}</p>
                            </div>
                            <button onClick={() => clearNotification(n.id)} className="text-zinc-600 hover:text-white self-start pt-0.5"><Check className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative" ref={profileRef}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifyOpen(false); }}
                className={`h-9 px-3 rounded-full border bg-zinc-900/50 flex items-center gap-2 cursor-pointer transition-all select-none
                  ${isProfileOpen ? 'border-yellow-400' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className="h-5 w-5 rounded-md bg-yellow-400 flex items-center justify-center shadow-inner"><span className="text-[9px] font-black text-black">DR</span></div>
                <span className="text-xs font-bold text-zinc-300 pr-1">Divyanshu R.</span>
              </motion.div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50"
                  >
                    <div className="p-2 border-b border-zinc-800/60 mb-2">
                      <div className="text-xs font-black text-white">Divyanshu R.</div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Elite System Operator</div>
                    </div>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-xs font-bold transition-all text-left">
                      <LogOut className="h-4 w-4" /> Secure Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-28 px-10 pb-12 relative [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavSection({ title }: { title: string }) {
  return (
    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-3 mt-8 first:mt-2">{title}</div>
  );
}

function NavItem({ icon: Icon, label, href, active, badge, badgeColor, onClick }: any) {
  return (
    <Link href={href || '#'} onClick={onClick} className="block relative outline-none mb-1">
      <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-200 group ${active ? 'text-white' : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'}`}>
        {active && <motion.div layoutId="activeNavIndicator" className="absolute inset-0 bg-zinc-800/80 rounded-xl border border-zinc-700/50 -z-10 shadow-inner" transition={{ type: "spring", stiffness: 300, damping: 30 }}></motion.div>}
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>}
        <div className="flex items-center gap-3">
          <Icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-yellow-400' : 'group-hover:text-zinc-300'}`} />
          <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </div>
        {badge && <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs ${badgeColor}`}>{badge}</span>}
      </motion.div>
    </Link>
  );
}