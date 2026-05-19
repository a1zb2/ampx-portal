'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, FileText, TrendingUp, MessageSquare, 
  ArrowUpRight, Users, Eye, MousePointerClick, Activity, Zap
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export default function DashboardOverview() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Good morning, Divyanshu</h1>
        <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
          <Activity className="h-4 w-4 text-yellow-500" />
          System online. Here is your operational telemetry for today.
        </p>
      </motion.div>

      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10 group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-zinc-800/80 text-[10px] font-bold tracking-widest uppercase text-zinc-300 mb-6 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            30-Day Trajectory
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            +312% Output Velocity
          </h2>
          <p className="text-zinc-400 font-medium max-w-lg leading-relaxed text-sm">
            Your content pipeline is currently outperforming baseline projections. Agent deployment is operating at maximum efficiency across all monitored sectors.
          </p>
        </div>
      </motion.div>

      {/* ACTIONABLE CLEARANCES GRID */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Required Clearances</h3>
          <span className="text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md">4 Pending Actions</span>
        </div>
        
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <motion.div variants={cardVariant} whileHover={{ y: -4, scale: 1.01 }} className="h-full">
            <Link href="/dashboard/clearance" className="block h-full bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5 shadow-xl hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
              <div className="flex items-start justify-between mb-6">
                <div className="h-10 w-10 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-yellow-400 shadow-inner">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-yellow-400 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Approvals</h4>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">3 posts awaiting review</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={cardVariant} whileHover={{ y: -4, scale: 1.01 }} className="h-full">
            <Link href="/dashboard/calendar" className="block h-full bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5 shadow-xl hover:border-zinc-500 transition-colors group flex flex-col justify-between">
              <div className="flex items-start justify-between mb-6">
                <div className="h-10 w-10 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shadow-inner">
                  <FileText className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Pipeline Engine</h4>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">5 drafts ready to deploy</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={cardVariant} whileHover={{ y: -4, scale: 1.01 }} className="h-full">
            <Link href="/dashboard/radar" className="block h-full bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5 shadow-xl hover:border-red-500/50 transition-colors group flex flex-col justify-between">
              <div className="flex items-start justify-between mb-6">
                <div className="h-10 w-10 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-red-400 shadow-inner">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-red-400 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Live Radar</h4>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">2 trending topics hijacked</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={cardVariant} whileHover={{ y: -4, scale: 1.01 }} className="h-full">
            <Link href="/dashboard/crm" className="block h-full bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5 shadow-xl hover:border-emerald-500/50 transition-colors group flex flex-col justify-between">
              <div className="flex items-start justify-between mb-6">
                <div className="h-10 w-10 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Engagement CRM</h4>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">1 priority target active</p>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </div>

      {/* LOWER SECTION: Telemetry & Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Performance Telemetry</h3>
            <Link href="/dashboard/analytics" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              View Analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard title="Total Impressions" value="47,231" trend="+12.5%" isUp={true} icon={Eye} />
            <MetricCard title="Network Growth" value="1,284" trend="+5.2%" isUp={true} icon={Users} />
            <MetricCard title="Engagement Rate" value="6.8%" trend="-0.4%" isUp={false} icon={MousePointerClick} />
            <MetricCard title="Profile Traffic" value="3,902" trend="+18.1%" isUp={true} icon={Activity} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">System Activity</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-5 shadow-lg h-[calc(100%-2rem)] flex flex-col">
            <div className="space-y-6 flex-1 mt-2">
              <LogItem icon={Zap} iconColor="text-yellow-400" bg="bg-yellow-500/10" title="AI Agent Draft Complete" time="2m ago" desc="Successfully drafted content from Concept Vault." />
              <LogItem icon={TrendingUp} iconColor="text-red-400" bg="bg-red-500/10" title="Trend Hijacked" time="15m ago" desc="Injected top Hacker News story into pipeline." />
              <LogItem icon={Users} iconColor="text-emerald-400" bg="bg-emerald-500/10" title="Competitor Synced" time="1h ago" desc="Reverse-engineered playbook for @samaltman." />
            </div>
            <button className="w-full mt-6 text-xs font-bold text-zinc-500 hover:text-white py-3 border-t border-zinc-800/60 transition-colors">
              View Full Log
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isUp, icon: Icon }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-xl hover:border-zinc-600 transition-colors group block cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</h4>
        <Icon className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
        <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md border ${isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {trend}
        </div>
      </div>
    </motion.div>
  );
}

// Fixed minor key issue
function LogItem({ icon: Icon, iconColor, bg, title, time, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className={`shrink-0 h-9 w-9 rounded-xl ${bg} flex items-center justify-center border border-zinc-800`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <div className="flex items-center justify-between gap-4">
          <h5 className="text-sm font-bold text-white">{title}</h5>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">{time}</span>
        </div>
        <p className="text-xs font-medium text-zinc-400 mt-1 line-clamp-1">{desc}</p>
      </div>
    </div>
  );
}