import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={project.link}
      className="group relative block bg-white border border-gray-100 hover:border-transparent rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.35)] hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 光晕边框 */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" />

      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
        />

        {/* 渐变遮罩 */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`}></div>

        {/* 顶部光带 */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transform origin-left transition-transform duration-500 ${
          isHovered ? 'scale-x-100' : 'scale-x-0'
        }`}></div>

        {/* View 按钮 */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-md text-purple-700 rounded-full text-sm font-semibold hover:bg-white transition-all shadow-xl hover:scale-105">
            <span>View Project</span>
            <ArrowUpRight size={16} />
          </span>
        </div>

        {/* 角标 */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Featured</span>
        </div>
      </div>

      <div className="relative p-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs uppercase tracking-widest mb-3 font-semibold">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
          {project.category}
        </span>
        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-700 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Explore</span>
          <div className="flex items-center text-sm font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <span className="uppercase tracking-wider">Detail</span>
            <ArrowUpRight size={14} className="ml-2" />
          </div>
        </div>
      </div>
    </a>
  );
}