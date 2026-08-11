import { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AIMessage, AIConfig, DEFAULT_SYSTEM_PROMPT, sendAIMessage } from '@/lib/ai-service';
import { AIChat } from '@/components/AIChat';

useGLTF.preload('/models/Fox.glb');

interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
  age: number;
  totalInteractions: number;
}

type FoxMood = 'happy' | 'excited' | 'sad' | 'neutral';

function FoxModel({ mood, isSpeaking, isDancing }: {
  mood: FoxMood;
  isSpeaking: boolean;
  isDancing: boolean;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<string>('');
  const { scene, animations } = useGLTF('/models/Fox.glb');
  const { viewport } = useThree();

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
    if (!next) return;
    if (currentActionRef.current === name) {
      next.timeScale = timeScale;
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

    if (isDancing) {
      playAction('Walk', 0.2, 3);
      group.position.y = Math.abs(Math.sin(t * 8)) * 0.15 - 0.4;
      group.rotation.z = Math.sin(t * 6) * 0.15;
      group.rotation.y = Math.sin(t * 4) * 0.3;
    } else if (isSpeaking) {
      playAction('Idle', 0.2, 1.5);
      group.position.y = Math.abs(Math.sin(t * 6)) * 0.08 - 0.4;
      group.rotation.y = Math.sin(t * 3) * 0.1;
    } else if (mood === 'excited') {
      playAction('Walk', 0.3, 2);
      group.position.y = Math.abs(Math.sin(t * 6)) * 0.1 - 0.4;
      group.rotation.y = Math.sin(t * 2) * 0.2;
    } else if (mood === 'sad') {
      playAction('Idle', 0.3, 0.5);
      group.position.y = -0.4;
      group.rotation.z = 0.1;
    } else {
      playAction('Idle', 0.3, 1);
      group.position.y = -0.4 + Math.sin(t * 2) * 0.02;
      group.rotation.z = Math.sin(t * 2) * 0.02;
    }

    // 把狐狸限制在可见蓝色方框内
    const limitX = 0.9;
    const limitZ = 0.5;
    group.position.x = Math.max(-limitX, Math.min(limitX, group.position.x));
    group.position.z = Math.max(-limitZ, Math.min(limitZ, group.position.z));
    group.position.y = Math.max(-0.45, group.position.y);
  });

  const baseScale = Math.max(0.0012, Math.min(0.006, viewport.width * 0.002));

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

function ForestBackground() {
  // 树木数据
  const trees = [
    { x: 50, y: 180, scale: 1.1, color: '#166534' },
    { x: 150, y: 200, scale: 0.9, color: '#14532d' },
    { x: 280, y: 190, scale: 1.3, color: '#166534' },
    { x: 420, y: 210, scale: 0.8, color: '#15803d' },
    { x: 560, y: 185, scale: 1.2, color: '#166534' },
    { x: 700, y: 205, scale: 1.0, color: '#14532d' },
    { x: 840, y: 190, scale: 1.15, color: '#166534' },
    { x: 980, y: 200, scale: 0.95, color: '#15803d' },
    { x: 1100, y: 185, scale: 1.25, color: '#14532d' },
  ];

  // 花朵数据
  const flowers = [
    { x: 80, y: 320, color: '#ec4899' },
    { x: 220, y: 340, color: '#fbbf24' },
    { x: 350, y: 310, color: '#a855f7' },
    { x: 500, y: 335, color: '#ec4899' },
    { x: 640, y: 325, color: '#fbbf24' },
    { x: 780, y: 345, color: '#a855f7' },
    { x: 900, y: 320, color: '#ec4899' },
    { x: 1050, y: 335, color: '#fbbf24' },
    { x: 1150, y: 325, color: '#a855f7' },
  ];

  // 草丛数据
  const grasses = [];
  for (let i = 0; i < 40; i++) {
    grasses.push({ x: Math.random() * 1200, y: 280 + Math.random() * 60, h: 8 + Math.random() * 12 });
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 天空渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-emerald-300 to-green-500 dark:from-indigo-900 dark:via-emerald-900 dark:to-green-900" />

      {/* 太阳/月亮 */}
      <svg className="absolute top-0 left-0 w-full opacity-60" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <circle cx="100" cy="80" r="35" fill="#fef3c7" opacity="0.8" />
        <circle cx="1050" cy="60" r="25" fill="#fef3c7" opacity="0.6" />
      </svg>

      {/* 远山 */}
      <svg className="absolute bottom-0 left-0 w-full h-1/2" viewBox="0 0 1200 300" preserveAspectRatio="none">
        <polygon points="0,300 100,150 200,180 300,100 400,160 500,120 600,180 700,90 800,150 900,110 1000,170 1100,130 1200,180 1200,300" fill="#15803d" opacity="0.5" />
        <polygon points="0,300 150,200 300,230 450,180 600,220 750,170 900,210 1050,180 1200,220 1200,300" fill="#166534" opacity="0.7" />
      </svg>

      {/* 树木 */}
      <svg className="absolute bottom-0 left-0 w-full h-2/3" viewBox="0 0 1200 400" preserveAspectRatio="none">
        {trees.map((tree, i) => (
          <g key={`tree-${i}`} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.scale})`}>
            {/* 树干 */}
            <rect x="-8" y="40" width="16" height="60" fill="#78350f" />
            {/* 树冠（三层三角形松树） */}
            <polygon points="0,-40 -40,30 40,30" fill={tree.color} />
            <polygon points="0,-15 -35,45 35,45" fill={tree.color} opacity="0.95" />
            <polygon points="0,5 -30,60 30,60" fill={tree.color} opacity="0.9" />
          </g>
        ))}
      </svg>

      {/* 草地 */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-500/60 to-green-700/90 dark:from-green-800/80 dark:to-green-950" />

      {/* 草丛 */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ height: '40%' }}>
        {grasses.map((g, i) => (
          <g key={`grass-${i}`} transform={`translate(${g.x}, ${g.y})`}>
            <path d={`M0,0 Q-3,${-g.h/2} 0,${-g.h} Q3,${-g.h/2} 0,0`} fill="#16a34a" />
            <path d={`M2,0 Q5,${-g.h/3} 8,${-g.h/2} Q5,${-g.h/4} 2,0`} fill="#15803d" />
          </g>
        ))}
      </svg>

      {/* 花朵 */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ height: '40%' }}>
        {flowers.map((f, i) => (
          <g key={`flower-${i}`} transform={`translate(${f.x}, ${f.y})`}>
            {/* 花茎 */}
            <line x1="0" y1="0" x2="0" y2="-15" stroke="#15803d" strokeWidth="2" />
            {/* 叶子 */}
            <ellipse cx="-3" cy="-8" rx="4" ry="2" fill="#16a34a" transform="rotate(-30 -3 -8)" />
            {/* 花瓣 */}
            <circle cx="0" cy="-20" r="3" fill={f.color} />
            <circle cx="-3" cy="-19" r="3" fill={f.color} opacity="0.9" />
            <circle cx="3" cy="-19" r="3" fill={f.color} opacity="0.9" />
            <circle cx="-2" cy="-22" r="3" fill={f.color} opacity="0.9" />
            <circle cx="2" cy="-22" r="3" fill={f.color} opacity="0.9" />
            {/* 花心 */}
            <circle cx="0" cy="-20" r="1.5" fill="#fbbf24" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function FoxCanvas({ mood, isSpeaking, isDancing }: {
  mood: FoxMood;
  isSpeaking: boolean;
  isDancing: boolean;
}) {
  return (
    <div className="relative w-full h-96 rounded-3xl overflow-hidden border border-green-700/30">
      <ForestBackground />
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 50 }}
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 2]} intensity={1.3} color="#fff7e6" castShadow />
        <pointLight position={[-3, 2, -2]} intensity={0.4} color="#FF9933" />
        <Suspense fallback={<LoadingIndicator />}>
          <FoxModel mood={mood} isSpeaking={isSpeaking} isDancing={isDancing} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8">{value}%</span>
    </div>
  );
}

export function Pet() {
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetState>({
    name: 'Fox',
    hunger: 80,
    happiness: 90,
    health: 95,
    energy: 70,
    age: 0,
    totalInteractions: 0,
  });

  const [mood, setMood] = useState<FoxMood>('happy');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const danceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        const newHunger = Math.max(0, prev.hunger - 0.5);
        const newEnergy = Math.max(0, prev.energy - 0.3);
        const newHappiness = Math.max(0, Math.min(100, prev.happiness - (newHunger < 30 ? 0.5 : 0.1)));
        const newHealth = newHunger < 20 || newEnergy < 20 ? Math.max(0, prev.health - 0.2) : Math.min(100, prev.health + 0.1);
        return { ...prev, hunger: newHunger, energy: newEnergy, happiness: newHappiness, health: newHealth, age: prev.age + 0.001 };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pet.hunger < 30) setMood('sad');
    else if (pet.happiness > 80) setMood('excited');
    else if (pet.happiness > 50) setMood('happy');
    else setMood('neutral');
  }, [pet.happiness, pet.hunger]);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    const userMessage: AIMessage = { id: `user-${Date.now()}`, role: 'user', content, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const allMessages = [
        { id: 'system', role: 'system' as const, content: DEFAULT_SYSTEM_PROMPT, timestamp: Date.now() },
        ...newMessages,
      ];
      const response = await sendAIMessage(allMessages, aiConfig);
      setIsSpeaking(true);
      const assistantMessage: AIMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: response, timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMessage]);
      setPet(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 2), totalInteractions: prev.totalInteractions + 1 }));
      setTimeout(() => setIsSpeaking(false), 2000);
    } catch (error) {
      const errorMessage: AIMessage = { id: `error-${Date.now()}`, role: 'assistant', content: 'Oops! Something went wrong.', timestamp: Date.now() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = () => {
    if (mood === 'excited') return '🎉';
    if (mood === 'happy') return '😊';
    if (mood === 'sad') return '😢';
    return '😐';
  };

  const handleDance = () => {
    if (isDancing) {
      setIsDancing(false);
      if (danceTimerRef.current) clearTimeout(danceTimerRef.current);
      return;
    }
    setIsDancing(true);
    danceTimerRef.current = window.setTimeout(() => setIsDancing(false), 8000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors">
      <div className="container mx-auto px-6 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2 transition-colors"
        >
          ← Back to Home
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 p-6">
            <div className="flex justify-between items-center text-white">
              <div>
                <h1 className="text-3xl font-bold mb-2">3D Fox Pet</h1>
                <p className="opacity-90">Your AI fox companion</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{pet.name} {getMoodEmoji()}</div>
                <div className="text-sm opacity-80">Interactions: {pet.totalInteractions}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col items-center gap-8">
              <FoxCanvas mood={mood} isSpeaking={isSpeaking} isDancing={isDancing} />

              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pet.name}</div>
                <div className="text-gray-500 dark:text-gray-400">Age: {Math.floor(pet.age)} days</div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                    Mood: {mood}
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md space-y-2">
                <StatusBar label="Hunger" value={Math.round(pet.hunger)} color="#FF9933" />
                <StatusBar label="Energy" value={Math.round(pet.energy)} color="#3B82F6" />
                <StatusBar label="Health" value={Math.round(pet.health)} color="#10B981" />
                <StatusBar label="Happy" value={Math.round(pet.happiness)} color="#EC4899" />
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => {
                    setPet(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 20), happiness: Math.min(100, prev.happiness + 5) }));
                    setIsSpeaking(true);
                    setTimeout(() => setIsSpeaking(false), 1500);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
                >
                  🍖 Feed
                </button>
                <button
                  onClick={() => {
                    setPet(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 15), energy: Math.max(0, prev.energy - 10) }));
                    setIsSpeaking(true);
                    setTimeout(() => setIsSpeaking(false), 1500);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
                >
                  🎮 Play
                </button>
                <button
                  onClick={() => {
                    setPet(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10), energy: Math.min(100, prev.energy + 5) }));
                    setIsSpeaking(true);
                    setTimeout(() => setIsSpeaking(false), 1500);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
                >
                  🤚 Pet
                </button>
                <button
                  onClick={handleDance}
                  className={`px-6 py-3 rounded-xl transition-all border ${
                    isDancing
                      ? 'bg-purple-600 text-white border-purple-500 animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  💃 {isDancing ? 'Stop Dancing' : 'Dance!'}
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all"
                >
                  💬 Chat
                </button>
              </div>

              {showChat && (
                <div className="w-full max-w-2xl">
                  <AIChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onConfigChange={setAiConfig}
                    config={aiConfig}
                    isLoading={isLoading}
                    onSpeakingChange={(speaking) => setIsSpeaking(speaking)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
