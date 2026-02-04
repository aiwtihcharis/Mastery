import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Activity, CheckCircle, ArrowRight, Brain, 
  ChevronRight, Code2, User, Bell, Shield, Trash2, X 
} from 'lucide-react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';

import { CURRICULUM } from './constants';
import { Phase, ViewType, UserStats } from './types';
import { auth, db, APP_ID } from './services/firebase';
import { getAICoachingResponse } from './services/ai';

import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import HoverBeamCard from './components/HoverBeamCard';
import PhaseModal from './components/PhaseModal';

// --- View Components ---

const DashboardView: React.FC<{ phases: Phase[], userStats: UserStats, setView: (v: ViewType) => void, setSelectedPhase: (p: Phase) => void }> = ({ phases, userStats, setView, setSelectedPhase }) => {
  const activePhase = phases.find(p => (p.progress || 0) < 100) || phases[phases.length - 1];

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-medium text-white tracking-tight font-['Inter_Tight'] mb-3">Workspace</h1>
          <p className="text-zinc-500 font-['Bricolage_Grotesque'] text-lg">Real-time status of your engineering path.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Syncing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HoverBeamCard className="lg:col-span-2 p-10 cursor-pointer" onClick={() => setSelectedPhase(activePhase)}>
          <div className="flex justify-between items-start mb-12">
            <div>
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">Target Module</span>
              <h2 className="text-4xl font-medium text-white font-['Inter_Tight'] mb-2">{activePhase.title}</h2>
              <p className="text-zinc-500 font-['Bricolage_Grotesque']">{activePhase.subtitle}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play size={20} fill="currentColor" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end text-sm font-mono">
              <span className="text-zinc-500">PROGRESS_LOAD</span>
              <span className="text-emerald-400">{activePhase.progress || 0}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 w-full rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${activePhase.progress || 0}%` }} />
            </div>
          </div>
        </HoverBeamCard>
        
        {/* Quick AI Access */}
        <HoverBeamCard className="p-8 h-full flex flex-col justify-between" onClick={() => setView('ai_coach')}>
          <div>
             <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Brain size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-['Inter_Tight']">AI Architect</span>
            </div>
            <p className="text-xl text-zinc-200 leading-relaxed font-['Bricolage_Grotesque'] font-light">
              Get personalized engineering advice based on your current progress.
            </p>
          </div>
          <div className="mt-8 self-start flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-white transition-colors">
             Open Module <ArrowRight size={12} />
          </div>
        </HoverBeamCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HoverBeamCard className="p-8" onClick={() => setView('metrics')}>
          <Activity size={20} className="text-zinc-500 mb-6" />
          <div className="text-3xl font-bold text-white mb-1">{userStats.velocity}%</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Global Velocity</div>
        </HoverBeamCard>
        <HoverBeamCard className="p-8" onClick={() => setView('progress')}>
          <CheckCircle size={20} className="text-emerald-500 mb-6" />
          <div className="text-3xl font-bold text-white mb-1">{userStats.completedCount}</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Tasks Finalized</div>
        </HoverBeamCard>
        <HoverBeamCard className="lg:col-span-2 p-8 flex items-center justify-between cursor-pointer group" onClick={() => setView('roadmap')}>
          <div>
            <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Upcoming Milestone</div>
            <div className="text-xl font-medium text-white">Full-Stack SaaS Launch</div>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-emerald-500/50 transition-all"><ArrowRight size={20} /></div>
        </HoverBeamCard>
      </div>
    </div>
  );
};

const RoadmapView: React.FC<{ phases: Phase[], onPhaseClick: (p: Phase) => void }> = ({ phases, onPhaseClick }) => {
  return (
    <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Modules</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Select a module to view details.</p>
      </div>
      <div className="space-y-4">
        {phases.map((phase) => (
          <HoverBeamCard key={phase.id} className="p-1 cursor-pointer" onClick={() => onPhaseClick(phase)}>
            <div className="bg-[#050505]/80 backdrop-blur-sm rounded-[1.8rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${phase.progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 border border-white/5 text-zinc-500'}`}>
                {phase.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white font-['Instrument_Sans']">{phase.title}</h3>
                  {(phase.progress || 0) > 0 && (phase.progress || 0) < 100 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                  )}
                  {phase.progress === 100 && <CheckCircle size={16} className="text-emerald-500" />}
                </div>
                <p className="text-zinc-500 text-sm font-['Bricolage_Grotesque'] max-w-xl">{phase.project.desc}</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden md:block">
                   <div className="text-white font-mono text-lg">{phase.tasks.length}</div>
                   <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Tasks</div>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-colors"><ChevronRight size={18} /></div>
              </div>
            </div>
          </HoverBeamCard>
        ))}
      </div>
    </div>
  );
};

