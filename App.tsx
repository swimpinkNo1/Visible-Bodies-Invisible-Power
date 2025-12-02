
import React, { useState, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { CustomCursor } from './components/CustomCursor';
import { SelectionState, ViewState, SectionState } from './types';

// --- SOUND TOGGLE COMPONENT ---
const SoundToggle: React.FC<{ muted: boolean; onToggle: () => void }> = ({ muted, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="fixed bottom-8 right-8 z-[1000] p-2 bg-[#1a1816]/80 text-[#e5e5e5] rounded-full border border-[#550000]/50 hover:bg-[#550000] hover:scale-110 transition-all duration-300 drop-shadow-lg group"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        // Muted Icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      ) : (
        // Speaker Wave Icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      )}
    </button>
  );
};

// --- AUDIO MANAGER ---
const AudioController: React.FC<{ view: ViewState; section: SectionState; panic: boolean; muted: boolean }> = ({ view, section, panic, muted }) => {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const ghostAlleyRef = useRef<HTMLAudioElement | null>(null); // BGM for Chap 2 Matter
  const gooseCageRef = useRef<HTMLAudioElement | null>(null); // BGM for Chap 3 Matter
  const doorRef = useRef<HTMLAudioElement | null>(null);
  const bladeRef = useRef<HTMLAudioElement | null>(null);
  const breathingRef = useRef<HTMLAudioElement | null>(null);
  
  // State to track if user has interacted with the page (required for auto-play)
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Store intervals to clear them to prevent overlapping fades
  const fadeIntervals = useRef<Map<HTMLAudioElement, number>>(new Map());

  // Track previous view to detect transitions
  const prevViewRef = useRef<ViewState>(view);
  const prevPanicRef = useRef<boolean>(panic);

  useEffect(() => {
    // Initialize Audio objects
    
    // BGM: Low volume atmosphere
    ambientRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/人间魔域-青蛇1H7K4.mp3'); 
    ambientRef.current.loop = true;
    ambientRef.current.volume = 0; 

    // BGM 2: Ghost Alley (Triggered in Chap 2 Matter Section)
    ghostAlleyRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/鬼巷.mp3');
    ghostAlleyRef.current.loop = true;
    ghostAlleyRef.current.volume = 0;

    // BGM 3: Goose Cage (Triggered in Chap 3 Matter Section)
    gooseCageRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/鹅笼.mp3');
    gooseCageRef.current.loop = true;
    gooseCageRef.current.volume = 0;

    // Transition SFX: Door Squeak (One Shot)
    doorRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/588509__tampajoey__wooddoorsqueak.wav'); 
    doorRef.current.loop = false;
    doorRef.current.volume = 0.8;
    
    // Data/Panic SFX: Bloody Blade (One Shot/Short)
    bladeRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/323526__kreastricon62__bloody-blade-2.wav'); 
    bladeRef.current.loop = false;
    bladeRef.current.volume = 0.8;

    // Narrative SFX: Heavy Breathing (Loop)
    breathingRef.current = new Audio('https://invisiblepalmistry.com/wp-content/uploads/2025/11/572452__vanalosswen__female-heavy-breathing-in-pain.wav'); 
    breathingRef.current.loop = true;
    breathingRef.current.volume = 0;

    // Interaction listener to unlock audio context
    const unlockAudio = () => {
      setHasInteracted(true);
      // Attempt to play ambient immediately to bless the audio context
      ambientRef.current?.play().catch((e) => {});
      
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    // Attempt autoplay immediately
    ambientRef.current.play().then(() => {
      setHasInteracted(true);
    }).catch(() => {
      // Fallback to interaction if autoplay blocked
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    });

    return () => {
      ambientRef.current?.pause();
      ghostAlleyRef.current?.pause();
      gooseCageRef.current?.pause();
      doorRef.current?.pause();
      bladeRef.current?.pause();
      breathingRef.current?.pause();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      fadeIntervals.current.forEach(clearInterval);
    };
  }, []);

  // Handle Logic
  useEffect(() => {
    // GUARD: Do not attempt to play or fade audio until the user has interacted
    if (!hasInteracted) return;

    // --- Helper: One Shot Player ---
    const playOneShot = (audio: HTMLAudioElement | null) => {
        if (!audio || muted) return;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("SFX play failed:", e));
    };

    // --- Helper: Fader ---
    const fadeTo = (audio: HTMLAudioElement | null, targetVol: number) => {
      if (!audio) return;
      
      const finalTarget = muted ? 0 : targetVol;

      if (finalTarget > 0 && audio.paused) {
        audio.play().catch(e => console.warn("Fade play failed:", e));
      }

      if (fadeIntervals.current.has(audio)) {
        clearInterval(fadeIntervals.current.get(audio)!);
        fadeIntervals.current.delete(audio);
      }

      const step = finalTarget > audio.volume ? 0.05 : -0.05;

      const interval = window.setInterval(() => {
        let next = audio.volume + step;
        if (next > 1) next = 1;
        if (next < 0) next = 0;

        const finished = (step > 0 && next >= finalTarget) || (step < 0 && next <= finalTarget);

        if (finished) {
          audio.volume = finalTarget;
          if (finalTarget === 0) {
            audio.pause();
          }
          clearInterval(interval);
          fadeIntervals.current.delete(audio);
        } else {
          audio.volume = next;
        }
      }, 100);

      fadeIntervals.current.set(audio, interval);
    };

    // --- 1. Ambient BGM Logic ---
    const isChap2Matter = view === 'CHAPTER_2' && section === 'MATTER';
    const isChap3Matter = view === 'CHAPTER_3' && section === 'MATTER';
    const isDataGarden = view === 'DATA_GARDEN';
    
    if (isChap2Matter) {
        // Swap to Ghost Alley
        fadeTo(ambientRef.current, 0);
        fadeTo(ghostAlleyRef.current, 0.6);
        fadeTo(gooseCageRef.current, 0);
    } else if (isChap3Matter) {
        // Swap to Goose Cage
        fadeTo(ambientRef.current, 0);
        fadeTo(ghostAlleyRef.current, 0);
        fadeTo(gooseCageRef.current, 0.6);
    } else if (isDataGarden) {
        // Quiet in Garden? Or keep ambient? Let's keep ambient low
        fadeTo(ambientRef.current, 0.2);
        fadeTo(ghostAlleyRef.current, 0);
        fadeTo(gooseCageRef.current, 0);
    } else {
        // Swap back to Main BGM (if not home)
        fadeTo(ghostAlleyRef.current, 0);
        fadeTo(gooseCageRef.current, 0);
        
        if (view === 'HOME') {
           fadeTo(ambientRef.current, 0.3); 
        } else {
           fadeTo(ambientRef.current, 0.3);
        }
    }

    // --- 2. Door Squeak (Transition to New Chapter) ---
    // Trigger when entering a new chapter
    const enteringChapter1 = view === 'CHAPTER_1' && prevViewRef.current !== 'CHAPTER_1';
    const enteringChapter2 = view === 'CHAPTER_2' && prevViewRef.current !== 'CHAPTER_2';
    const enteringChapter3 = view === 'CHAPTER_3' && prevViewRef.current !== 'CHAPTER_3';
    const enteringChapter4 = view === 'CHAPTER_4' && prevViewRef.current !== 'CHAPTER_4';

    if (enteringChapter1 || enteringChapter2 || enteringChapter3 || enteringChapter4) {
        playOneShot(doorRef.current);
    }
    prevViewRef.current = view;

    // --- 3. Blade Sound (Panic/Data Hover) ---
    // Trigger when panic turns TRUE
    if (panic && !prevPanicRef.current) {
        playOneShot(bladeRef.current);
    }
    prevPanicRef.current = panic;

    // --- 4. Breathing (Narrative Section) ---
    // Fade in when in NARRATIVE section of any Chapter
    // STOP breathing in Data Garden
    const inNarrative = (view === 'CHAPTER_1' || view === 'CHAPTER_2' || view === 'CHAPTER_3' || view === 'CHAPTER_4') && section === 'NARRATIVE';
    
    if (inNarrative && !isDataGarden) {
        fadeTo(breathingRef.current, 0.6);
    } else {
        fadeTo(breathingRef.current, 0);
    }

  }, [view, section, panic, muted, hasInteracted]);

  return null;
};

const BloodOverlay: React.FC<{ triggered: boolean }> = ({ triggered }) => {
  return (
    <div 
      className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-100 ease-out ${triggered ? 'opacity-60' : 'opacity-0'}`}
      style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(100, 0, 0, 0.5) 50%, rgba(70, 0, 0, 0.9) 100%)',
        mixBlendMode: 'multiply'
      }}
    />
  );
};

const App: React.FC = () => {
  const [selection, setSelection] = useState<SelectionState>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [section, setSection] = useState<SectionState>('INTRO');
  const [panic, setPanic] = useState(false);
  const [bloodTriggered, setBloodTriggered] = useState(false);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (bloodTriggered) {
      const timer = setTimeout(() => setBloodTriggered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [bloodTriggered]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-[#786b5f] ${panic ? 'shake-hard' : ''}`}>
      
      {/* Sound Toggle UI - High Z-Index to stay above Overlays */}
      <SoundToggle muted={isMuted} onToggle={() => setIsMuted(!isMuted)} />

      {/* Audio Manager (Invisible) */}
      <AudioController view={view} section={section} panic={panic} muted={isMuted} />

      <div className="grain-overlay" />
      <BloodOverlay triggered={panic || bloodTriggered} />

      {/* 3D Background */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-out z-0 ${
          selection && view === 'HOME' ? 'blur-sm opacity-60' : 'blur-none opacity-100'
        }`}
      >
        <Scene 
          selection={selection} 
          view={view} 
          section={section}
          onThornPrick={() => setBloodTriggered(true)} 
        />
      </div>

      <Overlay 
        selection={selection} 
        setSelection={setSelection} 
        view={view} 
        setView={setView} 
        section={section} 
        setSection={setSection}
        setPanic={setPanic} 
      />

      <CustomCursor />
    </div>
  );
};

export default App;
