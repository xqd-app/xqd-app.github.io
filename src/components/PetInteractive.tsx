import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface InteractionState {
  isPetting: boolean;
  isFeeding: boolean;
  isDancing: boolean;
  isSleeping: boolean;
  currentEmotion: 'happy' | 'love' | 'surprised' | 'angry' | 'sleepy' | 'hungry' | 'idle';
  mood: number;
  hunger: number;
  energy: number;
  love: number;
}

interface Particle {
  id: number;
  type: 'heart' | 'star' | 'music' | 'food';
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

useGLTF.preload('/models/Fox.glb');

function FoxModel({ interactionState, isHovered, foxTarget }: {
  isHovered: boolean;
  isIdle: boolean;
  interactionState: InteractionState;
  foxTarget: { x: number; y: number } | null;
}) {
  const modelRef = useRef<any>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<string>('');
  const targetWorldRef = useRef<THREE.Vector3 | null>(null);
  const { scene, animations } = useGLTF('/models/Fox.glb');
  const { camera, raycaster, viewport } = useThree();

  // Compute world target on the ground plane (y = -0.4) from NDC coordinates
  useEffect(() => {
    if (!foxTarget) return;
    const ndc = new THREE.Vector2(foxTarget.x, foxTarget.y);
    raycaster.setFromCamera(ndc, camera);
    // Ground plane: y = -0.4 → normal (0,1,0), constant 0.4
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.4);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hit)) {
      targetWorldRef.current = hit;
    }
  }, [foxTarget, camera, raycaster]);

  useEffect(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.colorSpace = THREE.SRGBColorSpace;
          }
          child.material.needsUpdate = true;
        }
      });
    }
    if (scene && animations && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip: THREE.AnimationClip) => {
        const action = mixerRef.current!.clipAction(clip);
        actionsRef.current[clip.name] = action;
      });
      const idle = actionsRef.current['Idle'] || actionsRef.current['Fox_Idle'] || Object.values(actionsRef.current)[0];
      if (idle) {
        idle.reset().play();
        currentActionRef.current = idle.name;
      }
    }
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      actionsRef.current = {};
    };
  }, [scene, animations]);

  const playAction = (name: string, fadeDuration = 0.3, timeScale = 1) => {
    const next = actionsRef.current[name];
    if (!next || currentActionRef.current === name) {
      if (next) next.timeScale = timeScale;
      return;
    }
    const current = currentActionRef.current ? actionsRef.current[currentActionRef.current] : null;
    next.reset();
    next.timeScale = timeScale;
    next.play();
    if (current) {
      next.crossFadeFrom(current, fadeDuration, false);
    }
    currentActionRef.current = name;
  };

  useFrame((state, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (!modelRef.current) return;

    const t = state.clock.elapsedTime;
    const group = modelRef.current;
    const target = targetWorldRef.current;

    if (interactionState.isDancing) {
      playAction('Dance', 0.2, 1.2);
      group.position.y = Math.abs(Math.sin(t * 8)) * 0.15 - 0.4;
      group.rotation.z = Math.sin(t * 6) * 0.15;
      group.rotation.y = Math.sin(t * 4) * 0.3;
    } else if (interactionState.isPetting) {
      playAction('Idle', 0.2, 1);
      group.position.y = Math.abs(Math.sin(t * 6)) * 0.08 - 0.4;
      group.rotation.y = Math.sin(t * 3) * 0.1;
    } else if (isHovered) {
      playAction('Idle', 0.2, 1);
      group.position.y = Math.abs(Math.sin(t * 5)) * 0.06 - 0.4;
      group.rotation.y = Math.sin(t * 2) * 0.08;
    } else if (target) {
      const dx = target.x - group.position.x;
      const dz = target.z - group.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < 0.05) {
        // Arrived, sit and idle
        playAction('Idle', 0.3, 1);
        group.position.y = -0.4 + Math.sin(t * 2) * 0.015;
      } else {
        // Run towards target
        playAction('Walk', 0.25, 2.5);
        const speed = 2.5;
        const step = Math.min(speed * delta, distance);
        group.position.x += (dx / distance) * step;
        group.position.z += (dz / distance) * step;
        // Face movement direction
        const targetAngle = Math.atan2(dx, dz);
        let angleDiff = targetAngle - group.rotation.y;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        group.rotation.y += angleDiff * Math.min(1, delta * 8);
        // Bounce while running
        group.position.y = -0.4 + Math.abs(Math.sin(t * 12)) * 0.06;
      }
    } else {
      playAction('Idle', 0.3, 1);
      group.position.y = -0.4 + Math.sin(t * 2) * 0.015;
      group.rotation.z = Math.sin(t * 2) * 0.02;
    }
  });

  // Scale based on viewport width so fox matches screen size
  const baseScale = Math.max(0.001, Math.min(0.004, viewport.width * 0.001));

  return (
    <group ref={modelRef} scale={[baseScale, baseScale, baseScale]} position={[0, -0.4, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingIndicator() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={0.5} />
    </mesh>
  );
}

function CuteCat({ isHovered, isIdle, interactionState }: {
  isHovered: boolean;
  isIdle: boolean;
  interactionState: InteractionState;
}) {
  const catRef = useRef<any>(null);
  const tailRef = useRef<any>(null);
  const eyeLRef = useRef<any>(null);
  const eyeRRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const earLRef = useRef<any>(null);
  const earRRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (!catRef.current) return;
    
    const emotion = interactionState.currentEmotion;
    
    if (interactionState.isDancing) {
      catRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.1 + 0.1;
      catRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.1;
      catRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.05;
    } else if (interactionState.isSleeping) {
      catRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.01;
      if (headRef.current) headRef.current.rotation.x = -0.15;
    } else if (emotion === 'love') {
      catRef.current.position.y = Math.sin(state.clock.elapsedTime * 6) * 0.04 + 0.06;
      if (headRef.current) headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.06;
    } else if (emotion === 'surprised') {
      catRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.05 + 0.1;
    } else if (isHovered || interactionState.isPetting) {
      catRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.04 + 0.06;
      if (headRef.current) headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.08;
    } else if (isIdle) {
      catRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.015;
    } else {
      catRef.current.position.y = 0;
      if (headRef.current) headRef.current.rotation.x = headRef.current.rotation.y = 0;
    }

    if (tailRef.current) {
      const tailSpeed = interactionState.isDancing ? 12 : interactionState.isPetting ? 6 : 3;
      const tailAmplitude = interactionState.isDancing ? 0.5 : emotion === 'happy' ? 0.35 : 0.2;
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * tailSpeed) * tailAmplitude + 0.1;
      tailRef.current.rotation.x = Math.cos(state.clock.elapsedTime * tailSpeed * 0.5) * 0.1;
    }

    if (eyeLRef.current && eyeRRef.current && !interactionState.isSleeping) {
      const blink = Math.sin(state.clock.elapsedTime * 5);
      const eyeScale = blink > 0.95 ? 0.05 : emotion === 'surprised' ? 1.3 : emotion === 'happy' ? 1.1 : 1;
      eyeLRef.current.scale.y = eyeScale;
      eyeRRef.current.scale.y = eyeScale;
    }

    if (earLRef.current && earRRef.current && !interactionState.isSleeping) {
      if (interactionState.isPetting || emotion === 'love') {
        earLRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1 + 0.15;
        earRRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10 + 0.5) * 0.1 - 0.15;
      } else {
        earLRef.current.rotation.z = 0.1;
        earRRef.current.rotation.z = -0.1;
      }
    }
  });

  const colors = {
    body: "#FF9933",
    bodyLight: "#FFB866",
    belly: "#FFF8E7",
    bellyLight: "#FFFEF5",
    nose: "#FF7BAE",
    noseLight: "#FFB3D1",
    innerEar: "#FFC0CB",
    blush: "#FFB6C1",
    eyeWhite: "#FFFFFF",
    eyePupil: "#2D2D2D",
    whisker: "#555555",
    stripe: "#3D3D3D",
  };

  return (
    <group ref={catRef}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshBasicMaterial 
          color={interactionState.currentEmotion === 'love' ? "#FF7BAE" : colors.body} 
          transparent 
          opacity={interactionState.isPetting ? 0.08 : 0.02}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          transparent 
          opacity={0.18}
          roughness={1}
        />
      </mesh>

      <mesh position={[0, 0.15, 0]} scale={[1.15, 0.85, 1.25]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial 
          color={colors.body} 
          emissive={colors.body}
          emissiveIntensity={interactionState.isPetting ? 0.1 : 0.02}
          metalness={0.02} 
          roughness={0.55}
          side={2}
        />
      </mesh>

      <mesh position={[0, 0.22, 0.3]} scale={[0.7, 0.45, 0.6]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial 
          color={colors.bodyLight} 
          transparent 
          opacity={0.25}
          side={2}
        />
      </mesh>

      <mesh position={[0, 0.1, 0.32]} scale={[0.95, 0.75, 0.85]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color={colors.belly} metalness={0.02} roughness={0.65} side={2} />
      </mesh>

      <mesh position={[0, 0.14, 0.4]} scale={[0.55, 0.35, 0.5]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial 
          color={colors.bellyLight} 
          transparent 
          opacity={0.35}
          side={2}
        />
      </mesh>

      {[0.15, -0.15].map((z, i) => (
        <mesh key={i} position={[0, 0.18, z]}>
          <torusGeometry args={[0.3, 0.03, 16]} />
          <meshStandardMaterial color={colors.stripe} metalness={0.08} roughness={0.85} side={2} />
        </mesh>
      ))}

      <mesh ref={headRef} position={[0, 0.58, 0.22]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
      </mesh>

      <mesh position={[0, 0.66, 0.38]} scale={[0.55, 0.35, 0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={colors.bodyLight} 
          transparent 
          opacity={0.25}
          side={2}
        />
      </mesh>

      <mesh position={[-0.14, 0.64, 0.22]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.022, 0.022, 0.18, 16]} />
        <meshStandardMaterial color={colors.stripe} side={2} />
      </mesh>
      <mesh position={[0.14, 0.64, 0.22]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.022, 0.022, 0.18, 16]} />
        <meshStandardMaterial color={colors.stripe} side={2} />
      </mesh>

      <mesh position={[0, 0.5, 0.42]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={colors.belly} metalness={0.02} roughness={0.65} side={2} />
      </mesh>

      <mesh ref={earLRef} position={[-0.28, 0.82, -0.03]} rotation={[0, 0.12, 0.15]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
      </mesh>
      <mesh ref={earRRef} position={[0.28, 0.82, -0.03]} rotation={[0, -0.12, -0.15]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
      </mesh>

      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0.02]} scale={[0.5, 0.5, 0.3]}>
          <sphereGeometry args={[0.105, 16, 16]} />
          <meshStandardMaterial color={colors.innerEar} metalness={0.08} roughness={0.45} side={2} />
        </mesh>
      ))}

      {[-0.12, 0.12].map((x, i) => (
        <group key={i}>
          <mesh ref={i === 0 ? eyeLRef : eyeRRef} position={[x, 0.64, 0.42]}>
            <sphereGeometry args={[0.095, 32, 32]} />
            <meshStandardMaterial color={colors.eyeWhite} metalness={0.02} roughness={0.65} side={2} />
          </mesh>
          <mesh position={[x, 0.64, 0.47]}>
            <sphereGeometry args={[0.048, 32, 32]} />
            <meshStandardMaterial color={colors.eyePupil} metalness={0.12} roughness={0.35} side={2} />
          </mesh>
          <mesh position={[x + 0.015, 0.66, 0.48]}>
            <sphereGeometry args={[0.016, 16, 16]} />
            <meshStandardMaterial color="white" metalness={0.25} roughness={0.1} side={2} />
          </mesh>
          <mesh position={[x - 0.008, 0.63, 0.49]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color="#f5f5f5" metalness={0.15} roughness={0.1} side={2} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.52, 0.49]}>
        <sphereGeometry args={[0.045, 32, 32]} />
        <meshStandardMaterial color={colors.nose} metalness={0.12} roughness={0.25} side={2} />
      </mesh>

      <mesh position={[0, 0.53, 0.51]}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial 
          color={colors.noseLight} 
          transparent 
          opacity={0.55}
          side={2}
        />
      </mesh>

      {interactionState.currentEmotion === 'happy' || interactionState.isDancing ? (
        <mesh position={[0, 0.46, 0.47]} rotation={[Math.PI, 0, 0]}>
          <torusGeometry args={[0.075, 0.015, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#2D2D2D" side={2} />
        </mesh>
      ) : interactionState.isSleeping ? (
        <mesh position={[0, 0.48, 0.47]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshStandardMaterial color="#2D2D2D" side={2} />
        </mesh>
      ) : (
        <mesh position={[0, 0.46, 0.47]} rotation={[Math.PI * 0.78, 0, 0]}>
          <torusGeometry args={[0.045, 0.01, 16, 32, Math.PI * 0.5]} />
          <meshStandardMaterial color="#2D2D2D" side={2} />
        </mesh>
      )}

      {[-0.21, 0.21].map((x, i) => (
        <mesh key={i} position={[x, 0.54, 0.39]}>
          <sphereGeometry args={[0.055, 32, 32]} />
          <meshStandardMaterial 
            color={colors.blush} 
            transparent 
            opacity={interactionState.currentEmotion === 'love' || interactionState.isPetting ? 0.55 : 0.28}
            side={2}
          />
        </mesh>
      ))}

      {[-0.21, 0.21].map((x, i) => (
        <mesh key={`blur-${i}`} position={[x, 0.54, 0.39]} scale={[1.6, 1.3, 1]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial 
            color={colors.blush} 
            transparent 
            opacity={(interactionState.currentEmotion === 'love' || interactionState.isPetting ? 0.25 : 0.12)}
            side={2}
          />
        </mesh>
      ))}

      {[-0.17, 0.17].map((x, i) => (
        [0, -0.045, 0.045].map((dy, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.5 + dy, 0.46]} rotation={[0, 0, x > 0 ? -0.08 + j * 0.1 : 0.08 - j * 0.1]}>
            <cylinderGeometry args={[0.005, 0.005, 0.17, 8]} />
            <meshStandardMaterial color={colors.whisker} side={2} />
          </mesh>
        ))
      ))}

      <group ref={tailRef} position={[0, 0.14, -0.45]}>
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.055, 0.035, 0.28, 16]} />
          <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
        </mesh>
        <mesh position={[0.05, 0.14, 0]} rotation={[0.15, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.025, 0.18, 16]} />
          <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
        </mesh>
        <mesh position={[0.11, 0.19, 0]}>
          <sphereGeometry args={[0.042, 16, 16]} />
          <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
        </mesh>
      </group>

      <mesh position={[0.02, 0.08, -0.45]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.045, 0.01, 8]} />
        <meshStandardMaterial color={colors.stripe} side={2} />
      </mesh>

      {[-0.21, 0.21].map((x, i) => (
        <group key={i} position={[x, 0.03, 0.28]}>
          <mesh rotation={[0.15, 0, 0]}>
            <sphereGeometry args={[0.105, 16, 16]} />
            <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
          </mesh>
          <mesh position={[0, 0, 0.1]} rotation={[0.35, 0, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color={colors.belly} metalness={0.02} roughness={0.65} side={2} />
          </mesh>
        </group>
      ))}

      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.03, -0.22]}>
          <sphereGeometry args={[0.095, 16, 16]} />
          <meshStandardMaterial color={colors.body} metalness={0.02} roughness={0.55} side={2} />
        </mesh>
      ))}
    </group>
  );
}

