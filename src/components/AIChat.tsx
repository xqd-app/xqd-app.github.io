import { useState, useRef, useEffect } from 'react';
import { Send, Settings, X, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIMessage, AIConfig, AI_PROVIDERS, DEFAULT_SYSTEM_PROMPT, sendAIMessage } from '@/lib/ai-service';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface AIChatProps {
  messages: AIMessage[];
  onSendMessage: (content: string) => void;
  onConfigChange: (config: AIConfig) => void;
  config: AIConfig;
  isLoading: boolean;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export function AIChat({ messages, onSendMessage, onConfigChange, config, isLoading, onSpeakingChange }: AIChatProps) {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (input.trim()) {
          onSendMessage(input.trim());
          setInput('');
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Speak last message when it arrives
  useEffect(() => {
    if (isSpeakingEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(lastMessage.content);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        if (onSpeakingChange) {
          utterance.onstart = () => onSpeakingChange(true);
          utterance.onend = () => onSpeakingChange(false);
        }
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, isSpeakingEnabled, onSpeakingChange]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveSettings = () => {
    onConfigChange(localConfig);
    setShowSettings(false);
  };

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden",
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    )}>
      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
      )}>
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className={cn("font-bold", theme === 'dark' ? 'text-gray-200' : 'text-gray-800')}>
            AI Chat
          </h3>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
          )}>
            {AI_PROVIDERS[localConfig.provider].name}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
          )}
        >
          <Settings size={18} />
        </button>
      </div>

      {showSettings && (
        <div className={cn(
          "p-4 border-b",
          theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
        )}>
          <div className="space-y-3">
            <div>
              <label className={cn(
                "block text-sm font-medium mb-1",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                AI Provider
              </label>
              <select
                value={localConfig.provider}
                onChange={(e) => setLocalConfig({ ...localConfig, provider: e.target.value as any })}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border text-sm",
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                )}
              >
                {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                  <option key={key} value={key}>
                    {provider.name} - {provider.description}
                  </option>
                ))}
              </select>
            </div>

            {localConfig.provider !== 'ollama' && (
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  API Key
                </label>
                <input
                  type="password"
                  value={localConfig.apiKey || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border text-sm",
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                  )}
                />
              </div>
            )}

            {localConfig.provider === 'ollama' && (
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Base URL (Ollama Server)
                </label>
                <input
                  type="text"
                  value={localConfig.baseUrl || 'http://localhost:11434'}
                  onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border text-sm",
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                  )}
                />
              </div>
            )}

            <div>
              <label className={cn(
                "block text-sm font-medium mb-1",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Model
              </label>
              <input
                type="text"
                value={localConfig.model || AI_PROVIDERS[localConfig.provider].defaultModel}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                placeholder="Model name"
                className={cn(
                  "w-full px-3 py-2 rounded-lg border text-sm",
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                )}
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className={cn(
                "w-full py-2 rounded-lg font-medium transition-colors",
                theme === 'dark' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      <div className={cn(
        "h-80 overflow-y-auto p-4 space-y-3",
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        {messages.length === 0 && (
          <div className={cn(
            "text-center py-8 text-sm",
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          )}>
            Start a conversation with your pet! 🐾
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-md'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 rounded-bl-md'
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span
                className={cn(
                  "text-xs mt-1 block opacity-70",
                  message.role === 'user' ? 'text-white/80' : ''
                )}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className={cn(
              "rounded-2xl px-4 py-3",
              theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-gray-200'
            )}>
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={cn(
        "p-3 border-t",
        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      )}>
        <div className="flex gap-2">
          {/* Voice input button */}
          {speechSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-full transition-colors",
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            disabled={isLoading || isListening}
            className={cn(
              "flex-1 px-4 py-2 rounded-full border text-sm outline-none transition-colors",
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-purple-500'
                : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-purple-500',
              (isLoading || isListening) && 'opacity-50 cursor-not-allowed'
            )}
          />
          
          {/* Voice output toggle */}
          <button
            onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isSpeakingEnabled
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-500'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-400'
            )}
            title={isSpeakingEnabled ? 'Disable voice output' : 'Enable voice output'}
          >
            {isSpeakingEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2 rounded-full transition-colors",
              input.trim() && !isLoading
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gray-200 text-gray-400'
            )}
          >
            <Send size={18} />
          </button>
        </div>
        
        {isListening && (
          <div className={cn(
            "mt-2 text-xs text-center",
            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
          )}>
            🎤 Listening... Speak now!
          </div>
        )}
      </div>
    </div>
  );
}