const MetricsView: React.FC<{ userStats: UserStats, completedTasks: string[] }> = ({ userStats, completedTasks }) => {
  return (
    <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Metrics</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Analysis of your engineering performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <HoverBeamCard className="p-8">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Velocity</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white font-['Inter_Tight']">{userStats.velocity}%</span>
              <span className="text-emerald-400 text-sm font-bold">+12% this week</span>
            </div>
            <p className="text-zinc-500 text-sm">Completion rate across all available modules.</p>
            <div className="h-1 bg-zinc-800 w-full rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${userStats.velocity}%` }} />
            </div>
         </HoverBeamCard>

         <HoverBeamCard className="p-8">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Focus Score</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white font-['Inter_Tight']">92</span>
              <span className="text-zinc-500 text-sm font-bold">/ 100</span>
            </div>
            <p className="text-zinc-500 text-sm">Based on consistency and task completion frequency.</p>
            <div className="h-1 bg-zinc-800 w-full rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `92%` }} />
            </div>
         </HoverBeamCard>
      </div>

       <HoverBeamCard className="p-8">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Activity Log</h3>
          <div className="space-y-4">
             {[1, 2, 3].map((_, i) => (
               <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500"><Code2 size={14} /></div>
                     <div>
                       <div className="text-white text-sm font-medium">Completed Task: Async Patterns</div>
                       <div className="text-zinc-500 text-xs">Module 1 • The Foundation</div>
                     </div>
                  </div>
                  <div className="text-zinc-600 text-xs">2h ago</div>
               </div>
             ))}
          </div>
       </HoverBeamCard>
    </div>
  );
};

