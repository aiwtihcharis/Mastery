import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black pt-20 pb-40 px-6 md:px-12 mt-20 animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold font-['Inter_Tight']">M</div>
             <span className="font-['Inter_Tight'] font-medium text-lg tracking-tight uppercase text-white">Mastery</span>
          </div>
          <p className="text-zinc-500 font-['Bricolage_Grotesque'] max-w-sm leading-relaxed">
            The premium vertical SaaS for JavaScript engineering excellence. 
            Architected for the top 1% of developers who demand mastery, not just competence.
          </p>
          <div className="flex items-center gap-4 text-zinc-500">
             <a href="#" className="hover:text-emerald-400 transition-colors"><Github size={20} /></a>
             <a href="#" className="hover:text-emerald-400 transition-colors"><Twitter size={20} /></a>
             <a href="#" className="hover:text-emerald-400 transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold font-['Inter_Tight'] mb-6">Platform</h4>
          <ul className="space-y-4 text-zinc-500 font-['Bricolage_Grotesque'] text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Curriculum</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AI Architect</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold font-['Inter_Tight'] mb-6">Legal</h4>
          <ul className="space-y-4 text-zinc-500 font-['Bricolage_Grotesque'] text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            <li className="flex items-center gap-2">
              <span>Made with</span>
              <Heart size={12} className="text-emerald-500 fill-emerald-500" />
              <span>in San Francisco</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-xs font-['Bricolage_Grotesque']">
        <p>&copy; {new Date().getFullYear()} Mastery Inc. All rights reserved.</p>
        <p>System Status: <span className="text-emerald-500">Operational</span></p>
      </div>
    </footer>
  );
};

export default Footer;