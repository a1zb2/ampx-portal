'use client';

import { Calendar as CalendarIcon, Clock, MoreHorizontal, Send, Sparkles, Plus, CalendarDays } from 'lucide-react';

const SCHEDULED_POSTS = [
  {
    id: 'sch-1',
    date: 'Today, 9:00 AM',
    status: 'Next Up',
    title: 'Why solo developers will soon operate as 10-person agencies...',
    type: 'Trend Hijack',
    platform: 'LinkedIn'
  },
  {
    id: 'sch-2',
    date: 'Tomorrow, 8:15 AM',
    status: 'Scheduled',
    title: 'I spent 4,000 hours mastering deep learning architectures...',
    type: 'Authority',
    platform: 'LinkedIn'
  },
  {
    id: 'sch-3',
    date: 'Thursday, 12:30 PM',
    status: 'Scheduled',
    title: 'Stop using LangChain for simple RAG pipelines.',
    type: 'Contrarian',
    platform: 'LinkedIn'
  },
  {
    id: 'sch-4',
    date: 'Friday, 9:00 AM',
    status: 'Drafting',
    title: 'The real reason companies are forcing RTO (it is a stealth layoff strategy).',
    type: 'Trend Hijack',
    platform: 'LinkedIn'
  }
];

export default function ContentCalendar() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Content Calendar</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-yellow-500" />
            Orchestrate and monitor your automated deployment schedule.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-50 transition-all shadow-sm">
            Sync External
          </button>
          <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-400 hover:text-black transition-all shadow-md">
            <Plus className="h-4 w-4" /> Schedule Post
          </button>
        </div>
      </div>

      {/* Calendar View / Timeline */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Timeline Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-100 bg-zinc-50/50 text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <div className="col-span-3 pl-2">Deployment Time</div>
          <div className="col-span-6">Asset Title</div>
          <div className="col-span-2">Format</div>
          <div className="col-span-1 text-right pr-2">Actions</div>
        </div>

        {/* Timeline Rows */}
        <div className="divide-y divide-zinc-100">
          {SCHEDULED_POSTS.map((post) => (
            <div key={post.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-50/50 transition-colors group">
              
              {/* Date & Status */}
              <div className="col-span-3 flex flex-col gap-1 pl-2">
                <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" /> {post.date}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider w-max px-2 py-0.5 rounded-md flex items-center gap-1
                  ${post.status === 'Next Up' ? 'bg-yellow-100 text-yellow-700' : 
                    post.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-600' : 
                    'bg-zinc-100 text-zinc-500'}`}
                >
                  {post.status === 'Next Up' && <Send className="h-2.5 w-2.5" />}
                  {post.status}
                </span>
              </div>

              {/* Title */}
              <div className="col-span-6 pr-4">
                <p className="text-sm font-bold text-zinc-800 line-clamp-1 group-hover:text-black transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {post.platform}
                  </span>
                </div>
              </div>

              {/* Format / Type */}
              <div className="col-span-2">
                <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-zinc-400" />
                  {post.type}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end pr-2">
                <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-center">
          <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Load Next 7 Days
          </button>
        </div>
      </div>

    </div>
  );
}