import React, { useEffect, useRef } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const didAnimate = useRef(false);

  useEffect(() => {
    // Check for GSAP availability
    // @ts-ignore
    if (!window.gsap) {
      console.warn("GSAP not loaded");
      // Load it dynamically if missing (fallback mechanism from snippet)
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
      script.onload = () => { if(!didAnimate.current) startAnimation(); };
      document.head.appendChild(script);
      // Fallback timeout in case script fails
      setTimeout(onComplete, 2000);
      return;
    } else if (!didAnimate.current) {
        startAnimation();
    }

    function startAnimation() {
      didAnimate.current = true;
      // @ts-ignore
      const gsap = window.gsap;
      if (!textRef.current || !containerRef.current) return;

      const chars = textRef.current.querySelectorAll('.char');
      
      const tl = gsap.timeline({
        onComplete: onComplete
      });

      tl.set(containerRef.current, { autoAlpha: 1 })
        .fromTo(chars, 
          { opacity: 0, y: 50, filter: "blur(20px)" },
          { 
            opacity: 1, 
            y: 0, 
            filter: "blur(0px)", 
            stagger: 0.1, 
            duration: 1.2, 
            ease: "power4.out" 
          }
        )
        .to(chars, {
          opacity: 0,
          y: -50,
          filter: "blur(20px)",
          stagger: 0.05,
          duration: 0.8,
          ease: "power4.in",
          delay: 0.2
        })
        .to(containerRef.current, {
          autoAlpha: 0,
          duration: 0.4
        });
    }
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-none opacity-0 invisible">
      <h1 ref={textRef} className="text-white text-6xl md:text-8xl font-['Inter_Tight'] font-medium tracking-tighter flex overflow-hidden">
        {"Mastery".split('').map((char, i) => (
          <span key={i} className="char inline-block">{char}</span>
        ))}
      </h1>
    </div>
  );
};

export default LoadingScreen;