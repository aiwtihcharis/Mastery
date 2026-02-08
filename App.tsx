import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Activity, CheckCircle, ArrowRight, Brain, 
  ChevronRight, Code2, User, Bell, Shield, Trash2, X, Send,
  Moon, Sun, LogOut, Plus, Search, MessageSquare, Mic, Paperclip, File, XCircle, Camera,
  PanelLeftClose, PanelLeftOpen, Terminal, Database, Globe, Cpu, Zap, Target, Lock, AlertTriangle, WifiOff
} from 'lucide-react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';

import { CURRICULUM } from './constants';
import { Phase, ViewType, UserStats } from './types';
import { auth, db, APP_ID, loginEmail, registerEmail, updateUser } from './services/firebase';
import { getAICoachingResponse } from './services/ai';

import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import HoverBeamCard from './components/HoverBeamCard';
import PhaseModal from './components/PhaseModal';
import Footer from './components/Footer';

// --- Types ---
type Theme = 'dark' | 'light';
type AppMode = 'loading' | 'auth' | 'onboarding' | 'app';

// --- Helpers ---
const getUserProfileRef = (uid: string) => doc(db!, 'users', uid);
const getUserProgressRef = (uid: string) => doc(db!, 'users', uid, 'data', 'progress');

// --- Local Storage Helpers (Fallback for Permission Errors) ---
const saveLocalProgress = (uid: string, tasks: string[]) => {
  try { localStorage.setItem(`mastery_progress_${uid}`, JSON.stringify(tasks)); } catch (e) {}
};
const getLocalProgress = (uid: string): string[] => {
  try {
    const data = localStorage.getItem(`mastery_progress_${uid}`);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};
const saveLocalProfile = (uid: string, data: any) => {
  try { localStorage.setItem(`mastery_profile_${uid}`, JSON.stringify(data)); } catch (e) {}
};
const getLocalProfile = (uid: string) => {
  try {
    const data = localStorage.getItem(`mastery_profile_${uid}`);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
};

// --- View Components ---

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigMissing, setIsConfigMissing] = useState(false);

  useEffect(() => {
    if (!auth) setIsConfigMissing(true);
  }, []);

  const getFriendlyErrorMessage = (code: string) => {
    if (code.includes("Firebase not initialized")) return "System Offline: Configuration Missing";
    switch (code) {
      case 'auth/invalid-credential':
        return "Invalid email or password.";
      case 'auth/user-not-found':
        return "No account found with this email.";
      case 'auth/wrong-password':
        return "Incorrect password.";
      case 'auth/email-already-in-use':
        return "Email already registered.";
      case 'auth/weak-password':
        return "Password should be at least 6 characters.";
      case 'permission-denied':
        return "Access denied. Falling back to local mode.";
      default:
        return code;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await loginEmail(email, password);
      } else {
        await registerEmail(email, password);
      }
      // Navigation handled by onAuthStateChanged
    } catch (err: any) {
      console.error(err);
      const errorCode = err.code || err.message;
      setError(getFriendlyErrorMessage(errorCode));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 animate-in fade-in duration-1000">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black font-bold font-['Inter_Tight'] text-3xl mx-auto mb-6 shadow-2xl shadow-white/20">M</div>
           <h1 className="text-4xl font-medium text-white font-['Inter_Tight'] tracking-tight mb-2">
             {isLogin ? 'Welcome back' : 'Join the elite'}
           </h1>
           <p className="text-zinc-500 font-['Bricolage_Grotesque']">
             {isLogin ? 'Enter your credentials to access the terminal.' : 'Begin your journey to engineering mastery.'}
           </p>
        </div>

        <HoverBeamCard className="p-8">
           {isConfigMissing && (
             <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
               <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
               <div className="text-xs text-yellow-200/80 leading-relaxed">
                 <strong className="text-yellow-500 block mb-1">Configuration Required</strong>
                 Firebase is not initialized. Please ensure your environment variables are set correctly in <code className="bg-black/30 px-1 py-0.5 rounded text-white">services/firebase.ts</code>.
               </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-widest">Email Access</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors font-['Bricolage_Grotesque']"
                  placeholder="engineer@mastery.com"
                  disabled={isConfigMissing}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-widest">Passcode</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors font-['Bricolage_Grotesque']"
                  placeholder="••••••••"
                  disabled={isConfigMissing}
                />
              </div>
              
              {error && <div className="text-red-500 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}

              <button 
                type="submit" 
                disabled={loading || isConfigMissing}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Create Account')}
              </button>
           </form>
           
           <div className="mt-6 text-center">
             <button 
               onClick={() => { setIsLogin(!isLogin); setError(''); }}
               className="text-zinc-500 text-sm hover:text-white transition-colors"
               disabled={isConfigMissing}
             >
               {isLogin ? "No account? Apply for access" : "Already verified? Log in"}
             </button>
           </div>
        </HoverBeamCard>
      </div>
    </div>
  );
};

const OnboardingView: React.FC<{ user: FirebaseUser, onComplete: () => void }> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user.displayName || '',
    role: '',
    focus: '',
    commitment: ''
  });

  const nextStep = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save data
      const finalData = { ...formData, onboardingComplete: true, updatedAt: new Date().toISOString() };
      
      // 1. Save Locally (Always works)
      saveLocalProfile(user.uid, finalData);

      // 2. Try Cloud
      if (user && db) {
        try {
          await updateUser(user, formData.name);
          await setDoc(getUserProfileRef(user.uid), {
            ...finalData,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.warn("Onboarding Cloud Save Failed (using local fallback):", e);
        }
      }
      onComplete();
    }
  };

  const OptionBtn = ({ label, value, current, field }: any) => (
    <button 
      onClick={() => setFormData(prev => ({ ...prev, [field]: value }))}
      className={`w-full p-4 rounded-xl border text-left transition-all ${
        current === value 
        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
        : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
      }`}
    >
      <div className="font-bold">{label}</div>
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
       <div className="w-full max-w-lg space-y-8">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
            <span>Initialization</span>
            <span>Step {step} / 4</span>
          </div>
          
          <div className="h-1 bg-zinc-900 w-full rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${step * 25}%` }} />
          </div>

          <div className="space-y-6">
             {step === 1 && (
               <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                  <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Identification</h2>
                  <p className="text-zinc-500">How should the system address you?</p>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                    className="w-full bg-transparent border-b border-white/20 py-4 text-2xl text-white outline-none focus:border-emerald-500 placeholder-zinc-700"
                    placeholder="Enter your name"
                    autoFocus
                  />
               </div>
             )}

            {step === 2 && (
               <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-500">
                  <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Current Status</h2>
                  <p className="text-zinc-500">Select your current engineering level.</p>
                  <div className="space-y-3">
                    <OptionBtn label="Junior Engineer (0-2 Years)" value="junior" current={formData.role} field="role" />
                    <OptionBtn label="Mid-Level Engineer (2-5 Years)" value="mid" current={formData.role} field="role" />
                    <OptionBtn label="Senior Engineer (5+ Years)" value="senior" current={formData.role} field="role" />
                  </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-500">
                  <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Primary Focus</h2>
                  <p className="text-zinc-500">What is your main technical objective?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setFormData(p => ({...p, focus: 'frontend'}))} className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${formData.focus === 'frontend' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}>
                       <Terminal size={24} /> <span className="font-bold">Frontend Mastery</span>
                    </button>
                    <button onClick={() => setFormData(p => ({...p, focus: 'fullstack'}))} className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${formData.focus === 'fullstack' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}>
                       <Database size={24} /> <span className="font-bold">Full Stack Arch</span>
                    </button>
                  </div>
               </div>
             )}

            {step === 4 && (
               <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-500">
                  <h2 className="text-3xl font-medium text-white font-['Inter_Tight']">Commitment Protocol</h2>
                  <p className="text-zinc-500">Set your learning intensity.</p>
                  <div className="space-y-3">
                    <OptionBtn label="Casual (2-3 hours/week)" value="casual" current={formData.commitment} field="commitment" />
                    <OptionBtn label="Serious (5-10 hours/week)" value="serious" current={formData.commitment} field="commitment" />
                    <OptionBtn label="Hardcore (15+ hours/week)" value="hardcore" current={formData.commitment} field="commitment" />
                  </div>
               </div>
             )}
          </div>

          <div className="flex justify-end pt-8">
             <button 
               onClick={nextStep}
               disabled={
                 (step === 1 && !formData.name) ||
                 (step === 2 && !formData.role) ||
                 (step === 3 && !formData.focus) ||
                 (step === 4 && !formData.commitment)
               }
               className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {step === 4 ? 'Initialize Workspace' : 'Continue'} <ArrowRight size={16} />
             </button>
          </div>
       </div>
    </div>
  );
};

