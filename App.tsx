import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Activity, CheckCircle, ArrowRight, Brain, 
  ChevronRight, Code2, User, Bell, Shield, Trash2, X, Send,
  Moon, Sun, LogOut, Plus, Search, MessageSquare, Mic, Paperclip, File, XCircle, Camera,
  PanelLeftClose, PanelLeftOpen, Terminal, Database, Globe, Cpu, Zap, Target, Lock, AlertTriangle, WifiOff, Layout, History
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

// ... (Rest of components: DashboardView, etc. stay the same, they are pure presentation)

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

const AICoachView: React.FC<{ phases: Phase[], userStats: UserStats, user: FirebaseUser | null }> = ({ phases, userStats, user }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ type: 'ai' | 'user'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput("");
    setHistory(prev => [...prev, { type: 'user', text: userMsg }]);
    setIsTyping(true);

    const activePhase = phases.find(p => p.id === userStats.activePhaseId) || phases[0];
    const systemPrompt = `You are a Senior Principal Engineer acting as a mentor. The user is currently working on Phase ${activePhase.id}: ${activePhase.title} (${activePhase.focus}). Keep responses concise, elite, and highly technical yet encouraging.`;
    
    const response = await getAICoachingResponse(userMsg, systemPrompt, userStats);

    setIsTyping(false);
    setHistory(prev => [...prev, { type: 'ai', text: response }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      const recognition = new window.webkitSpeechRecognition();
      recognition.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
      };
      recognition.start();
    } else {
      alert("Voice input not supported.");
    }
  };

  const userName = user?.displayName?.split(' ')[0] || "Engineer";

  // Mock past chats - In a real app, this would come from Firestore
  const allChats = [
      "React Concurrent Mode Analysis", "V8 Garbage Collection", "System Design: Scale", 
      "CSS Grid vs Flexbox", "Postgres Indexing Strategies", "Next.js 15 Middleware"
  ];

  const filteredChats = allChats.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-white dark:bg-black text-zinc-900 dark:text-white z-50 flex overflow-hidden">
      
      {/* Sidebar (Collapsible) */}
      <div className={`
        relative h-full bg-zinc-50 dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/5 
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-50
        ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 opacity-0 md:opacity-100'}
        ${!isSidebarOpen && 'overflow-hidden'}
      `}>
        <div className="p-6 flex flex-col h-full min-w-[320px]">
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-widest text-xs uppercase">
                    <Database size={14} /> Neural Archives
                </div>
             </div>

             {/* New Chat & Search */}
             <div className="space-y-4 mb-8">
                 <button 
                    onClick={() => { setHistory([]); setInput(""); }}
                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                 >
                    <Plus size={18} /> New Session
                 </button>
                 
                 <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-200 dark:bg-zinc-900 rounded-xl py-3 pl-10 pr-4 text-sm outline-none border border-transparent focus:border-emerald-500/50 transition-all placeholder-zinc-500 font-['Bricolage_Grotesque']"
                    />
                 </div>
             </div>

             {/* History List */}
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
                 <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-2">Past Sessions</div>
                 {filteredChats.map((chat, i) => (
                     <div key={i} className="group p-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate font-['Bricolage_Grotesque']">{chat}</div>
                        <div className="text-[10px] text-zinc-400 mt-1">Today, 2:34 PM</div>
                     </div>
                 ))}
             </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full w-full bg-white dark:bg-black">
         
         {/* Top Bar for Sidebar Toggle */}
         <div className="absolute top-6 left-6 z-40">
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white border border-transparent hover:border-white/10 transition-all"
            >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
         </div>

         {/* Chat Area */}
         <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-32 pt-32 pb-48 flex flex-col custom-scrollbar">
            {history.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards pb-20">
                     <h1 className="text-6xl md:text-8xl font-['Inter_Tight'] font-medium tracking-tighter mb-6 text-zinc-900 dark:text-white">
                        Hey, <span className="text-zinc-400 dark:text-zinc-600 font-serif italic">{userName}.</span>
                     </h1>
                     <p className="text-xl md:text-2xl text-zinc-500 font-['Bricolage_Grotesque'] max-w-lg">
                        What engineering challenge shall we dismantle today?
                     </p>
                </div>
            ) : (
                <div className="space-y-10 max-w-4xl mx-auto w-full">
                    {history.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                            <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm ${msg.type === 'user' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-transparent' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                {msg.type === 'ai' && (
                                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Brain size={12} /> Architect
                                    </div>
                                )}
                                <p className="text-lg md:text-xl font-['Bricolage_Grotesque'] leading-relaxed whitespace-pre-wrap">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                         <div className="flex items-center gap-2 text-emerald-500 pl-6 animate-pulse">
                            <Brain size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Processing</span>
                         </div>
                    )}
                </div>
            )}
         </div>

         {/* Distinct Input Bar */}
         <div className="absolute bottom-8 left-0 right-0 px-6 z-40">
            <div className="max-w-3xl mx-auto">
                 {files.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 px-2 no-scrollbar">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 shrink-0 animate-in zoom-in duration-300">
                                <File size={12} />
                                <span className="max-w-[100px] truncate">{f.name}</span>
                                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}><XCircle size={12} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
                    <div className="relative bg-white/80 dark:bg-[#121212]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex items-center p-2 pl-8 border border-zinc-200 dark:border-white/10 focus-within:border-emerald-500/30 transition-all duration-500">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-white placeholder-zinc-400 h-16 font-['Bricolage_Grotesque']"
                        />
                         <div className="flex items-center gap-2 pr-2">
                            <label className="p-3 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full cursor-pointer text-zinc-400 hover:text-emerald-500 transition-colors">
                                <Paperclip size={20} />
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>
                            
                            <button 
                                type="button" 
                                onClick={handleVoiceInput}
                                className="p-3 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full cursor-pointer text-zinc-400 hover:text-emerald-500 transition-colors"
                            >
                                <Mic size={20} />
                            </button>

                            <button 
                                type="submit"
                                disabled={!input.trim()}
                                className="w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                            >
                                <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>
                </form>
                <div className="text-center mt-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    AI Architect v2.0 • Specialized in JS Engineering
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const RoadmapView: React.FC<{ phases: Phase[], onPhaseClick: (p: Phase) => void }> = ({ phases, onPhaseClick }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-zinc-900 dark:text-white font-['Inter_Tight']">Modules</h2>
        <p className="text-zinc-500 font-['Bricolage_Grotesque']">Select a module to view details.</p>
      </div>
      <div className="space-y-4">
        {phases.map((phase) => (
          <HoverBeamCard key={phase.id} className="p-1 cursor-pointer" onClick={() => onPhaseClick(phase)}>
            <div className="bg-white/50 dark:bg-[#050505]/80 backdrop-blur-sm rounded-[1.8rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${phase.progress === 100 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-zinc-500'}`}>
                {phase.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-['Instrument_Sans']">{phase.title}</h3>
                  {(phase.progress || 0) > 0 && (phase.progress || 0) < 100 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
                  )}
                  {phase.progress === 100 && <CheckCircle size={16} className="text-emerald-500" />}
                </div>
                <p className="text-zinc-500 text-sm font-['Bricolage_Grotesque'] max-w-xl">{phase.project.desc}</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden md:block">
                   <div className="text-zinc-900 dark:text-white font-mono text-lg">{phase.tasks.length}</div>
                   <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Tasks</div>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:border-white/20 transition-colors"><ChevronRight size={18} /></div>
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

const SettingsView: React.FC<{ user: FirebaseUser | null, theme: Theme, toggleTheme: () => void, customAvatar: string | null, setCustomAvatar: (url: string) => void }> = ({ user, theme, toggleTheme, customAvatar, setCustomAvatar }) => {
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
             // Immediate UI update via prop
             setCustomAvatar(base64);
             
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

  // New states for orchestrated loading
  const [loadingAnimationDone, setLoadingAnimationDone] = useState(false);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<AppMode>('auth'); // Default to auth if nothing else

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
       
       // Default target
       let target: AppMode = 'auth';

       if (u) {
         // User exists, determine if onboarding is needed
         let isOnboardingComplete = false;

         // 1. Check Local Storage (Fast)
         const localProfile = getLocalProfile(u.uid);
         if (localProfile?.onboardingComplete) {
            isOnboardingComplete = true;
         }

         // 2. Check Firestore (Robust, if online)
         if (db) {
            try {
              const profileRef = getUserProfileRef(u.uid);
              const snap = await getDoc(profileRef);
              if (snap.exists() && snap.data().onboardingComplete) {
                  isOnboardingComplete = true;
                  // Sync local
                  saveLocalProfile(u.uid, snap.data());
              } else if (!snap.exists()) {
                  // Profile doesn't exist, likely new user or partial signup
                  isOnboardingComplete = false;
              }
            } catch (e: any) {
              console.warn("Profile fetch failed, using local decision:", e);
              setIsOfflineMode(true);
            }
         }

         target = isOnboardingComplete ? 'app' : 'onboarding';
       }

       // If we are currently in loading state, just store the decision
       if (appMode === 'loading') {
          setPendingRoute(target);
          setAuthCheckDone(true);
       } else {
          // If we are already running (e.g. logout), switch immediately
          setAppMode(target);
       }
    });
  }, [appMode]); 

  // Transition Logic: ONLY when both Animation AND Auth are ready
  useEffect(() => {
    if (appMode === 'loading' && loadingAnimationDone && authCheckDone) {
      setAppMode(pendingRoute);
    }
  }, [loadingAnimationDone, authCheckDone, pendingRoute, appMode]);

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
      }
    );

    return () => {
        unsubProgress();
        unsubProfile();
    }
  }, [user]); 

  const triggerHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleTaskToggle = async (taskId: string) => {
    triggerHaptic(15);
    if (!user) return;

    const isDone = completedTasks.includes(taskId);
    const newTasks = isDone ? completedTasks.filter(id => id !== taskId) : [...completedTasks, taskId];
    
    setCompletedTasks(newTasks);
    saveLocalProgress(user.uid, newTasks);

    setPhases(CURRICULUM.map(phase => {
        const phaseTaskIds = phase.tasks.map(t => t.id);
        const doneCount = phaseTaskIds.filter(id => newTasks.includes(id)).length;
        return { ...phase, progress: Math.round((doneCount / phaseTaskIds.length) * 100) };
    }));

    if (isOfflineMode || !db) return;

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
    }, 600); 
  };

  const handleLoadingComplete = () => {
     setLoadingAnimationDone(true);
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
            <div className={`flex-1 flex flex-col transition-all duration-[600ms] ${isTransitioning ? 'blur-md opacity-0 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
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
                {currentView === 'settings' && <SettingsView user={user} theme={theme} toggleTheme={toggleTheme} customAvatar={customAvatar} setCustomAvatar={setCustomAvatar} />}
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