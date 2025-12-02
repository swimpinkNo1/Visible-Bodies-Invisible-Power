import React, { useEffect, useRef, useState, useMemo } from 'react';
import { OverlayProps } from '../types';

interface ExtendedOverlayProps extends OverlayProps {
  setPanic: (state: boolean) => void;
}

// --- CONSTANTS ---
const gardenData = [
 { id: 1, title: "Nie Xiaoqian", pos: 9.35, neg: 8.54, neu: 82.11},
 { id: 2, title: "Painted Skin", pos: 7.9, neg: 12.47, neu: 79.63},
 { id: 3, title: "Fox-Girl Qingfeng", pos: 8.42, neg: 8.17, neu: 83.42},
 { id: 4, title: "Fox-Fairy Jiaonuo", pos: 9.57, neg: 4.61, neu: 85.82},
 { id: 5, title: "Ghost-Maiden Huanniang", pos: 10.79, neg: 6.93, neu: 82.28},
 { id: 6, title: "The Mural", pos: 4.74, neg: 8.06, neu: 87.20},
 { id: 7, title: "A Ride in a Goose Cage", pos: 12.9, neg: 1.61, neu: 85.48},
 { id: 8, title: "Mr. Tan's Bedmate", pos: 7.53, neg: 6.45, neu: 86.02},
 { id: 9, title: "Who Is the Fox?", pos: 9.09, neg: 14.14, neu: 76.77},
 { id: 10, title: "Ms. Wei’s Dragon Ride", pos: 5.56, neg: 8.80, neu: 85.65},
 { id: 11, title: "Red Strand", pos: 12.10, neg: 6.18, neu: 81.72},
 { id: 12, title: "The Proprietress at Wooden Bridge", pos: 9.43, neg: 4.25, neu: 86.32}
];

// --- SUB-COMPONENTS ---

// Data Garden Component
const DataGarden: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [hoveredData, setHoveredData] = useState<number | null>(null);
  // PERFORMANCE FIX: Removed state for mouse position to prevent re-renders
  const tooltipRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Sound
  useEffect(() => {
    hoverSoundRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/10926.wav');
    hoverSoundRef.current.volume = 0.6;
  }, []);

  const playHoverSound = () => {
    if (hoverSoundRef.current) {
        hoverSoundRef.current.currentTime = 0;
        hoverSoundRef.current.play().catch(() => {});
    }
  };
  
  // Mouse Scrubbing & Tooltip Logic (Direct DOM)
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
        // 1. Tooltip Positioning (Direct DOM update)
        if (tooltipRef.current) {
            const x = e.clientX;
            const y = e.clientY;
            const offsetX = x > window.innerWidth - 320 ? -320 : 20;
            const offsetY = y > window.innerHeight - 200 ? -180 : 20;
            tooltipRef.current.style.transform = `translate(${x + offsetX}px, ${y + offsetY}px)`;
        }

        // 2. Video Scrubbing
        if (videoRef.current && videoRef.current.duration) {
            const xPct = e.clientX / window.innerWidth;
            const yPct = e.clientY / window.innerHeight;
            const progress = (xPct + yPct) / 2; 
            const targetTime = progress * videoRef.current.duration;
            
            if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
                videoRef.current.currentTime = targetTime;
            }
        }
    };
    
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Generate random positions and drift vectors for data groups (stable)
  const dataGroups = useMemo(() => {
    return gardenData.map((d, i) => {
      const colIndex = i % 4;
      const rowIndex = Math.floor(i / 4);
      // Spread them out more effectively across a larger canvas
      const xBase = colIndex * 25 + 12.5; 
      const yBase = rowIndex * 25 + 15; 
      const xRandom = (Math.random() - 0.5) * 20; // Increased spread
      const yRandom = (Math.random() - 0.5) * 20;

      return {
        ...d,
        x: Math.max(10, Math.min(90, xBase + xRandom)), 
        y: Math.max(10, Math.min(90, yBase + yRandom)), 
        animDelay: Math.random() * 5,
        driftDuration: 15 + Math.random() * 30 + 's', 
        driftX: (Math.random() - 0.5) * 200 + 'px', 
        driftY: (Math.random() - 0.5) * 200 + 'px',
        breatheDuration: 3 + Math.random() * 5 + 's'
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden pointer-events-auto cursor-none font-helvetica text-black bg-[#a9988a]">
       <style>{`
         @keyframes float-breathe {
           0%, 100% { transform: scale(1); }
           50% { transform: scale(1.1); }
         }
         @keyframes organic-drift {
           0% { transform: translate(0, 0); }
           25% { transform: translate(calc(var(--dx) * 0.5), calc(var(--dy) * 0.2)); }
           50% { transform: translate(var(--dx), var(--dy)); }
           75% { transform: translate(calc(var(--dx) * 0.2), calc(var(--dy) * 0.8)); }
           100% { transform: translate(0, 0); }
         }
       `}</style>

       {/* BACKGROUND VIDEO (Fixed to cover viewport) */}
       <div className="fixed inset-0 z-0 bg-[#a9988a]">
         <video 
            ref={videoRef}
            src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/Thorns-animation.mp4"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            muted
            playsInline
            preload="auto"
         />
       </div>

       {/* CONTENT WRAPPER */}
       <div className="relative z-10 w-full flex flex-col items-center">
           
           {/* Navigation Button */}
           <div className="w-full max-w-7xl px-6 pt-8 flex justify-start pointer-events-none">
                <button 
                    onClick={onBack}
                    className="pointer-events-auto group flex flex-col items-center gap-1 text-black/60 hover:text-black transition-colors"
                    aria-label="Return to Home"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="font-impact text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">RETURN HOME</span>
                </button>
           </div>

           {/* SECTION 1: DATA VISUALIZATION */}
           <div className="w-full min-h-screen flex flex-col items-center pt-4 pb-10">
               
               {/* Intro */}
               <div className="relative z-30 max-w-5xl text-center px-8 mb-4 pointer-events-none">
                  <p className="font-helvetica font-medium text-black leading-relaxed text-sm md:text-lg drop-shadow-sm">
                    This analysis draws on female-related passages from twelve tales: Nie Xiaoqian, Painted Skin, Fox-Girl Qingfeng, Fox-Fairy Jiaonuo, Ghost-Maiden Huanniang and The Mural from <span className="font-bold italic">Strange Tales from a Make-Do Studio</span>; and A Ride in a Goose Cage, Mr Tan's Bedmate, Who Is the Fox?, Ms Wei’s Dragon Ride, Red Strand and The Proprietress at Wooden Bridge from <span className="font-bold italic">Into the Porcelain Pillow: 101 Tales from Records of the Taiping Era</span>.
                  </p>
               </div>

               {/* Visualization Container - Increased Height */}
               <div className="relative w-full max-w-7xl h-[75vh] min-h-[600px] mx-auto z-20 mt-8">
                  <div className="absolute inset-0 z-10">
                     {dataGroups.map((group) => (
                        <div 
                           key={group.id}
                           className="absolute transition-transform duration-300 hover:scale-125 cursor-pointer flex items-center justify-center group"
                           style={{ 
                             left: `${group.x}%`, 
                             top: `${group.y}%`,
                             '--dx': group.driftX,
                             '--dy': group.driftY,
                             animation: `organic-drift ${group.driftDuration} ease-in-out infinite alternate`
                           } as React.CSSProperties}
                           onMouseEnter={() => {
                               setHoveredData(group.id);
                               playHoverSound();
                           }}
                           onMouseLeave={() => setHoveredData(null)}
                        >
                           {/* Breathing Animation Wrapper */}
                           <div 
                             className="relative" 
                             style={{ 
                               animation: `float-breathe ${group.breatheDuration} ease-in-out infinite`,
                               animationDelay: `${group.animDelay}s` 
                             }}
                           >
                               {/* Red Circle (Pos) */}
                               <div 
                                  className="absolute bg-[#7a1a1a] rounded-full opacity-70 mix-blend-multiply shadow-md blur-[2px] transition-all duration-300"
                                  style={{ 
                                     width: `${Math.max(group.pos * 3, 20)}px`, 
                                     height: `${Math.max(group.pos * 3, 20)}px`,
                                     transform: 'translate(-50%, -50%)',
                                     zIndex: 20
                                  }}
                               />
                               {/* Grey Circle (Neu) */}
                               <div 
                                  className="absolute bg-[#808080] rounded-full opacity-70 mix-blend-multiply shadow-md blur-[2px] transition-all duration-300"
                                  style={{ 
                                     width: `${Math.max(group.neu * 0.7, 15)}px`, 
                                     height: `${Math.max(group.neu * 0.7, 15)}px`,
                                     transform: `translate(${group.id % 2 === 0 ? 30 : -30}%, ${group.id % 3 === 0 ? -30 : 30}%)`,
                                     zIndex: 10
                                  }}
                               />
                               {/* Black Circle (Neg) */}
                               <div 
                                  className="absolute bg-black rounded-full opacity-70 mix-blend-multiply shadow-md blur-[2px] transition-all duration-300"
                                  style={{ 
                                     width: `${Math.max(group.neg * 3, 20)}px`, 
                                     height: `${Math.max(group.neg * 3, 20)}px`,
                                     transform: `translate(${group.id % 2 === 0 ? -20 : 20}%, ${group.id % 3 === 0 ? 20 : -20}%)`,
                                     zIndex: 30
                                  }}
                               />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="text-center font-impact text-black/40 text-xl mt-8 animate-pulse pointer-events-none">
                   SCROLL FOR VIDEO & CONTEXT
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l7-7m7 7V3" />
                   </svg>
               </div>
           </div>

           {/* SECTION 2: VIDEO EMBED (HTML5 Video) */}
           <div className="w-full max-w-5xl px-6 pb-20 flex flex-col items-center">
                <div className="w-full aspect-video shadow-2xl border-2 border-black/20 bg-black relative pointer-events-auto mb-4">
                    <video 
                        controls
                        className="w-full h-full object-cover"
                        src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/A-Feminist-Data-Study-of-Classical-Chinese-Ghost-Stories.mp4"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <a 
                    href="https://youtu.be/lXWW6GnYJeg?si=Rw7FZUJlvjhmELiv" 
                    target="_blank" 
                    rel="noreferrer"
                    className="font-helvetica text-sm text-black/60 hover:text-black hover:underline pointer-events-auto transition-colors"
                >
                    If video cannot load, please click here to watch on YouTube
                </a>
           </div>

           {/* SECTION 3: TEXT MODULES */}
           <div className="w-full max-w-4xl px-6 pb-40 flex flex-col items-center text-center font-helvetica text-black space-y-24 pointer-events-auto cursor-auto">
                
                {/* Module 1: Why Ghost Stories */}
                <div className="space-y-6">
                    <h2 className="font-bodoni text-3xl md:text-4xl text-[#550000]">Why ghost stories?</h2>
                    <div className="space-y-6 text-lg leading-relaxed max-w-3xl mx-auto">
                        <p>Because in these tales, fear never comes from demons alone—it gathers in the ways women’s bodies are shaped, traded and disciplined.</p>
                        <p>Across twelve stories from <span className="italic">Strange Tales from a Make-Do Studio</span> and <span className="italic">Into the Porcelain Pillow</span>, I traced the language of harm: the words that describe, diminish and contain. I digitised the texts, tagged the terms, measured their emotional force, and translated each count into matter—cages, windows, thorns.</p>
                        <p>From text to data, from data to object, the process reveals a simple truth: language builds structures around bodies, and stories can become the architecture of control. And in translation, those structures often flatten or soften the violence, smoothing the edges of power that the physical artefacts force us to confront again.</p>
                        <p className="font-bold">These works do not merely analyse that structure; they touch it, hold it, and ask us to feel its weight again.</p>
                    </div>
                </div>

                {/* Module 2: Reference */}
                <div className="w-full text-left border-t border-black/10 pt-12">
                    <h3 className="font-impact text-xl mb-6 text-black/80">REFERENCE</h3>
                    <ul className="space-y-4 text-sm md:text-base text-black/70 leading-relaxed font-helvetica">
                        <li><span className="font-bold">Butler, J., 1999.</span> <span className="italic">Gender trouble: feminism and the subversion of identity.</span> New York: Routledge.</li>
                        <li><span className="font-bold">Federici, S., 2023.</span> <span className="italic">超越身体边界: 在当代资本主义中反思、重塑和重夺身体.</span> Translated by J. Wang. Beijing: Guangqi Press. (Original work published 2020 as <span className="italic">Beyond the Periphery of the Skin: Rethinking, Remaking and Reclaiming the Body in Contemporary Capitalism.</span>)</li>
                        <li><span className="font-bold">Gaviria, A.R., 2008.</span> When is information visualization art? Determining the critical criteria. <span className="italic">Leonardo</span>, 41(5), pp.479–482.</li>
                        <li><span className="font-bold">Knight, K.B., 2018.</span> ‘Danger, Jane Roe!’: material data visualization as feminist praxis. In: E. Losh and J. Wernimont, eds. 2018. <span className="italic">Bodies of Information: Intersectional Feminism and the Digital Humanities.</span> Minneapolis: University of Minnesota Press, pp.3–24. doi:10.5749/j.ctv9hj9r9.4.</li>
                        <li><span className="font-bold">Li, F., et al., 1998.</span> <span className="italic">Into the porcelain pillow: 101 tales from Records of the Taiping Era.</span> Beijing: Foreign Languages Press.</li>
                        <li><span className="font-bold">Li, X., 2024.</span> <span className="italic">Taiping Guangji qingsong du《太平广记轻松读》.</span> Beijing: China Literature and History Press.</li>
                        <li><span className="font-bold">Nussbaum, M.C., 1995.</span> Objectification. <span className="italic">Philosophy and Public Affairs</span>, 24(4), pp.249–291.</li>
                        <li><span className="font-bold">Pu, S., 1989.</span> <span className="italic">Strange tales from a make-do studio.</span> Translated by D.C. Mair and V.H. Mair. Beijing: Foreign Languages Press.</li>
                        <li><span className="font-bold">Pu, S. [蒲松龄], 2025.</span> <span className="italic">Liaozhai zhiyi (Yuedu jingdian baihua ban)《聊斋志异（悦读经典白话版）》.</span> Translated by X. Jia. Beijing: Manbanpai Culture Co., Ltd.</li>
                    </ul>
                </div>

           </div>

       </div>

       {/* Tooltip (Fixed above content via ref) */}
       <div 
          ref={tooltipRef}
          className={`fixed z-[300] bg-white/95 backdrop-blur-md p-4 pointer-events-none border border-black shadow-2xl rounded-sm max-w-xs transition-opacity duration-200 ${hoveredData ? 'opacity-100' : 'opacity-0'}`}
          style={{ top: 0, left: 0, willChange: 'transform' }}
       >
          <h4 className="font-impact text-2xl mb-2 uppercase text-black leading-none">{gardenData.find(d => d.id === hoveredData)?.title}</h4>
          <div className="font-impact text-sm space-y-1 text-black/80">
             <div className="flex justify-between w-full gap-4 text-[#7a1a1a]"><span>POS:</span> <span>{gardenData.find(d => d.id === hoveredData)?.pos}%</span></div>
             <div className="flex justify-between w-full gap-4 text-black"><span>NEG:</span> <span>{gardenData.find(d => d.id === hoveredData)?.neg}%</span></div>
             <div className="flex justify-between w-full gap-4 text-[#808080]"><span>NEU:</span> <span>{gardenData.find(d => d.id === hoveredData)?.neu}%</span></div>
          </div>
       </div>
    </div>
  );
};

// Transition Overlay: Advanced Ink Wash
const TransitionOverlay: React.FC<{ active: boolean; onComplete: () => void }> = ({ active, onComplete }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      startTimeRef.current = performance.now();
      const duration = 2500; // 2.5s total duration

      const animate = (time: number) => {
        const elapsed = time - (startTimeRef.current || time);
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: Cubic Bezier like easeInOut
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (overlayRef.current && turbulenceRef.current && displacementRef.current) {
          
          // Phase 1: Expansion (0 - 50%)
          if (progress < 0.6) {
             const growPhase = Math.min(progress / 0.5, 1);
             const scale = growPhase * 250; 
             overlayRef.current.style.transform = `scale(${scale})`;
             overlayRef.current.style.opacity = '1';
             
             // Boiling Edge Effect
             const freq = 0.04 - (growPhase * 0.035); 
             turbulenceRef.current.setAttribute('baseFrequency', `${freq}`);
             
             // Displacement Scale
             displacementRef.current.setAttribute('scale', `${50 + growPhase * 100}`);
          }

          // Trigger View Switch at 50%
          if (progress > 0.5 && progress < 0.52) {
             onComplete();
          }

          // Phase 2: Dissolve (60% - 100%)
          if (progress > 0.6) {
             const fadePhase = (progress - 0.6) / 0.4;
             overlayRef.current.style.opacity = `${1 - fadePhase}`;
             turbulenceRef.current.setAttribute('baseFrequency', `${0.005 + fadePhase * 0.02}`);
          }
        }

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        }
      };

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <>
      <svg className="fixed w-0 h-0 pointer-events-none">
        <defs>
          <filter id="liquid-ink-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence 
                ref={turbulenceRef} 
                type="fractalNoise" 
                baseFrequency="0.04" 
                numOctaves="3" 
                result="noise" 
            />
            <feDisplacementMap 
                ref={displacementRef} 
                in="SourceGraphic" 
                in2="noise" 
                scale="100" 
                xChannelSelector="R" 
                yChannelSelector="G" 
            />
            <feGaussianBlur stdDeviation="1.5" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -2" />
          </filter>
        </defs>
      </svg>
      <div className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center overflow-hidden">
          <div 
            ref={overlayRef}
            className="bg-black rounded-full"
            style={{
               width: '1vmax', 
               height: '1vmax',
               transform: 'scale(0)',
               filter: 'url(#liquid-ink-filter)',
               willChange: 'transform, opacity'
            }}
          />
      </div>
    </>
  );
};


// 1. ProgressBar Component
const ProgressBar = ({ label, value, color, trigger, delay = 0 }: { label: string, value: number, color: string, trigger: boolean, delay?: number }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    if (trigger) {
      const t = setTimeout(() => setWidth(value), delay);
      return () => clearTimeout(t);
    } else {
      setWidth(0);
    }
  }, [trigger, value, delay]);

  return (
    <div className="w-full mb-6 group">
      <div className="flex justify-between font-chalk text-xl mb-2 items-end">
        <span style={{ color }} className="opacity-80 group-hover:opacity-100 transition-opacity">{label}</span>
        <span className="font-impact text-2xl" style={{ color }}>{trigger ? `${value}%` : '0%'}</span>
      </div>
      <div className="w-full h-3 bg-[#1a1816]/50 rounded-sm overflow-hidden border border-[#cbb8a6]/20 relative backdrop-blur-sm">
        <div 
            className="h-full transition-all duration-[5000ms] ease-out relative" 
            style={{ width: `${width}%`, backgroundColor: color }} 
        >
             <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50" />
        </div>
      </div>
    </div>
  );
};

// 2. Animated Counter
const AnimatedCounter = ({ target, trigger, className, delay = 0 }: { target: number, trigger: boolean, className: string, delay?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (trigger) {
      const startTimer = setTimeout(() => {
        let start = 0;
        const duration = 2000; // Slower count
        const startTime = performance.now();
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          setCount(Math.floor(ease * target));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }, delay);
      return () => clearTimeout(startTimer);
    } else {
      setCount(0);
    }
  }, [trigger, target, delay]);

  return <span className={className}>{count}</span>;
};

// 3. Fly-In Image Component (With Deep Parallax Support)
const FlyInImage = ({ children, className = "", depth = 0, angle = 0, delay = 0 }: { children?: React.ReactNode, className?: string, depth?: number, angle?: number, delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Increase scaling for deeper elements to maintain visual size
  const scaleFactor = depth < 0 ? 1.6 : 1;
  
  const parallaxStyle = {
    transitionDelay: `${delay}ms`,
    transform: visible 
      ? `translateZ(${depth}px) rotateX(${angle}deg) scale(${scaleFactor})` 
      : `translate3d(0, 100px, ${depth}px) rotateX(${angle}deg) scale(${scaleFactor})`
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-[2000ms] ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        ...parallaxStyle
      }}
    >
      {children}
    </div>
  );
};

const AdjectiveList = ({ words, trigger }: { words: string[], trigger: boolean }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    if (trigger) {
      if (visibleCount < words.length) {
        const timeout = setTimeout(() => {
          setVisibleCount(prev => prev + 1);
        }, 400); // Slower reveal
        return () => clearTimeout(timeout);
      }
    } else {
      setVisibleCount(0);
    }
  }, [trigger, visibleCount, words.length]);

  return (
    <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto my-8 transform-style-3d translate-z-50 px-4">
      {words.map((word, i) => (
        <span 
          key={i} 
          className={`font-chalk text-2xl md:text-3xl text-[#e5e5e5] transition-all duration-[1000ms] transform ${
            i < visibleCount 
              ? 'opacity-100 translate-y-0 blur-0 scale-100' 
              : 'opacity-0 translate-y-4 blur-md scale-150'
          }`}
        >
          {word}{i < words.length - 1 ? ',' : ''}
        </span>
      ))}
    </div>
  );
};

const SmokeQuote = ({ text, citation, trigger, delay }: { text: string, citation: string, trigger: boolean, delay: number }) => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (trigger) {
      const t = setTimeout(() => setActive(true), delay);
      return () => clearTimeout(t);
    } else {
      setActive(false);
    }
  }, [trigger, delay]);

  return (
    <div className={`mb-12 transition-all duration-[2000ms] ease-in-out ${active ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-lg translate-y-8'}`}>
      <p className="font-chalk text-2xl md:text-3xl text-[#e5e5e5] leading-relaxed mb-2">
        {text}
      </p>
      <p className="font-bodoni text-[#aaa] text-sm text-right uppercase tracking-widest">
        {citation}
      </p>
    </div>
  );
};


export const Overlay: React.FC<ExtendedOverlayProps> = ({ selection, setSelection, view, setView, section, setSection, setPanic }) => {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Chapter 1 Refs
  const introRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  
  // Chapter 2 Refs
  const chap2IntroRef = useRef<HTMLDivElement>(null);
  const chap2DataRef = useRef<HTMLDivElement>(null);
  const chap2NarrativeRef = useRef<HTMLDivElement>(null);
  const chap2MatterRef = useRef<HTMLDivElement>(null); 
  
  // Chapter 3 Refs
  const chap3IntroRef = useRef<HTMLDivElement>(null);
  const chap3DataRef = useRef<HTMLDivElement>(null);
  const chap3NarrativeRef = useRef<HTMLDivElement>(null);
  const chap3MatterRef = useRef<HTMLDivElement>(null); 

  // Chapter 4 Refs
  const chap4IntroRef = useRef<HTMLDivElement>(null);
  const chap4DataRef = useRef<HTMLDivElement>(null);
  const chap4NarrativeRef = useRef<HTMLDivElement>(null);

  const [activeModel, setActiveModel] = useState<'WINDOW' | 'GOOSE' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- ATMOSPHERE PHYSICS ---
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef({ current: 0, target: 0 });
  const swayRef = useRef({ x: 0, y: 0, rotateX: 0, rotateY: 0, skew: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animatePhysics = () => {
      if (containerRef.current) {
        const currentScroll = containerRef.current.scrollTop;
        const scrollDiff = currentScroll - scrollRef.current.current;
        scrollRef.current.target = scrollDiff; 
        scrollRef.current.current = currentScroll;
        const targetSkew = Math.max(Math.min(scrollDiff * 0.1, 5), -5);
        swayRef.current.skew += (targetSkew - swayRef.current.skew) * 0.1;
      }
      
      // PARALLAX PHYSICS (The Boat Effect)
      // Images (Background) rotate oppositely to mouse
      const targetRotateY = mouseRef.current.x * 8; 
      const targetRotateX = -mouseRef.current.y * 6; 
      const targetTransX = mouseRef.current.x * 5; // Tamed
      const targetTransY = mouseRef.current.y * 5; // Tamed

      swayRef.current.rotateY += (targetRotateY - swayRef.current.rotateY) * 0.05;
      swayRef.current.rotateX += (targetRotateX - swayRef.current.rotateX) * 0.05;
      swayRef.current.x += (targetTransX - swayRef.current.x) * 0.05;
      swayRef.current.y += (targetTransY - swayRef.current.y) * 0.05;

      if (contentWrapperRef.current) {
        contentWrapperRef.current.style.transformStyle = 'preserve-3d';
        contentWrapperRef.current.style.transform = `
          perspective(1000px)
          rotateX(${swayRef.current.rotateX * 1.5}deg)
          rotateY(${swayRef.current.rotateY * 1.5}deg)
          skewY(${swayRef.current.skew}deg)
        `;
      }
      animationFrameId = requestAnimationFrame(animatePhysics);
    };
    animatePhysics();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- SCROLL / SECTION LOGIC ---
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const clientHeight = containerRef.current.clientHeight;

    const triggerHeight = window.innerHeight * 0.3;
    const chapter2Threshold = 4500; 
    const chapter3Threshold = 9500; 
    const chapter4Threshold = 14500; 

    // Don't switch views via scroll if we are in Data Garden
    if (view === 'DATA_GARDEN') return;

    // AUTO TRIGGER DATA GARDEN AT BOTTOM
    if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (!isTransitioning && view !== 'DATA_GARDEN') {
            startDataTransition();
        }
        return; // Don't process other section logic if transitioning
    }

    if (scrollTop > chapter4Threshold) {
        if (view !== 'CHAPTER_4') setView('CHAPTER_4');
    } else if (scrollTop > chapter3Threshold) {
        if (view !== 'CHAPTER_3') setView('CHAPTER_3');
    } else if (scrollTop > chapter2Threshold) {
        if (view !== 'CHAPTER_2') setView('CHAPTER_2');
    } else if (scrollTop > triggerHeight) {
        if (view !== 'CHAPTER_1') setView('CHAPTER_1');
    } else {
        if (view !== 'HOME') {
            setView('HOME');
            setSelection(null);
        }
    }
  };

  useEffect(() => {
    const options = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === introRef.current) setSection('INTRO');
          if (entry.target === dataRef.current) setSection('DATA');
          if (entry.target === narrativeRef.current) setSection('NARRATIVE');
          
          if (entry.target === chap2IntroRef.current) setSection('INTRO');
          if (entry.target === chap2DataRef.current) setSection('DATA');
          if (entry.target === chap2NarrativeRef.current) setSection('NARRATIVE');
          if (entry.target === chap2MatterRef.current) setSection('MATTER');

          if (entry.target === chap3IntroRef.current) setSection('INTRO');
          if (entry.target === chap3DataRef.current) setSection('DATA');
          if (entry.target === chap3NarrativeRef.current) setSection('NARRATIVE');
          if (entry.target === chap3MatterRef.current) setSection('MATTER');

          if (entry.target === chap4IntroRef.current) setSection('INTRO');
          if (entry.target === chap4DataRef.current) setSection('DATA');
          if (entry.target === chap4NarrativeRef.current) setSection('NARRATIVE');
        }
      });
    }, options);

    const observeRef = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) observer.observe(ref.current);
    }

    observeRef(introRef); observeRef(dataRef); observeRef(narrativeRef);
    observeRef(chap2IntroRef); observeRef(chap2DataRef); observeRef(chap2NarrativeRef); observeRef(chap2MatterRef);
    observeRef(chap3IntroRef); observeRef(chap3DataRef); observeRef(chap3NarrativeRef); observeRef(chap3MatterRef);
    observeRef(chap4IntroRef); observeRef(chap4DataRef); observeRef(chap4NarrativeRef);

    return () => observer.disconnect();
  }, [setSection]);

  const handleOptionClick = (option: 'A' | 'B') => {
    if (option === 'A' && introRef.current) introRef.current.scrollIntoView({ behavior: 'smooth' });
    if (option === 'B' && chap3IntroRef.current) chap3IntroRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const startDataTransition = () => {
    setIsTransitioning(true);
  };

  const getOptionClasses = (id: 'A' | 'B') => {
    const isSelected = selection === id;
    const isBlurred = selection !== null && selection !== id;
    return `
      relative group cursor-none transition-all duration-500 ease-out transform-style-3d
      ${isSelected ? 'opacity-100 scale-105 z-20 text-[#550000]' : ''} 
      ${isBlurred ? 'opacity-20 blur-sm scale-95' : 'opacity-80'}
      ${!selection ? 'hover:opacity-100 hover:text-[#550000]' : ''}
    `;
  };

  return (
    <>
      {/* --- INK WASH TRANSITION --- */}
      <TransitionOverlay active={isTransitioning} onComplete={() => {
        setView('DATA_GARDEN');
        setIsTransitioning(false);
      }} />

      {/* --- DATA GARDEN VIEW --- */}
      {view === 'DATA_GARDEN' && <DataGarden onBack={() => setView('HOME')} />}

      {/* --- 3D MODAL (WINDOW / GOOSE CAGE) --- */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 transition-opacity duration-500 ${activeModel ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
            onClick={() => setActiveModel(null)}
            className="absolute top-10 right-10 text-white text-5xl font-chalk hover:text-[#550000] transition-colors z-[110]"
        >
            &times;
        </button>
        <div className="w-full max-w-6xl h-[80vh] relative p-4 flex items-center justify-center border border-[#550000]/30 rounded-lg bg-[#1a1816]/50">
            {activeModel === 'WINDOW' && (
                <div className="sketchfab-embed-wrapper w-full h-full">
                  <iframe title="The Window With Thorns" frameBorder="0" allowFullScreen {...({ mozallowfullscreen: "true", webkitallowfullscreen: "true", "xr-spatial-tracking": "true", "execution-while-out-of-viewport": "true", "execution-while-not-rendered": "true", "web-share": "true" } as any)} src="https://sketchfab.com/models/d2f2a7c8b1934840b780a21633965168/embed" className="w-full h-full"></iframe>
                  <p style={{ fontSize: '13px', fontWeight: 'normal', margin: '5px', color: '#4A4A4A' }}>
                    <a href="https://sketchfab.com/3d-models/the-window-with-thorns-d2f2a7c8b1934840b780a21633965168" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}> The Window With Thorns </a> by YongHongC on Sketchfab
                  </p>
                </div>
            )}
            {activeModel === 'GOOSE' && (
                <div className="sketchfab-embed-wrapper w-full h-full">
                  <iframe title="The Goose Cage With Thorns" frameBorder="0" allowFullScreen {...({ mozallowfullscreen: "true", webkitallowfullscreen: "true", "xr-spatial-tracking": "true", "execution-while-out-of-viewport": "true", "execution-while-not-rendered": "true", "web-share": "true" } as any)} src="https://sketchfab.com/models/cc6550337c444af88054a052f24bdea7/embed" className="w-full h-full"></iframe>
                  <p style={{ fontSize: '13px', fontWeight: 'normal', margin: '5px', color: '#4A4A4A' }}>
                    <a href="https://sketchfab.com/3d-models/the-goose-cage-with-thorns-cc6550337c444af88054a052f24bdea7" target="_blank" rel="nofollow" style={{ fontWeight: 'bold', color: '#1CAAD9' }}> The Goose Cage With Thorns </a> by YongHongC on Sketchfab
                  </p>
                </div>
            )}
        </div>
      </div>

      {/* --- MAIN SCROLL CONTAINER (HIDDEN WHEN IN DATA GARDEN) --- */}
      <div className={`absolute inset-0 z-10 flex flex-col pointer-events-none transition-opacity duration-1000 ${view === 'DATA_GARDEN' ? 'opacity-0' : 'opacity-100'}`}>
        <div ref={contentWrapperRef} className="absolute inset-0 w-full h-full transform-gpu origin-center">
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className={`absolute inset-0 overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth ${view === 'DATA_GARDEN' ? 'pointer-events-none' : 'pointer-events-auto'}`}
          >

            {/* HERO */}
            <div ref={heroRef} className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative">
              <div 
                className={`text-center mb-16 transition-all duration-500 ${selection ? 'blur-sm opacity-30' : 'opacity-100'}`} 
                style={{ transform: 'translateZ(100px)' }} 
              >
                <h1 className="font-chalk font-bold text-6xl md:text-8xl text-[#e5e5e5] opacity-60 mb-6 tracking-tight leading-[0.9] uppercase">
                  Visible Bodies,<br/>
                  Invisible Power
                </h1>
                <h3 className="font-helvetica font-bold text-2xl md:text-3xl text-[#e5e5e5]">
                  A Feminist Data Study of Classical Chinese Ghost Stories
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-center justify-center w-full max-w-7xl" style={{ transform: 'translateZ(120px)' }}>
                <div 
                  className={getOptionClasses('A')}
                  onMouseEnter={() => setSelection('A')}
                  onMouseLeave={() => setSelection(null)}
                  onClick={() => handleOptionClick('A')}
                >
                  <div className="font-chalk text-lg md:text-2xl text-[#550000] mb-2">Book I</div>
                  <h2 className="font-bodoni text-lg md:text-2xl max-w-sm text-center leading-tight">Strange Tales from a make-do studio</h2>
                  <div className="h-[3px] w-0 group-hover:w-full bg-[#550000] transition-all duration-500 mt-4 mx-auto" />
                </div>
                <div className="h-24 w-[1px] bg-[#3d342b] hidden md:block opacity-30" />
                <div 
                  className={getOptionClasses('B')}
                  onMouseEnter={() => setSelection('B')}
                  onMouseLeave={() => setSelection(null)}
                  onClick={() => handleOptionClick('B')}
                >
                  <div className="font-chalk text-lg md:text-2xl text-[#550000] mb-2">Book II</div>
                  <h2 className="font-bodoni text-lg md:text-2xl max-w-sm text-center leading-tight">Into the Porcelain Pillow: 101 Tales from Records of the Taiping Era</h2>
                  <div className="h-[3px] w-0 group-hover:w-full bg-[#550000] transition-all duration-500 mt-4 mx-auto" />
                </div>
              </div>
            </div>

            {/* CHAPTER 1 */}
            <div ref={introRef} className="min-h-screen w-full relative flex flex-col items-center pt-32 px-6 pb-20">
              <div className="text-center mb-16" style={{ transform: 'translateZ(100px)' }}>
                <div className={`transition-all duration-[2000ms] ${section === 'INTRO' || section === 'DATA' || section === 'NARRATIVE' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
                   <h1 className="font-chalk font-bold text-6xl md:text-8xl text-[#e5e5e5] opacity-60 leading-none mb-4">Nie Xiaoqian</h1>
                </div>
                <h2 className="font-helvetica font-bold text-2xl md:text-3xl text-[#e5e5e5] max-w-4xl mx-auto">Chapter 1: Redemption of a Ghost, or Submission to Patriarchy?</h2>
              </div>
              <div className="flex flex-col items-center gap-0 max-w-6xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-250} angle={-8}>
                    <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/11/chapter-1-1.png" alt="Ning Caichen" className="w-[60%] h-auto block mx-auto drop-shadow-none border-none shadow-none" />
                  </FlyInImage>
                  <FlyInImage className="w-full max-w-4xl space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 relative z-10 -mt-6 md:-mt-4" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>Ning Caichen, an earnest scholar from Zhejiang, takes refuge in a dilapidated monastery near Jinhua to escape the extortionate rents brought on by exam season. The place is in an absolute state, but its desolation suits him well enough—especially as he soon finds himself sharing it with a decidedly eccentric swordsman, Yan Chixia.</p>
                      <p>Come midnight, a striking young woman, Nie Xiaoqian, slips quietly into his quarters, her intentions unmistakable. Ning, ever the picture of propriety, rebuffs her advances at once, even flinging her gold ingot out into the courtyard. Only afterwards does he learn the truth: Xiaoqian is not a temptress but a ghost, enslaved by a malevolent demon who compels her to lure men to their deaths through seduction or cursed gifts.</p>
                    </div>
                  </FlyInImage>
              </div>
            </div>
            
            <div className="min-h-screen w-full relative flex flex-col items-center py-20 px-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-7xl w-full">
                  <FlyInImage className="w-full md:w-4/12 relative z-0" depth={-250} angle={8}>
                    <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-1-2.png" alt="Resolution" className="w-[75%] md:w-[85%] h-auto block mx-auto drop-shadow-none border-none shadow-none" />
                  </FlyInImage>
                  <FlyInImage className="w-full md:w-5/12 space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 relative z-20 md:-ml-6" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>When Ning discovers that Yan is in fact a demon-hunter in disguise, the two devise a daring plan. Yan’s flying sword dispatches the demon with decisive force, while Ning exhumed Xiaoqian’s neglected remains and lays them to rest beside his cottage. She returns—no longer spectral, but fully human—and soon becomes part of the household. In time she marries Ning, bears him a son, and lives under the quiet protection of Yan’s talismanic pouch, which keeps further spirits at bay.</p>
                    </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-20 px-6" style={{ transform: 'translateZ(120px)' }}>
                  <div className="font-helvetica text-xl leading-loose text-[#e5e5e5] italic font-bold">
                      <p>A hauntingly beautiful tale, is it not? A classic romance of deliverance.</p>
                      <br/>
                      <p>Yet beneath the sheen of salvation lies a quieter story—one threaded with coercion, commodification, and the subtle disciplining of the female body.</p>
                  </div>
              </div>
              <div className="mt-24 max-w-4xl text-center" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] inline-block">Drawing from Nie Xiaoqian (Strange Tales from a Make-Do Studio, pp. 90–102), the textual data reveal telling patterns:</p>
              </div>
            </div>

            <div ref={dataRef} className="min-h-screen w-full relative flex flex-col items-center justify-center py-24 px-4">
              <div className="max-w-5xl w-full text-center" style={{ transform: 'translateZ(60px)' }}>
                <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-32 mb-16 pointer-events-auto cursor-help" onMouseEnter={() => setPanic(true)} onMouseLeave={() => setPanic(false)}>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#e5e5e5] mb-2 group-hover:text-[#ff0000] transition-colors">Positive Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_1'} target={69} className="font-impact text-8xl md:text-9xl text-[#e5e5e5] group-hover:text-[#ff0000] transition-colors duration-100" delay={200} />
                  </div>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#550000] mb-2 group-hover:text-[#ff0000] transition-colors">Negative Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_1'} target={63} className="font-impact text-8xl md:text-9xl text-[#550000] group-hover:text-[#ff0000] transition-colors duration-100" delay={600} />
                  </div>
                </div>
                <div className="mb-16">
                  <h3 className="font-helvetica text-[#cbb8a6] mb-4 uppercase tracking-widest text-sm">Adjectives Used for Female Characters</h3>
                  <AdjectiveList trigger={section === 'DATA' && view === 'CHAPTER_1'} words={['old', 'little', 'young', 'decrepit', 'large', 'decorative', 'frightened', 'venerable', 'startled']} />
                </div>
                <div className="max-w-3xl mx-auto border-t border-[#550000]/50 pt-12">
                   <p className="font-helvetica text-[#cbb8a6] mb-8 uppercase tracking-widest text-sm">Sentence Tone Analysis</p>
                   <ProgressBar label="Positive" value={27.23} color="#e5e5e5" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_1'} delay={200} />
                   <ProgressBar label="Negative" value={30.89} color="#550000" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_1'} delay={600} />
                   <ProgressBar label="Neutral" value={41.88} color="#888888" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_1'} delay={1000} />
                </div>
              </div>
            </div>

            <div ref={narrativeRef} className="min-h-screen w-full relative flex flex-col items-center py-24 px-6 pb-40">
              <div className="flex flex-col items-center gap-0 max-w-6xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-300} angle={-10}>
                    <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/11/chapter-1-3-1.png" alt="Quotes" className="w-[65%] h-auto block mx-auto drop-shadow-none border-none shadow-none" />
                  </FlyInImage>
                  <FlyInImage className="w-full max-w-4xl flex flex-col items-center relative z-10 -mt-4 md:-mt-4" depth={0} angle={0} delay={800}>
                      <div style={{ transform: 'translateZ(100px)' }}>
                        <h3 className="font-chalk text-4xl text-[#e5e5e5] mb-12 border-b-2 border-[#550000] pb-2 inline-block px-4">Consider these sentences:</h3>
                        <div className="w-full space-y-8 px-4">
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_1'} delay={500} text="Since then I have been forced by a demon to do one low-down deed after another. I have to force myself on people immodestly. I certainly did it against my will." citation="(Pu, 1989, p.94)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_1'} delay={1200} text="When someone has relations with me I catch them unawares and puncture their feet with an awl. Then they go into a delirium, and I draw their blood for the demon to drink." citation="(Pu, 1989, p.95)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_1'} delay={2000} text="Young lady, you sure do look like you're right out of a painting. If I were a man you'd even steal my soul." citation="(Pu, 1989, p.93)" />
                        </div>
                      </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-24 px-6" style={{ transform: 'translateZ(80px)' }}>
                  <p className="font-helvetica text-xl text-[#e5e5e5] leading-relaxed text-center">Within the flow of the story, these lines blend seamlessly, evoking little discomfort. However, <span className="font-bold">isolated</span>, they reveal a stark undercurrent of oppression.</p>
                  <div className="text-center animate-bounce opacity-50 font-chalk text-xl mt-24 text-[#e5e5e5]">SCROLLING...</div>
              </div>
            </div>

            {/* CHAPTER 2 */}
            <div ref={chap2IntroRef} className="min-h-screen w-full relative flex flex-col items-center pt-32 px-6 pb-20">
              <div className="text-center mb-16" style={{ transform: 'translateZ(100px)' }}>
                <div className={`transition-all duration-[2000ms] ${section === 'INTRO' || section === 'DATA' || section === 'NARRATIVE' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
                   <h1 className="font-chalk font-bold text-6xl md:text-8xl text-[#e5e5e5] opacity-60 leading-none mb-4">Painted Skin</h1>
                </div>
                <h2 className="font-helvetica font-bold text-2xl md:text-3xl text-[#e5e5e5] max-w-4xl mx-auto">Chapter 2: A Borrowed Skin, or The True Cost of Male Desire?</h2>
              </div>
              <div className="flex flex-col items-center gap-0 max-w-7xl w-full">
                  <FlyInImage className="w-full md:w-[50%] relative z-0 flex justify-center" depth={-250} angle={8}>
                    <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-2-1.png" alt="Painted Skin Intro" className="w-full h-auto object-contain block drop-shadow-none border-none shadow-none mx-auto" />
                  </FlyInImage>
                  <FlyInImage className="w-full md:w-[60%] space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 md:p-8 relative z-10 -mt-6 md:-mt-4" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>Scholar Wang of Taiyuan chances upon a damsel in distress—a ravishing young woman fleeing a brutal marriage as a concubine. Instantly smitten, he takes her into his study, concealing her from prying eyes. She claims her parents sold her for a marriage gift, then suffered beatings daily from a jealous wife.</p>
                    </div>
                  </FlyInImage>
              </div>
            </div>
            
            <div className="min-h-screen w-full relative flex flex-col items-center py-20 px-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-0 max-w-7xl w-full">
                  <FlyInImage className="w-full md:w-6/12 relative z-0" depth={-250} angle={-8}>
                     <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-2-2.png" alt="Painted Skin Reveal" className="w-[90%] md:w-[80%] h-auto object-contain block drop-shadow-none border-none shadow-none mx-auto" />
                  </FlyInImage>
                  <FlyInImage className="w-full md:w-5/12 space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 md:p-8 relative z-10 md:-ml-6" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>But all is not as it seems. A Taoist warns Wang of evil; peeping through his window, he discovers the horrifying truth—his paramour is a demon painting human skin to wear as a garment. The Taoist's charm fails, and the demon murders Wang, ripping out his heart. Only his wife Chen's grotesque sacrifice—eating a beggar's phlegm—revives him. The demon is vanquished, its skin-suit rolled like a scroll.</p>
                    </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-20 px-6" style={{ transform: 'translateZ(120px)' }}>
                  <div className="font-helvetica text-xl leading-loose text-[#e5e5e5] italic font-bold">
                      <p>A chilling parable on vanity? Indeed. Yet beneath lurks a starker commentary: the female form as tradable commodity, painted artifice, and vessel for ritual humiliation.</p>
                      <br/>
                      <p>Scholar Wang's wife, Chen Shi, is coerced into the ultimate degradation—consuming a beggar's phlegm—under crushing feudal duty. Society may laud such sacrifice as virtue, but this is mere window-dressing for exploitation: a disciplinary mechanism that instrumentalises women's bodies for male salvation. The tale, then, is less about demonic deception than about the insidious body politics of patriarchy.</p>
                  </div>
              </div>
              <div className="mt-24 max-w-4xl text-center" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] inline-block">Drawing from Painted Skin (Strange Tales from a Make-Do Studio, pp. 53–60), the textual data reveal telling patterns:</p>
              </div>
            </div>

            <div ref={chap2DataRef} className="min-h-screen w-full relative flex flex-col items-center justify-center py-24 px-4">
              <div className="max-w-5xl w-full text-center" style={{ transform: 'translateZ(60px)' }}>
                <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-32 mb-16 pointer-events-auto cursor-help" onMouseEnter={() => setPanic(true)} onMouseLeave={() => setPanic(false)}>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#e5e5e5] mb-2 group-hover:text-[#ff0000] transition-colors">Positive Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_2'} target={38} className="font-impact text-8xl md:text-9xl text-[#e5e5e5] group-hover:text-[#ff0000] transition-colors duration-100" delay={200} />
                  </div>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#550000] mb-2 group-hover:text-[#ff0000] transition-colors">Negative Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_2'} target={60} className="font-impact text-8xl md:text-9xl text-[#550000] group-hover:text-[#ff0000] transition-colors duration-100" delay={600} />
                  </div>
                </div>
                
                {/* NEW TEXT FOR CHAPTER 2 */}
                <p className="font-helvetica text-sm md:text-base text-[#e5e5e5] max-w-2xl mx-auto text-center mt-8 mb-16 px-4 leading-relaxed">
                  In "Painted Skin", there are as many as 82 negative words in the original Chinese text, while in the English translation, it has dropped to 61, a decrease of more than 25%.
                </p>

                <div className="mb-16">
                  <h3 className="font-helvetica text-[#cbb8a6] mb-4 uppercase tracking-widest text-sm">Adjectives Used for Female Characters</h3>
                  <AdjectiveList trigger={section === 'DATA' && view === 'CHAPTER_2'} words={['lone', 'young', 'youthful', 'beautiful', 'ravishing', 'delighted', 'moody', 'frightful', 'green-faced', 'hideous', 'fearsome', 'bewitching', 'terrified', 'tearful', 'stricken', 'flushed', 'reluctant', 'humiliated', 'miserable', 'amazed', 'awestruck', 'old']} />
                </div>
                <div className="max-w-3xl mx-auto border-t border-[#550000]/50 pt-12">
                   <p className="font-helvetica text-[#cbb8a6] mb-8 uppercase tracking-widest text-sm">Sentence Tone Analysis</p>
                   <ProgressBar label="Positive" value={24.14} color="#e5e5e5" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_2'} delay={200} />
                   <ProgressBar label="Negative" value={33.62} color="#550000" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_2'} delay={600} />
                   <ProgressBar label="Neutral" value={42.24} color="#888888" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_2'} delay={1000} />
                </div>
              </div>
            </div>

            <div ref={chap2NarrativeRef} className="min-h-screen w-full relative flex flex-col items-center py-24 px-6 pb-40">
              <div className="flex flex-col items-center gap-0 max-w-6xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-300} angle={-8}>
                        <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-2-3.png" alt="Painted Skin Ending" className="w-[85%] md:w-[50%] h-auto block mx-auto drop-shadow-none border-none shadow-none" />
                  </FlyInImage>
                  <FlyInImage className="w-full max-w-4xl flex flex-col items-center relative z-10 -mt-2 md:-mt-2" depth={0} angle={0} delay={800}>
                      <div style={{ transform: 'translateZ(100px)' }}>
                        <h3 className="font-chalk text-4xl text-[#e5e5e5] mb-12 border-b-2 border-[#550000] pb-2 inline-block px-4">Consider these sentences:</h3>
                        <div className="w-full space-y-8 px-4">
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_2'} delay={500} text="My parents sold me to a rich family as a concubine, thinking of nothing but the marriage gift they would receive." citation="(Pu, 1989, p.53)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_2'} delay={1200} text="The wife was terribly jealous: mornings she reviled me and evenings she insulted me with beatings." citation="(Pu, 1989, p.53)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_2'} delay={2000} text="It spread a human skin on the bed, and painted the skin with colordipped brushes. That done, the demon threw the brushes aside, lifted the skin and shook the wrinkles out as if it were a piece of clothing. The demon pulled the skin over its body and changed instantly into a young woman." citation="(Pu, 1989, p.55-p.56)" />
                        </div>
                      </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-24 px-6" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] leading-relaxed text-center mb-8">
                     Taken together, the patterns in Painted Skin make plain how the tale hinges on disciplining the female body—through fear, spectacle and moral judgement—while reinforcing a gaze that renders women vessels of desire, danger or duty.
                   </p>
                   <div className="text-center animate-bounce opacity-50 font-chalk text-xl mt-24 text-[#e5e5e5]">SCROLLING...</div>
              </div>
            </div>

            <div ref={chap2MatterRef} className="min-h-screen w-full flex flex-col items-center justify-center relative py-20 px-6">
                <div className="max-w-4xl w-full text-center" style={{ transform: 'translateZ(100px)' }}>
                     <h2 className="font-chalk font-bold text-5xl md:text-6xl text-[#e5e5e5] mb-8">From text to matter</h2>
                     <p className="font-helvetica text-xl text-[#e5e5e5] leading-relaxed mb-12">
                        By materialising text, the invisible power of language becomes visible—and tangible. <br/><br/>
                        The Window with Thorns encodes the sharpness of negative words in Painted Skin. Looking through it means looking through violence.
                     </p>
                     
                     <div 
                        onClick={() => setActiveModel('WINDOW')}
                        className="relative group cursor-pointer w-full max-w-2xl mx-auto perspective-1000 pointer-events-auto"
                     >
                        <img 
                            src="https://invisiblepalmistry.com/wp-content/uploads/2025/10/IMG_0631.jpg" 
                            alt="The Window with Thorns" 
                            className="w-full h-auto rounded-sm shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="font-chalk text-2xl text-white border border-white px-6 py-2 bg-black/50">Explore 3D Artifact</span>
                        </div>
                     </div>
                     <p className="mt-6 font-helvetica text-sm text-[#aaa] uppercase tracking-widest">
                        3D modelling of The Window with Thorns (Data visualization from the text, Painted Skin, (Pu, 1989)).
                     </p>
                </div>
            </div>

            {/* CHAPTER 3 */}
            <div ref={chap3IntroRef} className="min-h-screen w-full relative flex flex-col items-center pt-32 px-6 pb-20">
              <div className="text-center mb-16" style={{ transform: 'translateZ(100px)' }}>
                <div className={`transition-all duration-[2000ms] ${section === 'INTRO' || section === 'DATA' || section === 'NARRATIVE' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
                   <h1 className="font-chalk font-bold text-6xl md:text-8xl text-[#e5e5e5] opacity-60 leading-none mb-4">A Ride in a Goose Cage</h1>
                </div>
                <h2 className="font-helvetica font-bold text-2xl md:text-3xl text-[#e5e5e5] max-w-4xl mx-auto">Chapter 3: The Mouth as Prison, or The Matryoshka of Feudal Objectification?</h2>
              </div>
              <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-250} angle={8}>
                    <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-3-1.png" alt="Goose Cage Intro" className="w-[100%] md:w-[60%] h-auto object-contain block drop-shadow-none border-none shadow-none mx-auto" />
                  </FlyInImage>
                  <FlyInImage className="w-full space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 relative z-10 -mt-4" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>On a mountain road, Xu Yan encounters a scholar of uncanny poise—barely eighteen, flawless in face, and strangely composed. Complaining of sore feet, the youth asks for a lift in Xu’s goose cage. Before Xu can laugh it off, the boy has slipped inside without stretching the bars or adding any weight.</p>
                      <p>Resting beneath a tree, Xu watches in frozen disbelief as the scholar parts his lips and produces a bronze food vessel, followed by dish after dish of impossible delicacies. Then comes a girl—sixteen, radiant, perfectly formed—emerging from his mouth as though she were no more than a trinket. While the scholar sleeps, she discreetly summons her own lover; he, in turn, reveals yet another woman. Bodies appear, embrace, feast, and vanish back into mouths at the slightest rustle of danger.</p>
                    </div>
                  </FlyInImage>
              </div>
            </div>
            
            <div className="min-h-screen w-full relative flex flex-col items-center py-20 px-6">
              <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-250} angle={-8}>
                     <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-3-2.png" alt="Goose Cage Reveal" className="w-[100%] md:w-[60%] h-auto object-contain block drop-shadow-none border-none shadow-none mx-auto" />
                  </FlyInImage>
                  <FlyInImage className="w-full space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 relative z-10 -mt-2" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>When the scholar awakens, he calmly reclaims girl and bronzeware alike into the dark of his throat, leaving Xu only a single ancient plate.</p>
                    </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-20 px-6" style={{ transform: 'translateZ(120px)' }}>
                  <div className="font-helvetica text-xl leading-loose text-[#e5e5e5] italic font-bold">
                      <p>A light tale on the surface, yet beneath it lies something colder: a world where bodies fold, shrink, and obey—portable companions arranged, concealed and retrieved like objects of convenience.</p>
                  </div>
              </div>
              <div className="mt-24 max-w-4xl text-center" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] inline-block">Drawing from A Ride in a Goose Cage (Into the Porcelain Pillow: 101 Tales from Records of the Taiping Era, pp. 54–56), the textual data reveal telling patterns:</p>
              </div>
            </div>

            <div ref={chap3DataRef} className="min-h-screen w-full relative flex flex-col items-center justify-center py-24 px-4">
              <div className="max-w-5xl w-full text-center" style={{ transform: 'translateZ(60px)' }}>
                <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-32 mb-16 pointer-events-auto cursor-help" onMouseEnter={() => setPanic(true)} onMouseLeave={() => setPanic(false)}>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#e5e5e5] mb-2 group-hover:text-[#ff0000] transition-colors">Positive Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_3'} target={16} className="font-impact text-8xl md:text-9xl text-[#e5e5e5] group-hover:text-[#ff0000] transition-colors duration-100" delay={200} />
                  </div>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#550000] mb-2 group-hover:text-[#ff0000] transition-colors">Negative Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_3'} target={2} className="font-impact text-8xl md:text-9xl text-[#550000] group-hover:text-[#ff0000] transition-colors duration-100" delay={600} />
                  </div>
                </div>

                {/* NEW TEXT FOR CHAPTER 3 */}
                <p className="font-helvetica text-sm md:text-base text-[#e5e5e5] max-w-2xl mx-auto text-center mt-8 mb-16 px-4 leading-relaxed">
                  In "A Ride in a Goose Cage", this reduction is even more drastic, with negative vocabulary plummeting from 11 to 4, a drop of more than 60%.
                </p>

                <div className="mb-16">
                  <h3 className="font-helvetica text-[#cbb8a6] mb-4 uppercase tracking-widest text-sm">Adjectives Used for Female Characters</h3>
                  <AdjectiveList trigger={section === 'DATA' && view === 'CHAPTER_3'} words={['budding', 'bright', 'celestial', 'lovely', 'early']} />
                </div>
                <div className="max-w-3xl mx-auto border-t border-[#550000]/50 pt-12">
                   <p className="font-helvetica text-[#cbb8a6] mb-8 uppercase tracking-widest text-sm">Sentence Tone Analysis</p>
                   <ProgressBar label="Positive" value={36.36} color="#e5e5e5" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_3'} delay={200} />
                   <ProgressBar label="Negative" value={6.06} color="#550000" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_3'} delay={600} />
                   <ProgressBar label="Neutral" value={57.58} color="#888888" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_3'} delay={1000} />
                </div>
              </div>
            </div>

            <div ref={chap3NarrativeRef} className="min-h-screen w-full relative flex flex-col items-center py-24 px-6 pb-40">
              <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-300} angle={-8}>
                        <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-3-3.png" alt="Goose Cage Ending" className="w-[85%] md:w-[60%] h-auto block mx-auto drop-shadow-none border-none shadow-none" />
                  </FlyInImage>
                  <FlyInImage className="w-full flex flex-col items-center relative z-10 -mt-2" depth={0} angle={0} delay={800}>
                      <div style={{ transform: 'translateZ(100px)' }}>
                        <h3 className="font-chalk text-4xl text-[#e5e5e5] mb-12 border-b-2 border-[#550000] pb-2 inline-block px-4">Consider these sentences:</h3>
                        <div className="w-full space-y-8 px-4">
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_3'} delay={500} text="Finding no objection from Xu, the scholar disgorged from his mouth a girl of the budding age of 16, her clothes bright with color, her features of celestial beauty. She sat down and dined with them." citation="(Li et al., 1998, p.54)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_3'} delay={1200} text="He grabbed up the woman and stuffed her back into his mouth." citation="(Li et al., 1998, p.56)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_3'} delay={2000} text="He threw the girl and all the bronzeware back into his mouth." citation="(Li et al., 1998, p.56)" />
                        </div>
                      </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-24 px-6" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] leading-relaxed text-center mb-8">
                     If the human body can be shaped, swallowed and summoned at will, does it lose its subjectivity and become an object? There are no obvious negative words and sentences in this article, but in relation to the context, you can intuitively feel the power structure, objectification of women, and body politics.
                   </p>
                   <div className="text-center animate-bounce opacity-50 font-chalk text-xl mt-24 text-[#e5e5e5]">SCROLLING...</div>
              </div>
            </div>

            <div ref={chap3MatterRef} className="min-h-screen w-full flex flex-col items-center justify-center relative py-20 px-6">
                <div className="max-w-4xl w-full text-center" style={{ transform: 'translateZ(100px)' }}>
                     <h2 className="font-chalk font-bold text-5xl md:text-6xl text-[#e5e5e5] mb-8">From text to matter</h2>
                     <p className="font-helvetica text-xl text-[#e5e5e5] leading-relaxed mb-12">
                        By materialising text, the invisible power of language becomes visible—and tangible. <br/><br/>
                        The Goose Cage with Thorns materialises the layered constraints of A Ride in a Goose Cage. What was metaphor on paper becomes matter in the hand.
                     </p>
                     
                     <div 
                        onClick={() => setActiveModel('GOOSE')}
                        className="relative group cursor-pointer w-full max-w-2xl mx-auto perspective-1000 pointer-events-auto"
                     >
                        <img 
                            src="https://invisiblepalmistry.com/wp-content/uploads/2025/10/3.jpg" 
                            alt="The Goose Cage with Thorns" 
                            className="w-full h-auto rounded-sm shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="font-chalk text-2xl text-white border border-white px-6 py-2 bg-black/50">Explore 3D Artifact</span>
                        </div>
                     </div>
                     <p className="mt-6 font-helvetica text-sm text-[#aaa] uppercase tracking-widest">
                        3D modelling of The Goose cage with thorns (Data visualization from the text, A Ride in a Goose Cage, (Li Fang et al., 1998)).
                     </p>
                </div>
            </div>

            {/* CHAPTER 4 */}
            <div ref={chap4IntroRef} className="min-h-screen w-full relative flex flex-col items-center pt-32 px-6 pb-20">
              <div className="text-center mb-16" style={{ transform: 'translateZ(100px)' }}>
                <div className={`transition-all duration-[2000ms] ${section === 'INTRO' || section === 'DATA' || section === 'NARRATIVE' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
                   <h1 className="font-chalk font-bold text-6xl md:text-8xl text-[#e5e5e5] opacity-60 leading-none mb-4">Ms. Wei’s Dragon Ride</h1>
                </div>
                <h2 className="font-helvetica font-bold text-2xl md:text-3xl text-[#e5e5e5] max-w-4xl mx-auto">Chapter 4: Is it too bizarre for the woman to be rescued by a dragon, or is she an asset that needs to be proven by the owner?</h2>
              </div>
              <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-250} angle={8}>
                    <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-4-1.png" alt="Dragon Ride Intro" className="w-[85%] md:w-[80%] h-auto object-contain block drop-shadow-none border-none shadow-none mx-auto" />
                  </FlyInImage>
                  <FlyInImage className="w-full space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 relative z-10 -mt-4" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>During the Eastern Jin Dynasty, a lady named Ms. Wei accidentally fell into the abyss from her horse when she was walking with her husband. Her husband did not save her, but hurriedly toasted the gods with a glass of wine, and continued on his way, abandoning her to fate. Ms. Wei barely survived on snow and fallen leaves, and finally climbed onto a passing dragon and was at the mercy of it.</p>
                      <p>She was thrown near her brother's county and had to persuade a fisherman to ferry her with a generous reward before proving her identity to her brother. Despite her resemblance to her brother, her brother was suspicious until her husband's obituary was served - this male official document finally confirmed her existence. Only then was she able to return to her husband.</p>
                    </div>
                  </FlyInImage>
              </div>
            </div>
            
            <div className="min-h-screen w-full relative flex flex-col items-center py-20 px-6">
              <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-250} angle={-8}>
                     <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-4-2.png" alt="Dragon Ride Reveal" className="w-[85%] md:w-[80%] h-auto object-contain block drop-shadow-none border-none shadow-none mx-auto" />
                  </FlyInImage>
                  <FlyInImage className="w-full space-y-8 font-helvetica text-xl leading-loose text-[#e5e5e5] p-4 relative z-10 -mt-4" depth={0} angle={0} delay={800}>
                    <div style={{ transform: 'translateZ(100px)' }}>
                      <p>On the surface, this story is an adventure, but in fact it hides a deep analysis of feudal society and politics: women's identity must be dependent on men's recognition. Ms. Wei's testimony, tears, and her tormented body did not help - only an obituary sent by her husband could give her legitimacy.</p>
                      <p>Without male relatives, she cannot exist; She couldn't prove her identity. Her identity is not herself, but a property that needs to be identified, transported, and returned.</p>
                    </div>
                  </FlyInImage>
              </div>
              <div className="mt-24 max-w-4xl text-center" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] inline-block">Drawing from Ms. Wei’s Dragon Ride (Into the Porcelain Pillow: 101 Tales from Records of the Taiping Era, pp. 177–179), the textual data reveal telling patterns:</p>
              </div>
            </div>

            <div ref={chap4DataRef} className="min-h-screen w-full relative flex flex-col items-center justify-center py-24 px-4">
              <div className="max-w-5xl w-full text-center" style={{ transform: 'translateZ(60px)' }}>
                <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-32 mb-16 pointer-events-auto cursor-help" onMouseEnter={() => setPanic(true)} onMouseLeave={() => setPanic(false)}>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#e5e5e5] mb-2 group-hover:text-[#ff0000] transition-colors">Positive Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_4'} target={12} className="font-impact text-8xl md:text-9xl text-[#e5e5e5] group-hover:text-[#ff0000] transition-colors duration-100" delay={200} />
                  </div>
                  <div className="text-center group">
                    <div className="font-helvetica uppercase tracking-widest text-sm text-[#550000] mb-2 group-hover:text-[#ff0000] transition-colors">Negative Keywords</div>
                    <AnimatedCounter trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_4'} target={19} className="font-impact text-8xl md:text-9xl text-[#550000] group-hover:text-[#ff0000] transition-colors duration-100" delay={600} />
                  </div>
                </div>
                <div className="mb-16">
                  <h3 className="font-helvetica text-[#cbb8a6] mb-4 uppercase tracking-widest text-sm">Adjectives Used for Female Characters</h3>
                  <AdjectiveList trigger={section === 'DATA' && view === 'CHAPTER_4'} words={['unhurt', 'terrified', 'frightened', 'weak', 'pale', 'haggard']} />
                </div>
                <div className="max-w-3xl mx-auto border-t border-[#550000]/50 pt-12">
                   <p className="font-helvetica text-[#cbb8a6] mb-8 uppercase tracking-widest text-sm">Sentence Tone Analysis</p>
                   <ProgressBar label="Positive" value={36.36} color="#e5e5e5" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_4'} delay={200} />
                   <ProgressBar label="Negative" value={18} color="#550000" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_4'} delay={600} />
                   <ProgressBar label="Neutral" value={26} color="#888888" trigger={(section === 'DATA' || section === 'NARRATIVE') && view === 'CHAPTER_4'} delay={1000} />
                </div>
              </div>
            </div>

            <div ref={chap4NarrativeRef} className="min-h-screen w-full relative flex flex-col items-center py-24 px-6 pb-40">
              <div className="flex flex-col items-center gap-0 max-w-6xl w-full">
                  <FlyInImage className="w-full relative z-0 flex justify-center" depth={-300} angle={-8}>
                        <img src="https://invisiblepalmistry.com/wp-content/uploads/2025/12/chapter-4-3.png" alt="Dragon Ride Ending" className="w-[75%] md:w-[65%] h-auto block mx-auto drop-shadow-none border-none shadow-none" />
                  </FlyInImage>
                  <FlyInImage className="w-full max-w-4xl flex flex-col items-center relative z-10 -mt-4 md:-mt-4" depth={0} angle={0} delay={800}>
                      <div style={{ transform: 'translateZ(100px)' }}>
                        <h3 className="font-chalk text-4xl text-[#e5e5e5] mb-12 border-b-2 border-[#550000] pb-2 inline-block px-4">Consider these sentences:</h3>
                        <div className="w-full space-y-8 px-4">
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_4'} delay={500} text="Too frightened to open her eyes, she held tightly onto the dragon, resigning herself to its wishes." citation="(Li et al., 1998, p.178)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_4'} delay={1200} text="Except for her pale face and haggard appearance she otherwise looked exactly like his sister, but, her tears and her account of the miraculous deliverance did not have him thoroughly convinced." citation="(Li et al., 1998, p.179)" />
                        <SmokeQuote trigger={section === 'NARRATIVE' && view === 'CHAPTER_4'} delay={2000} text="It was not until a few days later when the obituary of his sister's death arrived from his brother-in law that his doubts were swept away and the happiness of their reunion was fully savored." citation="(Li et al., 1998, p.179)" />
                        </div>
                      </div>
                  </FlyInImage>
              </div>
              <div className="w-full max-w-4xl mx-auto text-center mt-24 px-6" style={{ transform: 'translateZ(80px)' }}>
                   <p className="font-helvetica text-xl text-[#e5e5e5] leading-relaxed text-center mb-32">
                     Why must a woman survive a dragon's embrace only to require her husband's obituary to prove she is still alive? <br/><br/>
                     In the male-centred knowledge system, women's words are regarded as untrustworthy and have no truth value, and only documents (obituaries) issued by men have legal effect. It is an epistemological injustice in which women are systematically denied the right to testify for themselves. She needs the news of her husband's death to prove that she is alive, which just shows that her identity has never belonged to herself, but is a relational existence attached to male relatives. Her resurrection is nothing more than a "certificate of ownership" reissued by male authority.
                   </p>
                   
                   {/* ENTER GARDEN TRIGGER */}
                   <div className="mt-48 mb-32 flex justify-center pointer-events-auto">
                        <button 
                            onClick={startDataTransition}
                            className="group flex flex-col items-center gap-4 font-chalk text-2xl md:text-4xl text-white border-2 border-white px-8 py-4 hover:bg-white hover:text-black transition-all duration-500 rounded-sm tracking-widest max-w-2xl text-center leading-tight"
                        >
                            <span>Data Garden of Parts of Speech Analysis of Classical Chinese Literature</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-bounce group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                   </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};