import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/data/projects';
import { useTheme } from '@/hooks/useTheme';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  return (
    <a
      href={project.link}
      className={`group relative block rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
        theme === 'dark'
          ? 'bg-gray-800 border border-gray-700 hover:border-gray-600 hover:shadow-xl'
          : 'bg-white border border-[#E7E3DA] hover:border-[#3C5A78]/30 hover:shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative aspect-[4/3] overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F7F5F1]'}`}>
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
        />

        <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
          theme === 'dark'
            ? 'from-gray-900/90 via-gray-900/40 to-transparent'
            : 'from-black/60 via-black/20 to-transparent'
        } ${isHovered ? 'opacity-100' : 'opacity-70'}`}></div>

        <div className={`absolute inset-x-0 bottom-0 p-6 transition-all duration-500 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            theme === 'dark'
              ? 'bg-white/90 text-gray-900'
              : 'bg-white/95 text-[#3C5A78] shadow-sm'
          }`}>
            View Project
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>

      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-purple-400' : 'bg-[#3C5A78]'}`}></span>
          <span className={`text-xs uppercase tracking-widest font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-[#6B7077]'
          }`}>
            {project.category}
          </span>
        </div>

        <h3 className={`text-xl font-semibold mb-2 transition-colors ${
          theme === 'dark'
            ? 'text-white group-hover:text-purple-400'
            : 'text-[#1E2227] group-hover:text-[#3C5A78]'
        }`}>
          {project.title}
        </h3>

        <p className={`text-sm line-clamp-2 leading-relaxed ${
          theme === 'dark' ? 'text-gray-400' : 'text-[#6B7077]'
        }`}>
          {project.description}
        </p>

        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700' : 'border-[#E7E3DA]'
        }`}>
          <span className={`text-xs uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-500' : 'text-[#6B7077]'
          }`}>
            Explore
          </span>
          <ArrowUpRight
            size={18}
            className={`transition-all duration-300 ${
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'
            } ${theme === 'dark' ? 'text-purple-400' : 'text-[#3C5A78]'}`}
          />
        </div>
      </div>
    </a>
  );
}