const DashboardView: React.FC<{ phases: Phase[], userStats: UserStats, setView: (v: ViewType) => void, setSelectedPhase: (p: Phase) => void }> = ({ phases, userStats, setView, setSelectedPhase }) => {
  const activePhase = phases.find(p => (p.progress || 0) < 100) || phases[phases.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-medium text-zinc-900 dark:text-white tracking-tight font-['Inter_Tight'] mb-3">Workspace</h1>
          <p className="text-zinc-500 font-['Bricolage_Grotesque'] text-lg">Real-time status of your engineering path.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Syncing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HoverBeamCard className="lg:col-span-2 p-10 cursor-pointer" onClick={() => setSelectedPhase(activePhase)}>
          <div className="flex justify-between items-start mb-12">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">Target Module</span>
              <h2 className="text-4xl font-medium text-zinc-900 dark:text-white font-['Inter_Tight'] mb-2">{activePhase.title}</h2>
              <p className="text-zinc-500 font-['Bricolage_Grotesque']">{activePhase.subtitle}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play size={20} fill="currentColor" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end text-sm font-mono">
              <span className="text-zinc-500">PROGRESS_LOAD</span>
              <span className="text-emerald-600 dark:text-emerald-400">{activePhase.progress || 0}%</span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 w-full rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${activePhase.progress || 0}%` }} />
            </div>
          </div>
        </HoverBeamCard>
        
        {/* Quick AI Access */}
        <HoverBeamCard className="p-8 h-full flex flex-col justify-between cursor-pointer" onClick={() => setView('ai_coach')}>
          <div>
             <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Brain size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-['Inter_Tight']">AI Architect</span>
            </div>
            <p className="text-xl text-zinc-600 dark:text-zinc-200 leading-relaxed font-['Bricolage_Grotesque'] font-light">
              Get personalized engineering advice based on your current progress.
            </p>
          </div>
          <div className="mt-8 self-start flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors">
             Open Module <ArrowRight size={12} />
          </div>
        </HoverBeamCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HoverBeamCard className="p-8 cursor-pointer" onClick={() => setView('metrics')}>
          <Activity size={20} className="text-zinc-500 mb-6" />
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{userStats.velocity}%</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Global Velocity</div>
        </HoverBeamCard>
        <HoverBeamCard className="p-8 cursor-pointer" onClick={() => setView('progress')}>
          <CheckCircle size={20} className="text-emerald-500 mb-6" />
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{userStats.completedCount}</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Tasks Finalized</div>
        </HoverBeamCard>
        <HoverBeamCard className="lg:col-span-2 p-8 flex items-center justify-between cursor-pointer group" onClick={() => setView('roadmap')}>
          <div>
            <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Upcoming Milestone</div>
            <div className="text-xl font-medium text-zinc-900 dark:text-white">Full-Stack SaaS Launch</div>
          </div>
          <div className="w-12 h-12 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:border-emerald-500/50 transition-all"><ArrowRight size={20} /></div>
        </HoverBeamCard>
      </div>
    </div>
  );
};

const MetricsView: React.FC<{ userStats: UserStats, completedTasks: string[] }> = ({ userStats, completedTasks }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-zinc-900 dark:text-white font-['Inter_Tight']">Metrics</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Analysis of your engineering performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <HoverBeamCard className="p-8">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Velocity</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-zinc-900 dark:text-white font-['Inter_Tight']">{userStats.velocity}%</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">+12% this week</span>
            </div>
            <p className="text-zinc-500 text-sm">Completion rate across all available modules.</p>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${userStats.velocity}%` }} />
            </div>
         </HoverBeamCard>

         <HoverBeamCard className="p-8">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Focus Score</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-zinc-900 dark:text-white font-['Inter_Tight']">92</span>
              <span className="text-zinc-500 text-sm font-bold">/ 100</span>
            </div>
            <p className="text-zinc-500 text-sm">Based on consistency and task completion frequency.</p>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `92%` }} />
            </div>
         </HoverBeamCard>
      </div>
    </div>
  );
};

