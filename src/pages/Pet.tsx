import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes blink {
    0%, 45%, 55%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-20deg); }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
import { AIMessage, AIConfig, DEFAULT_SYSTEM_PROMPT, sendAIMessage } from '@/lib/ai-service';
import { AIChat } from '@/components/AIChat';
import { MessageCircle } from 'lucide-react';

interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
  age: number;
  totalInteractions: number;
}

const PetAvatar = ({ mood, isAnimating, isSpeaking, isWaving, isDancing, danceStep }: { mood: string; isAnimating: boolean; isSpeaking?: boolean; isWaving?: boolean; isDancing?: boolean; danceStep?: number }) => {
  // Add dancing class for animation - entire body jumps
  const getDanceTransform = () => {
    if (!isDancing) return '';
    
    const transforms = [
      'translateY(0px)',
      'translateY(-15px) rotate(-8deg)',
      'translateY(0px)',
      'translateY(-15px) rotate(8deg)',
      'translateY(0px)',
      'translateY(-25px) rotate(-5deg)',
      'translateY(0px)',
      'translateY(-12px) rotate(5deg)',
    ];
    
    return transforms[danceStep || 0];
  };
  
  return (
    <svg viewBox="0 0 120 140" className={`w-32 h-40 ${isDancing ? 'animate-pulse' : ''}`} style={{ transform: getDanceTransform(), transition: 'transform 0.15s ease-out' }}>
    {/* SpongeBob square body */}
    <rect x="30" y="40" width="60" height="70" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    
    {/* Sponge texture - dots */}
    <circle cx="40" cy="50" r="2" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="55" cy="48" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="70" cy="52" r="2" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="85" cy="50" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="45" cy="65" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="60" cy="63" r="2" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="75" cy="67" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="50" cy="80" r="2" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="70" cy="78" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    
    {/* Eyes - with blink animation */}
    <circle cx="48" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    <circle cx="72" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    <circle cx="48" cy="65" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    <circle cx="72" cy="65" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    {/* Blinking eyes */}
    <g className={isSpeaking ? 'animate-[blink_0.15s_ease-in-out_infinite]' : 'animate-[blink_3s_ease-in-out_infinite]'}>
      <circle cx="48" cy="66" r="2" fill="currentColor" className={`text-gray-300 ${mood === 'happy' ? 'animate-pulse' : ''}`} />
      <circle cx="72" cy="66" r="2" fill="currentColor" className={`text-gray-300 ${mood === 'happy' ? 'animate-pulse' : ''}`} />
    </g>
    
    {/* Eyebrows */}
    <path d="M42 56 L54 54" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
    <path d="M66 54 L78 56" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
    
    {/* Nose */}
    <ellipse cx="60" cy="75" rx="4" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    
    {/* Mouth */}
    {mood === 'sad' && (
      <path d="M48 88 Q60 84 72 88" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
    )}
    {mood === 'happy' && (
      <>
        <path d="M45 88 Q60 100 75 88" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
        <path d="M55 93 Q60 97 65 93" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
      </>
    )}
    {mood === 'neutral' && (
      <line x1="48" y1="90" x2="72" y2="90" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
    )}
    {mood === 'excited' && (
      <>
        <path d="M45 88 Q60 102 75 88" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
        <path d="M52 95 L52 98" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <path d="M60 96 L60 99" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <path d="M68 95 L68 98" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
      </>
    )}
    
    {/* Teeth */}
    <rect x="52" y="92" width="6" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
    <rect x="62" y="92" width="6" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
    
    {/* Cheeks */}
    <circle cx="38" cy="80" r="4" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    <circle cx="82" cy="80" r="4" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
    
    {/* Left arm - normal */}
    <path d="M28 55 Q18 52 15 45" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
    <path d="M13 43 L10 40" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    <path d="M13 45 L10 48" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    <path d="M13 47 L10 50" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    
    {/* Right arm - waving animation - always wave when dancing */}
    <g className={(isWaving || isDancing) ? 'animate-[wave_0.3s_ease-in-out_infinite] origin-[92px_55px]' : ''}>
      <path d="M92 55 Q102 52 105 45" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
      <path d="M107 43 L110 40" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
      <path d="M107 45 L110 48" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
      <path d="M107 47 L110 50" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    </g>
    
    {/* Legs */}
    <path d="M42 110 L42 125" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
    <path d="M38 126 L46 126" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    <path d="M36 128 L48 128" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    
    <path d="M78 110 L78 125" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
    <path d="M74 126 L82 126" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    <path d="M72 128 L84 128" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-300" />
    
    {/* Excited stars */}
    {mood === 'excited' && (
      <>
        <text x="20" y="35" fontSize="10" className="animate-ping">⭐</text>
        <text x="95" y="35" fontSize="10" className="animate-ping">⭐</text>
      </>
    )}
    
    {/* Speech bubble */}
    {isSpeaking && (
      <g className="animate-bounce">
        <path d="M80 20 Q100 15 110 25 Q115 35 105 40 Q95 45 85 42 L75 50 L78 40 Q68 38 70 30 Q72 22 80 20" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
        <circle cx="85" cy="30" r="1.5" fill="currentColor" className="text-gray-300" />
        <circle cx="92" cy="28" r="1.2" fill="currentColor" className="text-gray-300" />
        <circle cx="98" cy="32" r="1" fill="currentColor" className="text-gray-300" />
      </g>
    )}
  </svg>
  );
};

