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
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
      script.onload = () => { if(!didAnimate.current) startAnimation(); };
      document.head.appendChild(script);
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

      // Total Duration Goal: ~5 seconds
      tl.set(containerRef.current, { autoAlpha: 1 })
        .fromTo(chars, 
          { opacity: 0, y: 100, filter: "blur(20px)" },
          { 
            opacity: 1, 
            y: 0, 
            filter: "blur(0px)", 
            stagger: 0.1, 
            duration: 2.0, // Slow, elegant entry
            ease: "power4.out" 
          }
        )
        // Hold state
        .to(chars, {
          opacity: 0,
          y: -100,
          filter: "blur(20px)",
          stagger: 0.05,
          duration: 1.5, // Slow, elegant exit
          ease: "power4.in",
          delay: 1.5 // Hold time
        })
        .to(containerRef.current, {
          autoAlpha: 0,
          duration: 0.5
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