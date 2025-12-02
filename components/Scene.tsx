
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { SceneProps, ViewState, SectionState } from '../types';

// Procedural Thorn/Vine Component
const Thorn: React.FC<{ 
  position: [number, number, number]; 
  rotation: [number, number, number];
  scale: number;
  speed: number;
  distortion: number;
  view: ViewState;
  section: SectionState;
  index: number;
  total: number;
  onPrick: () => void;
}> = ({ position: initialPos, rotation, scale: initialScale, speed, distortion, view, section, index, total, onPrick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [randomOffset] = useState(() => Math.random() * 100);

  // STABILIZATION FIX: Calculate direction once, not every frame
  const dir = useMemo(() => {
    const spreadDirection = initialPos[0] >= 0 ? 1 : -1;
    if (Math.abs(initialPos[0]) < 0.1) return index % 2 === 0 ? 1 : -1; 
    return spreadDirection;
  }, [initialPos, index]);

  useFrame((state) => {
    if (!meshRef.current) return;

    // HIDE THORNS IN DATA GARDEN (2D MODE)
    // We shrink them to 0 to let the 2D background take over
    if (view === 'DATA_GARDEN') {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0, 0.05));
        return;
    }

    const time = state.clock.getElapsedTime();
    const isChapterView = view === 'CHAPTER_1' || view === 'CHAPTER_2' || view === 'CHAPTER_3' || view === 'CHAPTER_4';
    
    // --- SPREAD / GATHER LOGIC ---
    let targetSpread = 0;
    
    if (isChapterView) {
      if (section === 'INTRO') targetSpread = 12;
      else if (section === 'DATA') targetSpread = 4;
      else if (section === 'NARRATIVE') targetSpread = 1;
      else if (section === 'MATTER') targetSpread = 6;
    }

    const targetX = initialPos[0] + (dir * targetSpread);
    
    // Smoothly interpolate position
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.03);
    
    // --- DENSITY / VISIBILITY LOGIC ---
    let isVisible = true;
    if (isChapterView) {
        if (section === 'INTRO' && index > total * 0.6) isVisible = false;
        else if (section === 'DATA' && index > total * 0.8) isVisible = false;
    } else {
        // In HOME view, show fewer thorns in background
        if (index > total * 0.5) isVisible = false;
    }

    const targetVisibilityScale = isVisible ? 1 : 0;

    const zOffset = isChapterView ? Math.sin(time * 0.5) * 0.5 : 0;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, initialPos[2] + zOffset, 0.05);

    const growthOverTime = isChapterView ? Math.sin(time * 0.2) * 0.2 : 0;
    const growthMultiplier = isChapterView ? 1.5 : 1;
    const breathing = Math.sin(time * speed + randomOffset) * 0.05;
    const hoverScale = hovered ? 1.2 : 1.0;
    
    const finalTargetScale = (initialScale + breathing + growthOverTime) * growthMultiplier * hoverScale * targetVisibilityScale;
    
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, finalTargetScale, 0.05));
    
    const baseColor = new THREE.Color("#1a1816"); // Dark charcoal
    if (hovered) {
        (meshRef.current.material as any).color.lerp(new THREE.Color("#550000"), 0.1);
    } else {
        (meshRef.current.material as any).color.lerp(baseColor, 0.1);
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh 
        ref={meshRef} 
        position={initialPos} 
        rotation={rotation} 
        scale={initialScale}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (view !== 'HOME') onPrick();
        }}
        onPointerOut={() => setHovered(false)}
      >
        <coneGeometry args={[0.1, 1.2, 5]} /> 
        <MeshDistortMaterial
          color="#1a1816"
          roughness={0.7}
          metalness={0.4}
          distort={distortion}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

// Camera Parallax & Transition Rig
const CameraRig: React.FC<{ view: ViewState; section: SectionState }> = ({ view, section }) => {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();
  const targetZRef = useRef(10);

  useFrame((state) => {
    // Move camera closer when in narrative
    if (view !== 'HOME' && view !== 'DATA_GARDEN') {
      targetZRef.current = 4; 
    } else {
      targetZRef.current = 12;
    }

    const time = state.clock.getElapsedTime();
    const isChapter = (view !== 'HOME' && view !== 'DATA_GARDEN');
    const walkIntensity = isChapter ? (section === 'DATA' ? 0.15 : 0.08) : 0;
    const walkBob = Math.sin(time * 6) * walkIntensity;

    const currentZ = THREE.MathUtils.lerp(camera.position.z, targetZRef.current, 0.02);
    const parallaxIntensity = isChapter ? 0.5 : 2; 
    
    camera.position.lerp(
      vec.set(
        mouse.x * parallaxIntensity, 
        mouse.y * (parallaxIntensity * 0.5) + walkBob, 
        currentZ
      ), 
      0.05
    );
    
    camera.lookAt(0, 0, -5); 
  });

  return null;
};

const Atmosphere: React.FC<{ section: SectionState }> = ({ section }) => {
  const lightColor = section === 'DATA' ? '#660000' : '#4a0404';
  return (
    <>
      <color attach="background" args={['#786b5f']} />
      <fog attach="fog" args={['#786b5f', 0, 20]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color={lightColor} />
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ selection, view, section, onThornPrick }) => {
  const thornCount = 200;
  
  const thorns = useMemo(() => {
    return new Array(thornCount).fill(0).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 25, 
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 20 - 5
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      scale: Math.random() * 0.6 + 0.4,
      speed: Math.random() * 2 + 0.5,
      distortion: Math.random() * 0.6 + 0.2
    }));
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
      <Atmosphere section={section} />
      <CameraRig view={view} section={section} />
      <group>
        {thorns.map((props, i) => (
          <Thorn 
            key={i} 
            {...props} 
            index={i}
            total={thornCount}
            view={view} 
            section={section} 
            onPrick={onThornPrick} 
          />
        ))}
      </group>
      <Environment preset="city" />
    </Canvas>
  );
};
