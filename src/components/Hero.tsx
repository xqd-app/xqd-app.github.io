import { ArrowDown } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function Hero() {
  const { theme } = useTheme();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F7F5F1]'}`} />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-8 ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-[#6B7077] border border-[#E7E3DA]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-purple-400' : 'bg-[#3C5A78]'}`}></span>
          Available for opportunities
        </div>

        <h1 className={`font-['Playfair_Display'] text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-8 leading-tight ${
          theme === 'dark' ? 'text-white' : 'text-[#1E2227]'
        }`}>
          Xing Qide
        </h1>

        <p className={`text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto mb-16 leading-relaxed ${
          theme === 'dark' ? 'text-gray-300' : 'text-[#6B7077]'
        }`}>
          Data Analyst & Programmer crafting elegant solutions at the intersection of data and design
        </p>

        <a
          href="#work"
          className={`inline-flex items-center px-8 py-4 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-[#3C5A78] hover:bg-[#2E4760] text-white shadow-sm hover:shadow-md'
          }`}
        >
          View My Work
          <ArrowDown size={18} className="ml-2" />
        </a>
      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${theme === 'dark' ? 'text-gray-600' : 'text-[#E7E3DA]'}`}>
        <ArrowDown size={20} className="animate-bounce" />
      </div>
    </section>
  );
}