const ProgressView: React.FC<{ phases: Phase[], completedTasks: string[] }> = ({ phases, completedTasks }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-zinc-900 dark:text-white font-['Inter_Tight']">Progress Log</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Detailed timeline of your achievements.</p>
      </div>

      <div className="space-y-1">
        {phases.map((phase) => (
           <div key={phase.id} className="relative pl-8 pb-8 border-l border-zinc-200 dark:border-white/10 last:pb-0 last:border-0">
              <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${phase.progress === 100 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'}`} />
              
              <div className="mb-4">
                 <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-['Instrument_Sans']">{phase.title}</h3>
                 <p className="text-zinc-500 text-sm">{phase.subtitle}</p>
              </div>

              <div className="space-y-3">
                 {phase.tasks.map(task => {
                    const isDone = completedTasks.includes(task.id);
                    return (
                       <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between ${isDone ? 'bg-emerald-50/50 dark:bg-zinc-900/30 border-emerald-500/20' : 'bg-transparent border-zinc-200 dark:border-white/5 opacity-50'}`}>
                          <div className="flex items-center gap-3">
                             {isDone ? <CheckCircle size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-zinc-400 dark:border-zinc-600" />}
                             <span className={isDone ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-600'}>{task.goal}</span>
                          </div>
                          {isDone && <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Completed</span>}
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

const RoadmapView: React.FC<{ phases: Phase[], onPhaseClick: (p: Phase) => void }> = ({ phases, onPhaseClick }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-zinc-900 dark:text-white font-['Inter_Tight']">Curriculum Roadmap</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Your path to engineering mastery.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {phases.map((phase) => (
           <HoverBeamCard key={phase.id} className="p-8 cursor-pointer group" onClick={() => onPhaseClick(phase)}>
              <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:text-white group-hover:bg-emerald-500 transition-colors">
                    {phase.id}
                 </div>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${phase.progress === 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    {phase.progress === 100 ? 'Completed' : `${phase.progress || 0}% Done`}
                 </div>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{phase.title}</h3>
              <p className="text-zinc-500 text-sm mb-6 h-10 line-clamp-2">{phase.project.desc}</p>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Code2 size={14} /> <span>{phase.focus}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <CheckCircle size={14} /> <span>{phase.tasks.length} Core Tasks</span>
                 </div>
              </div>
           </HoverBeamCard>
        ))}
      </div>
    </div>
  );
};

const AICoachView: React.FC<{ phases: Phase[], userStats: UserStats, user: FirebaseUser | null }> = ({ phases, userStats, user }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
      { role: 'ai', text: "Systems online. I am your engineering lead. What technical challenge are we solving today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
        const activePhase = phases.find(p => p.id === userStats.activePhaseId) || phases[0];
        const systemContext = `You are a Senior Principal Engineer acting as a mentor. The user is currently working on Phase ${activePhase.id}: ${activePhase.title} (${activePhase.focus}).`;
        
        const response = await getAICoachingResponse(userMsg, systemContext, userStats);
        
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', text: "Connection interrupted. Please retry." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-24 pb-8 px-4 md:px-0 max-w-4xl mx-auto">
       <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar pb-4">
          {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-white'}`}>
                   {msg.role === 'ai' ? <Brain size={16} /> : <User size={16} />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed font-['Bricolage_Grotesque'] shadow-lg ${msg.role === 'ai' ? 'bg-zinc-900/80 border border-white/5 text-zinc-300' : 'bg-white text-black font-medium'}`}>
                   {msg.text}
                </div>
             </div>
          ))}
          {loading && (
             <div className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                   <Activity size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-zinc-500 text-xs flex items-center gap-2">
                   Analyzing architecture...
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>
       
       <div className="mt-4 pt-4 border-t border-white/5">
          <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
             <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Ask about architecture, code patterns, or career growth..."
               className="relative w-full bg-black border border-white/10 rounded-xl pl-6 pr-14 py-4 text-white placeholder-zinc-600 focus:border-emerald-500/50 outline-none transition-all font-['Bricolage_Grotesque']"
             />
             <button 
               onClick={handleSend}
               disabled={loading || !input.trim()}
               className="absolute right-2 top-2 p-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
             >
               <Send size={18} />
             </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            Powered by Gemini 3 Flash • Confidential Engineering Data
          </div>
       </div>
    </div>
  );
};

const SettingsView: React.FC<{ user: FirebaseUser | null, theme: Theme, toggleTheme: () => void, customAvatar: string | null }> = ({ user, theme, toggleTheme, customAvatar }) => {
  const [name, setName] = useState(user?.displayName || "");
  const [msg, setMsg] = useState("");

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateUser(user, name);
      saveLocalProfile(user.uid, { ...getLocalProfile(user.uid), name }); // Local
      setMsg("Profile updated.");
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      if (file.size > 500000) {
          setMsg("Image too large. Max 500KB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
          try {
             const base64 = reader.result as string;
             // Local Update
             const currentLocal = getLocalProfile(user.uid) || {};
             saveLocalProfile(user.uid, { ...currentLocal, avatar: base64 });
             
             // Cloud Update (Try)
             await setDoc(getUserProfileRef(user.uid), {
                 avatar: base64,
                 lastUpdated: serverTimestamp()
             }, { merge: true });
             
             setMsg("Avatar updated.");
          } catch (error) {
             console.warn("Cloud Avatar Update Failed (Local only)", error);
             setMsg("Avatar updated locally.");
          }
      };
      reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-zinc-900 dark:text-white font-['Inter_Tight']">Settings</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Manage your preferences and data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HoverBeamCard className="p-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden border-2 border-transparent group-hover:border-emerald-500 transition-all">
                                <img src={customAvatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.uid}`} className="w-full h-full object-cover" alt="Profile" />
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                <Camera size={20} className="text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{user?.email}</h3>
                            <p className="text-zinc-500 text-xs">Premium Member</p>
                            {msg && <p className="text-emerald-400 text-xs mt-1">{msg}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase font-bold">Display Name</label>
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500"
                             />
                             <button onClick={handleUpdateProfile} className="bg-emerald-500 text-black px-4 rounded-xl font-bold text-sm">Save</button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm mt-4 hover:text-red-300">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
          </HoverBeamCard>

          <div className="space-y-6">
             <div className="p-6 bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    <div className="flex flex-col">
                        <span className="font-medium">Interface Theme</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${theme === 'dark' ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>

             <div className="p-6 bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <Bell size={20} />
                    <span>Notifications</span>
                </div>
                <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full" />
                </div>
             </div>
             
             <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-3xl">
                <h3 className="text-red-500 dark:text-red-400 font-bold mb-2">Danger Zone</h3>
                <p className="text-red-500/60 dark:text-red-400/60 text-sm mb-6">Irreversibly delete all progress and data.</p>
                <button className="flex items-center gap-2 text-red-600 dark:text-red-500 text-sm font-bold hover:text-red-400 transition-colors">
                <Trash2 size={16} /> Reset All Progress
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('loading');
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [phases, setPhases] = useState<Phase[]>(CURRICULUM);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Theme Handling
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Auth & Flow Control
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (u) => {
       setUser(u);
       if (!u) {
         setAppMode(prev => prev === 'loading' ? 'auth' : 'auth'); 
       } else {
         // Load initial local data to prevent flicker
         const localProfile = getLocalProfile(u.uid);
         if (localProfile?.onboardingComplete) setAppMode('app');
         else if (!localProfile) setAppMode('onboarding');

         if (db) {
            const profileRef = getUserProfileRef(u.uid);
            try {
              const snap = await getDoc(profileRef);
              if (snap.exists() && snap.data().onboardingComplete) {
                  setAppMode('app');
                  saveLocalProfile(u.uid, snap.data()); // Cache for next time
              } else if (!snap.exists()) {
                  setAppMode('onboarding');
              }
            } catch (e: any) {
              console.warn("Profile fetch failed (Permissions/Network):", e);
              setIsOfflineMode(true);
              // Fallback based on local data
              if (localProfile && localProfile.onboardingComplete) setAppMode('app');
              else setAppMode('onboarding');
            }
         } else {
             setAppMode('app'); 
         }
       }
    });
  }, []);

  // Sync Data (Cloud + Local)
  useEffect(() => {
    if (!user) return;

    // 1. Always load local data first (Instant)
    const localTasks = getLocalProgress(user.uid);
    setCompletedTasks(localTasks);
    
    // Update phases visuals immediately based on local data
    setPhases(prev => prev.map(phase => {
        const phaseTaskIds = phase.tasks.map(t => t.id);
        const doneCount = phaseTaskIds.filter(id => localTasks.includes(id)).length;
        return { ...phase, progress: Math.round((doneCount / phaseTaskIds.length) * 100) };
    }));

    const localProfile = getLocalProfile(user.uid);
    if (localProfile?.avatar) setCustomAvatar(localProfile.avatar);

    if (!db) { setIsOfflineMode(true); return; }
    
    // 2. Try to Sync with Cloud
    const unsubProgress = onSnapshot(getUserProgressRef(user.uid), 
      (docSnap) => {
        setIsOfflineMode(false);
        const data = docSnap.exists() ? docSnap.data() : { completedTasks: [] };
        const done: string[] = data.completedTasks || [];
        
        // Update State
        setCompletedTasks(done);
        
        // Update Local Storage (Keep in sync)
        saveLocalProgress(user.uid, done);

        // Update Phases
        setPhases(CURRICULUM.map(phase => {
          const phaseTaskIds = phase.tasks.map(t => t.id);
          const doneCount = phaseTaskIds.filter(id => done.includes(id)).length;
          return { ...phase, progress: Math.round((doneCount / phaseTaskIds.length) * 100) };
        }));
      },
      (error) => {
        console.warn("Firestore Progress Sync Error (Permissions/Offline):", error);
        setIsOfflineMode(true);
      }
    );

    const unsubProfile = onSnapshot(getUserProfileRef(user.uid), 
      (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setCustomAvatar(data.avatar);
            saveLocalProfile(user.uid, data);
        }
      },
      (error) => {
        console.warn("Firestore Profile Sync Error (Permissions/Offline):", error);
        // We don't set offline mode here to avoid overwriting progress state, just warn
      }
    );

    return () => {
        unsubProgress();
        unsubProfile();
    }
  }, [user]); // Removed completedTasks dependency to prevent loops

  const triggerHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleTaskToggle = async (taskId: string) => {
    triggerHaptic(15);
    if (!user) return;

    // 1. Optimistic UI Update & Local Storage
    const isDone = completedTasks.includes(taskId);
    const newTasks = isDone ? completedTasks.filter(id => id !== taskId) : [...completedTasks, taskId];
    
    setCompletedTasks(newTasks);
    saveLocalProgress(user.uid, newTasks);

    // Update derived phases state instantly for UI responsiveness
    setPhases(CURRICULUM.map(phase => {
        const phaseTaskIds = phase.tasks.map(t => t.id);
        const doneCount = phaseTaskIds.filter(id => newTasks.includes(id)).length;
        return { ...phase, progress: Math.round((doneCount / phaseTaskIds.length) * 100) };
    }));

    if (isOfflineMode || !db) return;

    // 2. Try Cloud Update
    try {
      await setDoc(getUserProgressRef(user.uid), { 
        completedTasks: isDone ? arrayRemove(taskId) : arrayUnion(taskId),
        lastUpdated: serverTimestamp() 
      }, { merge: true });
    } catch (e: any) {
      console.warn("Task Cloud Save Failed (using local fallback):", e);
      if (e.code === 'permission-denied') setIsOfflineMode(true);
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
    }, 500); // Wait for transition
  };

  const handleLoadingComplete = () => {
     if (!user) {
        setAppMode('auth');
     }
  };

  const isAICoachActive = currentView === 'ai_coach';

  return (
    <div className={`min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-['Bricolage_Grotesque'] selection:bg-emerald-500 selection:text-black overflow-x-hidden ${isAICoachActive ? 'h-screen overflow-hidden' : ''} flex flex-col transition-colors duration-500`}>
      
      {appMode === 'loading' && <LoadingScreen onComplete={handleLoadingComplete} />}

      {appMode === 'auth' && <AuthView />}

      {appMode === 'onboarding' && user && <OnboardingView user={user} onComplete={() => setAppMode('app')} />}

      {appMode === 'app' && (
        <>
            {/* Header - Fixed & Outside Transform */}
            {!isAICoachActive && (
                <header className={`fixed top-0 w-full z-40 h-24 flex items-center justify-between px-6 md:px-12 bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none transition-opacity duration-700`}>
                <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => handleSetView('dashboard')}>
                    <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold font-['Inter_Tight'] shadow-2xl shadow-black/10 dark:shadow-white/20">M</div>
                    <span className="font-['Inter_Tight'] font-medium text-xl tracking-tight uppercase">Mastery</span>
                </div>
                
                <div className="flex items-center gap-4 pointer-events-auto">
                    {isOfflineMode && (
                        <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                            <WifiOff size={14} className="text-yellow-500" />
                            <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Local Mode</span>
                        </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 p-0.5 overflow-hidden">
                        <img src={customAvatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.uid}`} alt="User" className="w-full h-full rounded-full opacity-80 object-cover" />
                    </div>
                </div>
                </header>
            )}

            {/* Navigation - Logic for Positioning */}
            <div>
                <Navigation 
                    currentView={currentView} 
                    setView={handleSetView} 
                    position={isAICoachActive ? 'top' : 'bottom'} 
                />
            </div>

            {/* Main Content - Scaled/Transformed */}
            <div className={`flex-1 flex flex-col transition-all duration-500 ${isTransitioning ? 'blur-md opacity-0 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
                <main 
                    className={`flex-1 relative z-10 transition-all duration-500 ease-out ${
                        isAICoachActive ? 'pt-0' : 'pt-40 px-6 md:px-12 max-w-7xl mx-auto w-full'
                    }`}
                >
                {currentView === 'dashboard' && <DashboardView phases={phases} userStats={userStats} setView={handleSetView} setSelectedPhase={setSelectedPhase} />}
                {currentView === 'roadmap' && <RoadmapView phases={phases} onPhaseClick={setSelectedPhase} />}
                {currentView === 'metrics' && <MetricsView userStats={userStats} completedTasks={completedTasks} />}
                {currentView === 'ai_coach' && <AICoachView phases={phases} userStats={userStats} user={user} />}
                {currentView === 'progress' && <ProgressView phases={phases} completedTasks={completedTasks} />}
                {currentView === 'settings' && <SettingsView user={user} theme={theme} toggleTheme={toggleTheme} customAvatar={customAvatar} />}
                </main>
                
                {!isAICoachActive && <Footer />}
            </div>

            {/* Modal - Fixed & Outside Transform */}
            {selectedPhase && !isAICoachActive && (
                <PhaseModal 
                    phase={selectedPhase} 
                    completedTasks={completedTasks}
                    onToggleTask={handleTaskToggle}
                    onClose={() => setSelectedPhase(null)} 
                />
                )}
        </>
      )}
        
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #52525b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #71717a; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}