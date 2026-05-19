'use client';

import { BarChart3, TrendingUp, Users, MousePointerClick, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Realistic mock data for the 30-day chart
const chartData = Array.from({ length: 30 }).map((_, i) => {
  const day = i + 1;
  const base = 20000;
  const growth = i * 1500;
  const noise = Math.random() * 8000 - 4000;
  return {
    date: `Day ${day}`,
    impressions: Math.floor(base + growth + noise),
  };
});

// TYPESCRIPT OVERRIDE: Added ': any' to bypass strict Vercel variant checking
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12 relative">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics Engine</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-yellow-500" />
            Performance telemetry and growth trajectories.
          </p>
        </div>
        
        {/* Dark Mode Toggle Group */}
        <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 shadow-sm backdrop-blur-md">
          <button className="px-4 py-1.5 text-xs font-bold bg-zinc-800 text-white rounded-lg shadow-sm border border-zinc-700/50">30 Days</button>
          <button className="px-4 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">90 Days</button>
          <button className="px-4 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">All Time</button>
        </div>
      </motion.div>

      {/* Top Metric Cards */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <MetricCard title="Total Impressions" value="642.5K" trend="+24.5%" isUp={true} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard title="Network Growth" value="+2,401" trend="+12.2%" isUp={true} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard title="Engagement Rate" value="6.4%" trend="-0.8%" isUp={false} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard title="Profile Traffic" value="402" trend="+18.4%" isUp={true} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Impression Velocity</h3>
              <p className="text-xs font-medium text-zinc-500">Rolling 30-day cumulative reach</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {/* Dark mode grid lines */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 5000', 'dataMax + 5000']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#facc15" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorImpressions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Sidebar: Assets */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          className="xl:col-span-1 bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl shadow-xl p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/80 pb-4">
            <Activity className="h-5 w-5 text-zinc-500" />
            <h3 className="text-lg font-bold text-white">High-Performing Assets</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <AssetCard 
              tag="Trend Hijack" title="Why solo developers will soon operate as 10-person agencies..." 
              views="142.5K" er="4.2%" 
            />
            <AssetCard 
              tag="Authority" title="I spent 4,000 hours mastering deep learning architectures..." 
              views="89.2K" er="5.1%" 
            />
            <AssetCard 
              tag="Contrarian" title="Stop using LangChain for simple RAG pipelines." 
              views="64.8K" er="7.8%" 
            />
          </div>
          
          <button className="w-full mt-6 bg-zinc-900 border border-zinc-800 text-zinc-300 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
            <Calendar className="h-4 w-4" /> View Full History
          </button>
        </motion.div>

      </div>
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, trend, isUp }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-[#121214]/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 shadow-xl hover:border-zinc-600 transition-colors cursor-pointer"
    >
      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{value}</h4>
      <div className="flex items-end justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</span>
        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          <ArrowUpRight className={`h-3 w-3 ${!isUp && 'rotate-90'}`} /> {trend}
        </div>
      </div>
    </motion.div>
  );
}

function AssetCard({ tag, title, views, er }: any) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-900 hover:border-zinc-600 transition-colors group cursor-pointer shadow-inner">
      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 mb-2 inline-block">
        {tag}
      </span>
      <h4 className="text-sm font-bold text-zinc-300 leading-snug mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">
        {title}
      </h4>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-zinc-500">{views} views</span>
        <span className="text-emerald-400 flex items-center gap-1"><Activity className="h-3 w-3" /> {er} ER</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-zinc-700">
        <p className="mb-1 text-zinc-400 font-mono">{payload[0].payload.date}</p>
        <p className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)]"></span>
          {payload[0].value.toLocaleString()} impressions
        </p>
      </div>
    );
  }
  return null;
}