function ParticleEffect({ particles }: { particles: Particle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            transform: `scale(${particle.scale}) rotate(${Math.random() * 30 - 15}deg)`,
            animation: 'floatUp 2s ease-out forwards',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          }}
        >
          {particle.type === 'heart' && <span className="text-2xl">❤️</span>}
          {particle.type === 'star' && <span className="text-2xl">⭐</span>}
          {particle.type === 'music' && <span className="text-2xl">🎵</span>}
          {particle.type === 'food' && <span className="text-2xl">🍖</span>}
        </div>
      ))}
    </div>
  );
}

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium text-gray-600 w-12">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${value}%`, 
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 10px ${color}66`
          }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 w-8">{value}%</span>
    </div>
  );
}

function InteractionButton({ icon, label, onClick, active = false }: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all duration-300
        ${active 
          ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white scale-110 shadow-xl shadow-purple-500/40' 
          : 'bg-white/95 hover:bg-gradient-to-br hover:from-purple-50 hover:via-purple-100 hover:to-pink-50 text-gray-700'
        }
        shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95
        border border-white/50
      `}
    >
      <span className="text-2xl drop-shadow-md">{icon}</span>
      <span className="text-xs mt-1.5 font-semibold">{label}</span>
    </button>
  );
}

export function DesktopPetInteractive() {
  const [foxTarget, setFoxTarget] = useState<{ x: number; y: number } | null>(null);

  const [interactionState] = useState<InteractionState>({
    isPetting: false,
    isFeeding: false,
    isDancing: false,
    isSleeping: false,
    currentEmotion: 'idle',
    mood: 75,
    hunger: 60,
    energy: 80,
    love: 50,
  });

  // On mount: fox sits at bottom-right corner of the screen
  useEffect(() => {
    setFoxTarget({ x: 0.82, y: -0.82 });
  }, []);

  // Click anywhere on the page → fox runs to that spot
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
      setFoxTarget({ x: ndcX, y: ndcY });
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 50 }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 5, 3]} intensity={1.5} color="#FFCC99" />
        <pointLight position={[-3, -2, -2]} intensity={0.8} color="#FFB6C1" />
        <pointLight position={[0, 3, 2]} intensity={1} color="#FFFFFF" />
        <pointLight position={[0, -3, 0]} intensity={0.4} color="#FFE4B5" />
        <Suspense fallback={null}>
          <FoxModel
            isHovered={false}
            isIdle={true}
            interactionState={interactionState}
            foxTarget={foxTarget}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
