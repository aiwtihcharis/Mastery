import React from 'react';
import { X, CheckCircle, Youtube, Code2 } from 'lucide-react';
import { Phase } from '../types';

interface PhaseModalProps {
  phase: Phase;
  completedTasks: string[];
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
}

const PhaseModal: React.FC<PhaseModalProps> = ({ phase, completedTasks, onClose, onToggleTask }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-[#09090b] w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/10 custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <div className="p-8 md:p-10 space-y-8">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 block font-['Inter_Tight']">Module {phase.id}</span>
            <h2 className="text-4xl font-medium text-white font-['Inter_Tight'] mb-2">{phase.title}</h2>
            <p className="text-zinc-400 font-['Bricolage_Grotesque'] text-lg">{phase.project.desc}</p>
          </div>
          <div className="flex gap-3">
             <a href={phase.videoUrl} target="_blank" rel="noreferrer" className="flex-1 bg-white text-black h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm font-['Inter_Tight'] hover:bg-zinc-200 transition-colors">
                <Youtube size={16} /> Watch Tutorial
             </a>
             <button className="flex-1 bg-zinc-900 text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm font-['Inter_Tight'] border border-white/10 hover:bg-zinc-800 transition-colors">
                <Code2 size={16} /> View Repo
             </button>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-['Inter_Tight']">Curriculum</h3>
            {phase.tasks.map((task, i) => {
              const isDone = completedTasks.includes(task.id);
              return (
                <div 
                  key={task.id} 
                  onClick={() => onToggleTask(task.id)}
                  className={`flex gap-4 p-4 rounded-xl border items-center cursor-pointer transition-all active:scale-[0.99] ${isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-900/30 border-white/5 hover:border-white/10'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-emerald-500 text-black' : 'bg-black border border-white/10 text-zinc-600'}`}>
                    {isDone ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm font-['Instrument_Sans'] ${isDone ? 'text-white' : 'text-zinc-300'}`}>{task.goal}</h4>
                    <p className="text-zinc-500 text-xs">{task.activity}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseModal;