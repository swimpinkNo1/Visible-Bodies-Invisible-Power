
import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastStepPos = useRef({ x: 0, y: 0 });
  const isLeft = useRef(true);
  
  const footLeftUrl = "https://invisiblepalmistry.com/wp-content/uploads/2025/11/Foot_l.png";
  const footRightUrl = "https://invisiblepalmistry.com/wp-content/uploads/2025/11/Foot_r.png";
  const STEP_THRESHOLD = 50;

  useEffect(() => {
    // PRELOAD IMAGES to prevent stutter on first swap
    const imgL = new Image(); imgL.src = footLeftUrl;
    const imgR = new Image(); imgR.src = footRightUrl;

    const onMouseMove = (e: MouseEvent) => {
      if (!cursorRef.current || !imgRef.current) return;

      const x = e.clientX;
      const y = e.clientY;
      
      // Update position directly to avoid React Render Cycle (Major Perf Boost)
      cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;

      // Rotation Logic
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        imgRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      }

      // Step Logic (Optimized squared distance)
      const stepDx = x - lastStepPos.current.x;
      const stepDy = y - lastStepPos.current.y;
      const distSq = stepDx * stepDx + stepDy * stepDy;

      if (distSq > STEP_THRESHOLD * STEP_THRESHOLD) {
        isLeft.current = !isLeft.current;
        imgRef.current.src = isLeft.current ? footLeftUrl : footRightUrl;
        lastStepPos.current = { x, y };
      }

      lastPos.current = { x, y };
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      style={{ 
        transform: 'translate(-100px, -100px)' // Initial off-screen
      }}
    >
      <img 
        ref={imgRef}
        src={footLeftUrl} 
        alt="cursor"
        className="w-12 h-auto opacity-80 mix-blend-multiply"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};
