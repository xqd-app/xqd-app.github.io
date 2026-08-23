import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const navLinks = [
  { name: 'Work', href: '/showcase' },
  { name: 'About', href: '/about' },
  { name: 'Resume', href: '/resume' },
  { name: 'Teacher', href: '/teacher' },
  { name: 'Life', href: '/life' },
  { name: '🐾 Pet', href: '/pet' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? (theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-800' : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E7E3DA]')
          : 'bg-transparent'
      )}
    >
      <nav className={cn(
        'w-full px-0',
        theme === 'dark' ? 'text-white' : 'text-[#1E2227]'
      )}>
        <div className="flex items-center justify-between h-20">
          <a href="/" className={cn(
            'font-["Playfair_Display"] text-4xl font-semibold tracking-tight transition-colors',
            theme === 'dark' ? 'hover:text-purple-400' : 'hover:text-[#3C5A78]'
          )}>Xing Qide</a>
          <div className="flex items-center space-x-8 pr-6 lg:pr-12">
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-lg uppercase tracking-wider font-medium transition-colors relative group',
                    theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-[#6B7077] hover:text-[#3C5A78]'
                  )}
                >
                  {link.name}
                  <span className={cn(
                    'absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full',
                    theme === 'dark' ? 'bg-purple-400' : 'bg-[#3C5A78]'
                  )} />
                </a>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-lg transition-all',
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-[#F7F5F1]'
              )}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'md:hidden p-2 rounded-lg transition-all',
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-[#F7F5F1]'
              )}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            isMobileMenuOpen ? 'max-h-80 pb-6' : 'max-h-0'
          )}
        >
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'text-lg uppercase tracking-wider font-medium transition-colors',
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-[#6B7077] hover:text-[#3C5A78]'
                )}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
