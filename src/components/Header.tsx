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
        isScrolled ? (theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-md shadow-sm' : 'bg-white/95 backdrop-blur-md shadow-sm') : 'bg-transparent'
      )}
    >
      <nav className={cn(
        'container mx-auto px-6 lg:px-12',
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      )}>
        <div className="flex items-center justify-between h-20">
          <a href="/" className={cn(
            'text-2xl font-bold tracking-tight transition-colors',
            theme === 'dark' ? 'hover:text-purple-400' : 'hover:text-purple-600'
          )}>Xing Qide</a>
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm uppercase tracking-widest transition-colors relative group',
                    theme === 'dark' ? 'hover:text-purple-400' : 'hover:text-purple-600'
                  )}
                >
                  {link.name}
                  <span className={cn(
                    'absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full',
                    theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'
                  )} />
                </a>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 transition-colors',
                theme === 'dark' ? 'hover:text-purple-400' : 'hover:text-purple-600'
              )}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'md:hidden p-2 transition-colors',
                theme === 'dark' ? 'hover:text-purple-400' : 'hover:text-purple-600'
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
                  'text-sm uppercase tracking-widest transition-colors',
                  theme === 'dark' ? 'hover:text-purple-400' : 'hover:text-purple-600'
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
