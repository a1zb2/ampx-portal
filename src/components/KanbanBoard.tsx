'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, MoreHorizontal, Clock, MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react';

const COLUMNS = [
  { id: 'col-1', title: '💡 Concept Vault' },
  { id: 'col-2', title: '🤖 Agent Drafting' },
  { id: 'col-3', title: '👀 Client Review' },
  { id: 'col-4', title: '🚀 Scheduled Pipeline' }
];

export default function KanbanBoard() {
  const supabase = createClient();
  const [board, setBoard] = useState(COLUMNS.map(col => ({ ...col, cards: [] as any[] })));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [draggedItem, setDraggedItem] = useState<{ colId: string; cardId: string } | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardText, setNewCardText] = useState('');

  // --- 1. FETCH REAL DATA ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && posts) {
          setBoard(COLUMNS.map(col => ({
            ...col,
            cards: posts.filter(post => post.status === col.id)
          })));
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  // --- 2. DRAG AND DROP LOGIC ---
  const handleDragStart = (e: React.DragEvent, colId: string, cardId: string) => {
    setDraggedItem({ colId, cardId });
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    (e.target as HTMLElement).classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { colId: sourceColId, cardId } = draggedItem;
    if (sourceColId === targetColId) return;

    // A. Optimistic UI Update for Column Move
    setBoard((prev) => {
      const newBoard = [...prev];
      const sourceColIndex = newBoard.findIndex(c => c.id === sourceColId);
      const targetColIndex = newBoard.findIndex(c => c.id === targetColId);

      const cardToMove = newBoard[sourceColIndex].cards.find(c => c.id === cardId);
      if (!cardToMove) return prev;

      newBoard[sourceColIndex] = {
        ...newBoard[sourceColIndex],
        cards: newBoard[sourceColIndex].cards.filter(c => c.id !== cardId)
      };

      newBoard[targetColIndex] = {
        ...newBoard[targetColIndex],
        cards: [cardToMove, ...newBoard[targetColIndex].cards]
      };

      return newBoard;
    });

    // B. Silent Database Update for Status
    await supabase
      .from('posts')
      .update({ status: targetColId })
      .eq('id', cardId);

    // --- 3. TRIGGER AI SYNTHESIS IF DROPPED IN DRAFTING (col-2) ---
    if (targetColId === 'col-2') {
      const cardToMove = board.flatMap(c => c.cards).find(c => c.id === cardId);
      
      if (cardToMove) {
        // Show drafting state in UI
        setBoard(prev => {
          const newBoard = [...prev];
          const colIndex = newBoard.findIndex(c => c.id === 'col-2');
          newBoard[colIndex] = {
            ...newBoard[colIndex],
            cards: newBoard[colIndex].cards.map(c => 
              c.id === cardId ? { ...c, text: '✨ Agent is drafting...', tag: 'Processing' } : c
            )
          };
          return newBoard;
        });

        try {
          // Send to our new Gemini 3.1 Flash-Lite endpoint
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: cardToMove.text,
              tone: 75, // Default parameters for now
              spice: 80,
              useBroetry: true
            })
          });

          const data = await res.json();

          if (data.draft) {
            // Update Database with AI draft
            await supabase
              .from('posts')
              .update({ text: data.draft, tag: 'Drafted' })
              .eq('id', cardId);

            // Update UI with final AI text
            setBoard(prev => {
              const newBoard = [...prev];
              const colIndex = newBoard.findIndex(c => c.id === 'col-2');
              newBoard[colIndex] = {
                ...newBoard[colIndex],
                cards: newBoard[colIndex].cards.map(c => 
                  c.id === cardId ? { ...c, text: data.draft, tag: 'Drafted' } : c
                )
              };
              return newBoard;
            });
          }
        } catch (error) {
          console.error("AI Generation Failed:", error);
        }
      }
    }
  };

  // --- 4. ADD NEW CONCEPT TO VAULT ---
  const submitNewCard = async () => {
    if (!newCardText.trim() || !user) {
      setIsAddingCard(false);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newDraft = {
      id: tempId,
      text: newCardText,
      tag: 'Raw Concept',
      status: 'col-1',
      date: 'Just now'
    };

    setBoard(prev => {
      const newBoard = [...prev];
      newBoard[0] = { ...newBoard[0], cards: [newDraft, ...newBoard[0].cards] };
      return newBoard;
    });

    setNewCardText('');
    setIsAddingCard(false);

    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        user_id: user.id, 
        text: newDraft.text, 
        status: newDraft.status,
        tag: newDraft.tag
      }])
      .select()
      .single();

    if (!error && data) {
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[0] = {
          ...newBoard[0],
          cards: newBoard[0].cards.map(c => c.id === tempId ? { ...c, id: data.id } : c)
        };
        return newBoard;
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-yellow-400" />
        <p className="text-sm font-medium tracking-widest uppercase">Syncing with Secure Vault...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 min-w-max">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Pipeline Engine</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Drag and drop concepts to automatically draft content.</p>
        </div>
        <button 
          onClick={() => setIsAddingCard(true)}
          className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-yellow-400 hover:text-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New Concept
        </button>
      </div>

      <div className="flex gap-6 min-w-max pb-8">
        {board.map((column) => (
          <div key={column.id} className="w-[340px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-zinc-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                {column.title}
                <span className="bg-white border border-zinc-200 text-zinc-600 text-xs py-0.5 px-2.5 rounded-full font-bold shadow-sm">
                  {column.cards.length}
                </span>
              </h3>
              <MoreHorizontal className="h-5 w-5 text-zinc-400 cursor-pointer hover:text-black transition-colors" />
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-zinc-200/50 rounded-xl p-3 flex-1 border border-zinc-200/60 flex flex-col gap-3 min-h-[500px] transition-colors"
            >
              {column.cards.map((card) => (
                <div 
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id, card.id)}
                  onDragEnd={handleDragEnd}
                  className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:border-zinc-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${card.tag === 'Processing' ? 'text-blue-700 bg-blue-50 border border-blue-100 animate-pulse' : 'text-yellow-700 bg-yellow-50 border border-yellow-100'}`}>
                      {card.tag}
                    </span>
                    {column.id === 'col-2' && <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />}
                    {column.id === 'col-4' && <Send className="h-4 w-4 text-[#0A66C2]" />}
                  </div>
                  
                  <p className="text-sm font-semibold text-zinc-800 leading-relaxed mb-5 group-hover:text-black transition-colors whitespace-pre-wrap">
                    {card.text}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto border-t border-zinc-100 pt-3 pointer-events-none">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-50 px-2 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5" />
                      {card.date || 'Just now'}
                    </div>
                  </div>
                </div>
              ))}

              {column.id === 'col-1' && (
                isAddingCard ? (
                  <div className="bg-white p-4 rounded-lg border-2 border-yellow-400 shadow-md mt-2 animate-in fade-in zoom-in duration-200">
                    <textarea
                      autoFocus
                      className="w-full text-sm font-semibold text-zinc-800 focus:outline-none resize-none bg-transparent"
                      rows={3}
                      placeholder="Enter a raw concept or paste a trend here..."
                      value={newCardText}
                      onChange={(e) => setNewCardText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitNewCard();
                        }
                      }}
                    />
                    <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-100">
                      <button onClick={submitNewCard} className="bg-zinc-900 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-yellow-400 hover:text-black transition-colors">
                        Save to Vault
                      </button>
                      <button onClick={() => setIsAddingCard(false)} className="text-zinc-500 text-xs font-semibold hover:text-black transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingCard(true)}
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-500 hover:text-black hover:bg-white border border-transparent hover:border-zinc-200 hover:shadow-sm py-3 rounded-lg transition-all w-full mt-2"
                  >
                    <Plus className="h-4 w-4" /> Add concept...
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}