const AICoachView: React.FC<{ phases: Phase[], userStats: UserStats }> = ({ phases, userStats }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<{ type: 'ai' | 'user'; text: string }[]>([
    { type: 'ai', text: "Hello, Architect. I've analyzed your progress. You're moving quickly through Phase 1 but have paused on DOM Manipulation. How can I assist?" }
  ]);

  const triggerHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const askAI = async (topic: string) => {
    setIsTyping(true);
    triggerHaptic(10);
    const userMsg = { type: 'user' as const, text: topic };
    setHistory(prev => [...prev, userMsg]);

    const prompt = `User asks about "${topic}". They have completed ${userStats.completedCount} tasks. Give short, specific technical advice.`;
    const res = await getAICoachingResponse(prompt, "You are a senior mentor.", userStats);
    
    setIsTyping(false);
    setHistory(prev => [...prev, { type: 'ai', text: res }]);
  };

  return (
    <div className="pb-32 space-y-6 h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex-none">
          <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">AI Architect</h2>
          <p className="text-zinc-500 font-['Bricolage_Grotesque']">Your personal engineering mentor.</p>
       </div>

       <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {history.map((msg, i) => (
             <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed ${msg.type === 'user' ? 'bg-zinc-800 text-white' : 'bg-zinc-900/50 border border-white/10 text-zinc-300'}`}>
                   {msg.type === 'ai' && <Brain size={16} className="text-emerald-400 mb-2" />}
                   {msg.text}
                </div>
             </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100" />
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200" />
               </div>
             </div>
          )}
       </div>

       <div className="flex-none grid grid-cols-2 gap-3">
          {['Explain current phase', 'Debug help', 'Career advice', 'Code review'].map(topic => (
            <button 
              key={topic}
              onClick={() => askAI(topic)}
              className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-sm text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-all text-left"
            >
              {topic}
            </button>
          ))}
       </div>
    </div>
  );
};

const ProgressView: React.FC<{ phases: Phase[], completedTasks: string[] }> = ({ phases, completedTasks }) => {
  return (
    <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Progress Log</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Detailed timeline of your achievements.</p>
      </div>

      <div className="space-y-1">
        {phases.map((phase) => (
           <div key={phase.id} className="relative pl-8 pb-8 border-l border-white/10 last:pb-0 last:border-0">
              <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${phase.progress === 100 ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
              
              <div className="mb-4">
                 <h3 className="text-lg font-bold text-white font-['Instrument_Sans']">{phase.title}</h3>
                 <p className="text-zinc-500 text-sm">{phase.subtitle}</p>
              </div>

              <div className="space-y-3">
                 {phase.tasks.map(task => {
                    const isDone = completedTasks.includes(task.id);
                    return (
                       <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between ${isDone ? 'bg-zinc-900/30 border-emerald-500/20' : 'bg-transparent border-white/5 opacity-50'}`}>
                          <div className="flex items-center gap-3">
                             {isDone ? <CheckCircle size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-zinc-600" />}
                             <span className={isDone ? 'text-zinc-300' : 'text-zinc-600'}>{task.goal}</span>
                          </div>
                          {isDone && <span className="text-[10px] uppercase tracking-widest text-emerald-400">Completed</span>}
                       </div>
                    )
                 })}
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ user: FirebaseUser | null }> = ({ user }) => {
  return (
    <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Settings</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Manage your preferences and data.</p>
      </div>

      <div className="space-y-6">
         <HoverBeamCard className="p-8">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User size={24} />
               </div>
               <div>
                  <h3 className="text-white font-bold">Anonymous User</h3>
                  <p className="text-zinc-500 text-sm">ID: {user?.uid || 'Unknown'}</p>
               </div>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold">Manage Profile</button>
         </HoverBeamCard>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-3 text-zinc-300">
                  <Bell size={20} />
                  <span>Notifications</span>
               </div>
               <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full" />
               </div>
            </div>
             <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-3 text-zinc-300">
                  <Shield size={20} />
                  <span>Public Profile</span>
               </div>
               <div className="w-12 h-6 bg-zinc-800 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-500 rounded-full" />
               </div>
            </div>
         </div>

         <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-3xl">
            <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
            <p className="text-red-400/60 text-sm mb-6">Irreversibly delete all progress and data.</p>
            <button className="flex items-center gap-2 text-red-500 text-sm font-bold hover:text-red-400 transition-colors">
               <Trash2 size={16} /> Reset All Progress
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [phases, setPhases] = useState<Phase[]>(CURRICULUM);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auth Logic
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        // Simple auth for demo
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth error", e);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Data Sync Logic
  useEffect(() => {
    if (!user || !db) {
       // Manual local sync if no DB
       setPhases(CURRICULUM.map(phase => {
        const phaseTaskIds = phase.tasks.map(t => t.id);
        const doneCount = phaseTaskIds.filter(id => completedTasks.includes(id)).length;
        return { ...phase, progress: Math.round((doneCount / phaseTaskIds.length) * 100) };
       }));
       return;
    }
    const userDocRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'user_data', 'progress');
    
    return onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : { completedTasks: [] };
      const done: string[] = data.completedTasks || [];
      setCompletedTasks(done);

      setPhases(CURRICULUM.map(phase => {
        const phaseTaskIds = phase.tasks.map(t => t.id);
        const doneCount = phaseTaskIds.filter(id => done.includes(id)).length;
        return { ...phase, progress: Math.round((doneCount / phaseTaskIds.length) * 100) };
      }));
    });
  }, [user, completedTasks.length]);

  const triggerHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleTaskToggle = async (taskId: string) => {
    triggerHaptic(15);
    
    if (!user || !db) {
      setCompletedTasks(prev => {
        const isDone = prev.includes(taskId);
        return isDone ? prev.filter(id => id !== taskId) : [...prev, taskId];
      });
      return;
    }

    const userDocRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'user_data', 'progress');
    const isDone = completedTasks.includes(taskId);

    try {
      await setDoc(userDocRef, { 
        completedTasks: isDone ? arrayRemove(taskId) : arrayUnion(taskId),
        lastUpdated: serverTimestamp() 
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const userStats: UserStats = useMemo(() => {
    const totalTasks = CURRICULUM.reduce((acc, p) => acc + p.tasks.length, 0);
    const completedCount = completedTasks.length;
    return { 
      completedCount, 
      velocity: Math.round((completedCount / totalTasks) * 100) || 0,
      activePhaseId: phases.find(p => (p.progress || 0) < 100)?.id || 4
    };
  }, [completedTasks, phases]);

  const handleSetView = (view: ViewType) => {
    if (view === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setView(view);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Bricolage_Grotesque'] selection:bg-emerald-500 selection:text-black">
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <div className={`transition-all duration-1000 ${loading ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        <header className="fixed top-0 w-full z-40 h-24 flex items-center justify-between px-6 md:px-12 bg-gradient-to-b from-black to-transparent pointer-events-none">
           <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => handleSetView('dashboard')}>
             <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-black font-bold font-['Inter_Tight'] shadow-2xl shadow-white/20">M</div>
             <span className="font-['Inter_Tight'] font-medium text-xl tracking-tight uppercase">Mastery</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 p-0.5 pointer-events-auto">
             <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.uid || 'guest'}`} alt="User" className="w-full h-full rounded-full opacity-80" />
           </div>
        </header>

        <main className="relative z-10 pt-40 px-6 md:px-12 max-w-7xl mx-auto min-h-screen transition-all duration-300" style={{ opacity: isTransitioning ? 0 : 1, transform: isTransitioning ? 'scale(0.98)' : 'scale(1)' }}>
          {currentView === 'dashboard' && <DashboardView phases={phases} userStats={userStats} setView={handleSetView} setSelectedPhase={setSelectedPhase} />}
          {currentView === 'roadmap' && <RoadmapView phases={phases} onPhaseClick={setSelectedPhase} />}
          {currentView === 'metrics' && <MetricsView userStats={userStats} completedTasks={completedTasks} />}
          {currentView === 'ai_coach' && <AICoachView phases={phases} userStats={userStats} />}
          {currentView === 'progress' && <ProgressView phases={phases} completedTasks={completedTasks} />}
          {currentView === 'settings' && <SettingsView user={user} />}
        </main>

        <Navigation currentView={currentView} setView={handleSetView} />
        
        {selectedPhase && (
          <PhaseModal 
            phase={selectedPhase} 
            completedTasks={completedTasks}
            onToggleTask={handleTaskToggle}
            onClose={() => setSelectedPhase(null)} 
          />
        )}
      </div>
    </div>
  );
}