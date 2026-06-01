import { useState, useEffect, useRef } from 'react';

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

interface PetState {
  hunger: number;
  happiness: number;
  energy: number;
  isVisible: boolean;
  position: { x: number; y: number };
  isDragging: boolean;
}

const DesktopPet = () => {
  const [pet, setPet] = useState<PetState>({
    hunger: 70,
    happiness: 80,
    energy: 60,
    isVisible: true,
    position: { x: window.innerWidth - 100, y: window.innerHeight - 120 },
    isDragging: false,
  });
  
  const [mood, setMood] = useState('happy');
  const [showActions, setShowActions] = useState(false);
  const [message, setMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPetX: 0, startPetY: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 0.3),
        happiness: Math.max(0, prev.happiness - (prev.hunger < 30 ? 0.3 : 0.1)),
        energy: Math.max(0, prev.energy - 0.2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pet.hunger < 25) setMood('sad');
    else if (pet.happiness > 75) setMood('excited');
    else if (pet.happiness > 50) setMood('happy');
    else setMood('neutral');
  }, [pet.hunger, pet.happiness]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPetX: pet.position.x,
      startPetY: pet.position.y,
    };
    setPet(prev => ({ ...prev, isDragging: true }));
  };

  useEffect(() => {
    if (!pet.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPet(prev => ({
        ...prev,
        position: {
          x: Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.startPetX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPetY + dy)),
        },
      }));
    };

    const handleMouseUp = () => {
      setPet(prev => ({ ...prev, isDragging: false }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pet.isDragging]);

  const triggerAnimation = () => {
    setIsWaving(true);
    setIsSpeaking(true);
    setTimeout(() => {
      setIsWaving(false);
      setIsSpeaking(false);
    }, 1500);
  };

  const feed = () => {
    setPet(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 30),
      happiness: Math.min(100, prev.happiness + 10),
    }));
    setMessage('Yum!');
    triggerAnimation();
    setTimeout(() => setMessage(''), 1500);
    setShowActions(false);
  };

  const play = () => {
    if (pet.energy < 15) {
      setMessage('Sleepy...');
      setTimeout(() => setMessage(''), 1500);
      return;
    }
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 25),
      energy: Math.max(0, prev.energy - 15),
    }));
    setMessage('Fun!');
    triggerAnimation();
    setTimeout(() => setMessage(''), 1500);
    setShowActions(false);
  };

  const petting = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      energy: Math.min(100, prev.energy + 5),
    }));
    setMessage('Nice!');
    triggerAnimation();
    setTimeout(() => setMessage(''), 1500);
    setShowActions(false);
  };

  const sleep = () => {
    setPet(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + 40),
      happiness: Math.min(100, prev.happiness + 10),
    }));
    setMessage('Zzz...');
    setTimeout(() => setMessage(''), 2000);
    setShowActions(false);
  };

  return (
    <>
      {pet.isVisible && (
        <div
          className={`fixed z-50 transition-all duration-300 cursor-grab ${
            pet.isDragging ? 'cursor-grabbing' : ''
          }`}
          style={{
            left: pet.position.x,
            top: pet.position.y,
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className="relative">
            <div className={`${mood === 'excited' ? 'animate-bounce' : ''}`}>
              <svg viewBox="0 0 80 90" className="w-14 h-16">
                {/* SpongeBob square body */}
                <rect x="20" y="25" width="40" height="45" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
                
                {/* Sponge texture - dots */}
                <circle cx="27" cy="32" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="37" cy="30" r="1" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="47" cy="33" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="55" cy="31" r="1" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="30" cy="42" r="1" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="40" cy="41" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="50" cy="43" r="1" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                
                {/* Eyes - with blink animation */}
                <circle cx="32" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
                <circle cx="48" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
                <circle cx="32" cy="42" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
                <circle cx="48" cy="42" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
                <g className={isSpeaking ? 'animate-[blink_0.15s_ease-in-out_infinite]' : 'animate-[blink_3s_ease-in-out_infinite]'}>
                  <circle cx="32" cy="43" r="1.2" fill="currentColor" className={`text-gray-300 ${mood === 'happy' ? 'animate-pulse' : ''}`} />
                  <circle cx="48" cy="43" r="1.2" fill="currentColor" className={`text-gray-300 ${mood === 'happy' ? 'animate-pulse' : ''}`} />
                </g>
                
                {/* Eyebrows */}
                <path d="M28 36 L36 35" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-gray-300" />
                <path d="M44 35 L52 36" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-gray-300" />
                
                {/* Nose */}
                <ellipse cx="40" cy="49" rx="2.5" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gray-300" />
                
                {/* Mouth */}
                {mood === 'sad' && (
                  <path d="M32 56 Q40 53 48 56" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
                )}
                {mood === 'happy' && (
                  <path d="M30 56 Q40 64 50 56" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
                )}
                {mood === 'neutral' && (
                  <line x1="32" y1="57" x2="48" y2="57" stroke="currentColor" strokeWidth="1.5" className="text-gray-300" />
                )}
                {mood === 'excited' && (
                  <>
                    <path d="M30 56 Q40 66 50 56" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-300" />
                    <path d="M35 60 L35 62" stroke="currentColor" strokeWidth="0.8" className="text-gray-300" />
                    <path d="M40 61 L40 63" stroke="currentColor" strokeWidth="0.8" className="text-gray-300" />
                    <path d="M45 60 L45 62" stroke="currentColor" strokeWidth="0.8" className="text-gray-300" />
                  </>
                )}
                
                {/* Teeth */}
                <rect x="34" y="58" width="4" height="2.5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-300" />
                <rect x="42" y="58" width="4" height="2.5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-300" />
                
                {/* Cheeks */}
                <circle cx="25" cy="52" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                <circle cx="55" cy="52" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-400" />
                
                {/* Left arm - normal */}
                <path d="M18 38 Q12 36 10 32" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-gray-300" />
                <path d="M9 31 L7 29" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                <path d="M9 32 L7 34" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                <path d="M9 33 L7 36" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                
                {/* Right arm - waving animation */}
                <g className={isWaving ? 'animate-[wave_0.5s_ease-in-out_infinite] origin-[62px_38px]' : ''}>
                  <path d="M62 38 Q68 36 70 32" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-gray-300" />
                  <path d="M71 31 L73 29" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                  <path d="M71 32 L73 34" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                  <path d="M71 33 L73 36" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                </g>
                
                {/* Legs */}
                <path d="M28 70 L28 80" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-gray-300" />
                <path d="M25 81 L31 81" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                <path d="M24 82.5 L32 82.5" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                
                <path d="M52 70 L52 80" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-gray-300" />
                <path d="M49 81 L55 81" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                <path d="M48 82.5 L56 82.5" stroke="currentColor" strokeWidth="0.8" fill="none" className="text-gray-300" />
                
                {/* Excited stars */}
                {mood === 'excited' && (
                  <>
                    <text x="8" y="25" fontSize="7" className="animate-ping">⭐</text>
                    <text x="65" y="25" fontSize="7" className="animate-ping">⭐</text>
                  </>
                )}
                
                {/* Speech bubble */}
                {isSpeaking && (
                  <g className="animate-bounce">
                    <path d="M55 15 Q65 10 70 17 Q73 23 67 27 Q61 30 56 28 L50 34 L52 28 Q46 27 Q48 21 Q50 16 Q55 15" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-300" />
                    <circle cx="58" cy="20" r="1" fill="currentColor" className="text-gray-300" />
                    <circle cx="63" cy="18" r="0.8" fill="currentColor" className="text-gray-300" />
                    <circle cx="67" cy="21" r="0.6" fill="currentColor" className="text-gray-300" />
                  </g>
                )}
              </svg>
            </div>

            {message && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-200 px-2 py-1 rounded-full text-xs whitespace-nowrap shadow-lg border border-gray-700">
                {message}
              </div>
            )}

            {showActions && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); feed(); }}
                  className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm transition-colors border border-gray-600"
                  title="Feed"
                >🍖</button>
                <button
                  onClick={(e) => { e.stopPropagation(); play(); }}
                  className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm transition-colors border border-gray-600"
                  title="Play"
                >🎮</button>
                <button
                  onClick={(e) => { e.stopPropagation(); petting(); }}
                  className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm transition-colors border border-gray-600"
                  title="Pet"
                >🤚</button>
                <button
                  onClick={(e) => { e.stopPropagation(); sleep(); }}
                  className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm transition-colors border border-gray-600"
                  title="Sleep"
                >💤</button>
              </div>
            )}

            <div className="flex justify-center gap-1 mt-2">
              <div className={`w-1.5 h-1.5 rounded-full ${pet.hunger > 30 ? 'bg-gray-400' : 'bg-red-500'}`} title="Hunger" />
              <div className={`w-1.5 h-1.5 rounded-full ${pet.happiness > 50 ? 'bg-gray-400' : 'bg-gray-600'}`} title="Happiness" />
              <div className={`w-1.5 h-1.5 rounded-full ${pet.energy > 30 ? 'bg-gray-400' : 'bg-gray-600'}`} title="Energy" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesktopPet;
