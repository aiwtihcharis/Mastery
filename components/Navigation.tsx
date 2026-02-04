import React from 'react';
import { Layout, Layers, Activity, Brain, TrendingUp, Settings } from 'lucide-react';
import { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems: { id: ViewType; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: Layout, label: 'Dash' },
    { id: 'roadmap', icon: Layers, label: 'Modules' },
    { id: 'ai_coach', icon: Brain, label: 'AI Coach' },
    { id: 'metrics', icon: Activity, label: 'Metrics' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const triggerHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  return (
    <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[95vw] sm:max-w-fit overflow-x-auto no-scrollbar">
      <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 px-2 py-2 rounded-full flex gap-1 shadow-2xl min-w-max">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { triggerHaptic(15); setView(item.id); }}
              className={`relative flex items-center gap-2 px-4 md:px-6 py-3 rounded-full transition-all duration-500 font-['Bricolage_Grotesque'] whitespace-nowrap ${
                isActive ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={isActive ? "text-emerald-400" : ""} />
              {isActive && <span className="text-sm font-semibold tracking-tight">{item.label}</span>}
            </button>
          );
        })}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;