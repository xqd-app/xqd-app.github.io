import { Hero } from '@/components/Hero';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/data/projects';
import { useTheme } from '@/hooks/useTheme';

export function Home() {
  const featuredProjects = projects.slice(0, 6);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen">
      <Hero />

      <section id="work" className={`py-24 lg:py-32 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-6 ${
              theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-[#F7F5F1] text-[#6B7077] border border-[#E7E3DA]'
            }`}>
              Selected Work
            </div>
            <h2 className={`font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#1E2227]'
            }`}>
              Featured Projects
            </h2>
            <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-[#6B7077]'
            }`}>
              A curated selection of recent work spanning brand design, web design, and product design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="text-center mt-20">
            <a
              href="/showcase"
              className={`inline-flex items-center px-8 py-4 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                  : 'bg-white hover:bg-[#3C5A78] text-[#1E2227] hover:text-white border border-[#E7E3DA] shadow-sm hover:shadow-md'
              }`}
            >
              View All Work
            </a>
          </div>
        </div>
      </section>

      <section className={`py-24 lg:py-32 ${theme === 'dark' ? 'bg-gray-800' : 'bg-[#F7F5F1]'}`}>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className={`font-['Playfair_Display'] text-2xl md:text-3xl lg:text-4xl font-medium italic leading-relaxed mb-8 ${
              theme === 'dark' ? 'text-gray-200' : 'text-[#1E2227]'
            }`}>
              "I design at the intersection of art and technology for artists who value craft."
            </blockquote>
            <div className={`w-16 h-px mx-auto ${theme === 'dark' ? 'bg-gray-600' : 'bg-[#E7E3DA]'}`} />
          </div>
        </div>
      </section>

      <section className={`py-24 lg:py-32 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <span className={`block text-5xl md:text-6xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-purple-400' : 'text-[#3C5A78]'
              }`}>3+</span>
              <p className={`text-sm uppercase tracking-widest ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#6B7077]'
              }`}>Years</p>
            </div>
            <div>
              <span className={`block text-5xl md:text-6xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-purple-400' : 'text-[#3C5A78]'
              }`}>8+</span>
              <p className={`text-sm uppercase tracking-widest ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#6B7077]'
              }`}>Projects</p>
            </div>
            <div>
              <span className={`block text-5xl md:text-6xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-purple-400' : 'text-[#3C5A78]'
              }`}>5+</span>
              <p className={`text-sm uppercase tracking-widest ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#6B7077]'
              }`}>Clients</p>
            </div>
            <div>
              <span className={`block text-5xl md:text-6xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-purple-400' : 'text-[#3C5A78]'
              }`}>100+</span>
              <p className={`text-sm uppercase tracking-widest ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#6B7077]'
              }`}>Assets</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}