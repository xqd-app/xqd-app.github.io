import { useRef, useState, useEffect, Suspense } from 'react';
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

useGLTF.preload('/models/Fox.glb');

function FoxModel({ interactionState, isHovered, foxTarget }: {
  isHovered: boolean;
  isIdle: boolean;
  interactionState: InteractionState;
  foxTarget: { x: number; y: number } | null;
}) {
  const modelRef = useRef<THREE.Group>(null);
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
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (material.map) {
              material.map.colorSpace = THREE.SRGBColorSpace;
            }
            material.needsUpdate = true;
          }
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
        currentActionRef.current = (Object.keys(actionsRef.current).find(k => actionsRef.current[k] === idle)) || '';
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