export function Pet() {
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetState>({
    name: 'Pet',
    hunger: 80,
    happiness: 90,
    health: 95,
    energy: 70,
    age: 0,
    totalInteractions: 0,
  });
  
  const [mood, setMood] = useState('happy');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [danceStep, setDanceStep] = useState(0);
  const audioContextRef = useRef<any>(null);
  const oscillatorRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        const newHunger = Math.max(0, prev.hunger - 0.5);
        const newEnergy = Math.max(0, prev.energy - 0.3);
        const newHappiness = Math.max(0, Math.min(100, prev.happiness - (newHunger < 30 ? 0.5 : 0.1)));
        const newHealth = newHunger < 20 || newEnergy < 20 ? Math.max(0, prev.health - 0.2) : Math.min(100, prev.health + 0.1);
        
        return {
          ...prev,
          hunger: newHunger,
          energy: newEnergy,
          happiness: newHappiness,
          health: newHealth,
          age: prev.age + 0.001,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pet.hunger < 30) {
      setMood('sad');
    } else if (pet.happiness > 80) {
      setMood('excited');
    } else if (pet.happiness > 50) {
      setMood('happy');
    } else {
      setMood('neutral');
    }
  }, [pet.happiness, pet.hunger]);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    // Wave when user sends message
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1500);

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const allMessages = [
        {
          id: 'system',
          role: 'system' as const,
          content: DEFAULT_SYSTEM_PROMPT,
          timestamp: Date.now(),
        },
        ...newMessages,
      ];

      const response = await sendAIMessage(allMessages, aiConfig);

      // Start speaking animation
      setIsSpeaking(true);

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update pet stats based on interaction
      setPet(prev => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 2),
        totalInteractions: prev.totalInteractions + 1,
      }));

      // Stop speaking after animation
      setTimeout(() => setIsSpeaking(false), 2000);

    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Oops! I had trouble thinking just now. Please check your AI settings or try again!',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsSpeaking(false);
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

  // What Is Love Dance Function
  const startDancing = () => {
    if (isDancing) {
      stopDancing();
      return;
    }
    
    setIsDancing(true);
    setIsWaving(true);
    
    // Create simple audio for demo
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      gainNode.gain.value = 0.1;
      
      // Play a simple beat pattern
      let beatCount = 0;
      const playBeat = () => {
        if (beatCount >= 32) {
          return;
        }
        
        const time = audioContextRef.current.currentTime;
        oscillator.frequency.setValueAtTime(beatCount % 4 === 0 ? 220 : 196, time);
        oscillator.start(time);
        oscillator.stop(time + 0.1);
        
        beatCount++;
        setTimeout(playBeat, 300);
      };
      
      playBeat();
    } catch (e) {
      console.log('Audio not supported');
    }
    
    // Dance steps animation
    let step = 0;
    const danceInterval = setInterval(() => {
      if (!isDancing) {
        clearInterval(danceInterval);
        return;
      }
      setDanceStep(step % 8);
      step++;
    }, 250);
  };

  const stopDancing = () => {
    setIsDancing(false);
    setIsWaving(false);
    setDanceStep(0);
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Back to Home
        </button>

        <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 p-6">
            <div className="flex justify-between items-center text-white">
              <div>
                <h1 className="text-3xl font-bold mb-2">Digital Pet</h1>
                <p className="opacity-70">Your AI companion</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{pet.name} {getMoodEmoji()}</div>
                <div className="text-sm opacity-70">Interactions: {pet.totalInteractions}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col items-center gap-8">
              {/* 宠物展示 */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="mb-4">
                    <PetAvatar mood={mood} isAnimating={false} isSpeaking={isSpeaking} isWaving={isWaving} isDancing={isDancing} danceStep={danceStep} />
                  </div>
                </div>

                <div className="text-center mt-4 space-y-2">
                  <div className="text-2xl font-bold text-gray-200">{pet.name}</div>
                  <div className="text-gray-500">Age: {Math.floor(pet.age)} days</div>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                      Mood: {mood === 'excited' ? 'Excited' : mood === 'happy' ? 'Happy' : mood === 'sad' ? 'Sad' : 'Neutral'}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs mt-4">
                    Hunger: {Math.round(pet.hunger)}% | Energy: {Math.round(pet.energy)}% | Health: {Math.round(pet.health)}%
                  </div>
                </div>
              </div>

              {/* 互动按钮 */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => {
                    setPet(prev => ({
                      ...prev,
                      hunger: Math.min(100, prev.hunger + 20),
                      happiness: Math.min(100, prev.happiness + 5),
                    }));
                    setIsWaving(true);
                    setIsSpeaking(true);
                    setTimeout(() => {
                      setIsWaving(false);
                      setIsSpeaking(false);
                    }, 1500);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all border border-gray-600"
                >
                  🍖 Feed
                </button>
                <button
                  onClick={() => {
                    setPet(prev => ({
                      ...prev,
                      happiness: Math.min(100, prev.happiness + 15),
                      energy: Math.max(0, prev.energy - 10),
                    }));
                    setIsWaving(true);
                    setIsSpeaking(true);
                    setTimeout(() => {
                      setIsWaving(false);
                      setIsSpeaking(false);
                    }, 1500);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all border border-gray-600"
                >
                  🎮 Play
                </button>
                <button
                  onClick={() => {
                    setPet(prev => ({
                      ...prev,
                      happiness: Math.min(100, prev.happiness + 10),
                      energy: Math.min(100, prev.energy + 5),
                    }));
                    setIsWaving(true);
                    setIsSpeaking(true);
                    setTimeout(() => {
                      setIsWaving(false);
                      setIsSpeaking(false);
                    }, 1500);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all border border-gray-600"
                >
                  🤚 Pet
                </button>
                <button
                  onClick={startDancing}
                  className={`px-6 py-3 rounded-xl transition-all border ${
                    isDancing 
                      ? 'bg-purple-600 text-white border-purple-500 animate-pulse' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                  }`}
                >
                  💃 {isDancing ? 'Stop Dancing' : 'Dance!'}
                </button>
              </div>

              {/* 聊天界面 */}
              <div className="w-full max-w-2xl">
                <AIChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onConfigChange={setAiConfig}
                  config={aiConfig}
                  isLoading={isLoading}
                  onSpeakingChange={(speaking) => {
                    setIsSpeaking(speaking);
                    if (speaking) setIsWaving(true);
                    else setIsWaving(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-200">🎮 Getting Started</h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-400">
            <div>
              <h4 className="font-semibold mb-2 text-gray-300">� AI Chat</h4>
              <ul className="text-sm space-y-1">
                <li>• Click the settings icon to configure AI</li>
                <li>• Choose from OpenAI, Claude, Gemini, or Ollama</li>
                <li>• Enter your API key or local Ollama URL</li>
                <li>• Start chatting with your pet!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-300">🤖 AI Providers</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>OpenAI:</strong> GPT-3.5 or GPT-4</li>
                <li>• <strong>Claude:</strong> Claude 3 models</li>
                <li>• <strong>Gemini:</strong> Google Gemini Pro</li>
                <li>• <strong>Ollama:</strong> Free local models (Llama2, etc.)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💜 {pet.name} will always be with you, come back often!</p>
        </div>
      </div>
    </div>
  );
}
