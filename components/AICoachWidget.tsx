import React, { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import HoverBeamCard from './HoverBeamCard';
import { getAICoachingResponse } from '../services/ai';
import { Phase, UserStats } from '../types';

interface AICoachWidgetProps {
  phase: Phase;
  userStats: UserStats;
}

const AICoachWidget: React.FC<AICoachWidgetProps> = ({ phase, userStats }) => {
  const [tip, setTip] = useState("System ready. Neural link active.");
  const [loading, setLoading] = useState(false);

  const triggerHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const getTip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(20);
    setLoading(true);
    
    const prompt = `Give a high-impact, advanced engineering tip specifically for the topic: ${phase.focus}. Make it sound like a senior principal engineer giving advice to a mid-level engineer. Short, punchy, actionable.`;
    const systemInstruction = "You are a CTO mentor at a FAANG company. Be concise, slightly cryptic but highly valuable.";
    
    const res = await getAICoachingResponse(prompt, systemInstruction, userStats);
    setTip(res);
    setLoading(false);
  };

  return (
    <HoverBeamCard className="p-8 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Brain size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-['Inter_Tight']">AI Coach</span>
        </div>
        <p className="text-xl text-zinc-200 leading-relaxed font-['Bricolage_Grotesque'] font-light italic">"{tip}"</p>
      </div>
      <button 
        onClick={getTip} 
        disabled={loading} 
        className="mt-8 self-start flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
      >
        {loading ? <span className="animate-pulse">Accessing Neural Link...</span> : <>Request Sync <Sparkles size={12} /></>}
      </button>
    </HoverBeamCard>
  );
};

export default AICoachWidget;