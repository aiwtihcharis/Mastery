import React, { ReactNode } from 'react';

interface HoverBeamCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const HoverBeamCard: React.FC<HoverBeamCardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`group relative rounded-[2.5rem] bg-zinc-900/40 border border-white/5 overflow-hidden transition-all duration-500 hover:border-emerald-500/40 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative z-10 h-full">{children}</div>
    <style>{`
      .group:hover::after {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.05), transparent);
        transition: 0.8s;
        animation: beam 2s infinite;
        pointer-events: none;
      }
      @keyframes beam {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `}</style>
  </div>
);

export default HoverBeamCard;