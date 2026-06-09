import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={project.link}
      className="group block bg-white border border-gray-100 hover:border-purple-300 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        {/* Spider Web SVG */}
        <svg viewBox="0 0 200 150" className={`w-full h-full transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          {/* Web background */}
          <defs>
            <linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
            </linearGradient>
            <filter id="webGlow">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          
          {/* Web circles */}
          <circle cx="100" cy="75" r="60" fill="none" stroke="url(#webGradient)" strokeWidth="1" />
          <circle cx="100" cy="75" r="45" fill="none" stroke="url(#webGradient)" strokeWidth="1" />
          <circle cx="100" cy="75" r="30" fill="none" stroke="url(#webGradient)" strokeWidth="1" />
          <circle cx="100" cy="75" r="15" fill="none" stroke="url(#webGradient)" strokeWidth="1" />
          
          {/* Web spokes */}
          <line x1="100" y1="15" x2="100" y2="135" stroke="url(#webGradient)" strokeWidth="1" />
          <line x1="30" y1="75" x2="170" y2="75" stroke="url(#webGradient)" strokeWidth="1" />
          <line x1="45" y1="30" x2="155" y2="120" stroke="url(#webGradient)" strokeWidth="1" />
          <line x1="155" y1="30" x2="45" y2="120" stroke="url(#webGradient)" strokeWidth="1" />
          
          {/* Spider */}
          <g className={`transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
            {/* Body */}
            <circle cx="100" cy="75" r="12" fill="#ffffff" />
            <circle cx="100" cy="58" r="8" fill="#ffffff" />
            
            {/* Eyes */}
            <circle cx="96" cy="56" r="2" fill="#8b5cf6" />
            <circle cx="104" cy="56" r="2" fill="#8b5cf6" />
            
            {/* Legs */}
            <line x1="100" y1="75" x2="85" y2="85" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="75" x2="115" y2="85" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="75" x2="80" y2="95" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="75" x2="120" y2="95" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="58" x2="85" y2="45" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="58" x2="115" y2="45" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="58" x2="80" y2="35" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="100" y1="58" x2="120" y2="35" stroke="#ffffff" strokeWidth="1.5" />
          </g>
          
          {/* Decorative particles */}
          <circle cx="60" cy="50" r="2" fill="#8b5cf6" opacity="0.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="100" r="1.5" fill="#ec4899" opacity="0.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="110" r="1" fill="#8b5cf6" opacity="0.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
        
        {/* View button overlay */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm text-gray-900 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-lg">
            <span>View Project</span>
            <ArrowUpRight size={16} />
          </span>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-t-purple-600 border-l-[60px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
      
      <div className="p-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          {project.category}
        </span>
        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-700 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="uppercase tracking-wider">DETAIL</span>
            <ArrowUpRight size={14} className="ml-2" />
          </div>
        </div>
      </div>
    </a>
  );
}