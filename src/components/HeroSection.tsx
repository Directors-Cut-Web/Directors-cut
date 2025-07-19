import futuristicStudio from '@/assets/futuristic-studio.jpg';

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(34, 40, 49, 0.8), rgba(34, 40, 49, 0.6)), url(${futuristicStudio})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col justify-end h-screen pb-32">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary mb-6 tracking-tight">
            Director's Cut
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light tracking-wide">
            Advanced Ai Video Prompt Systems
          </p>
          
          <p className="text-lg md:text-xl text-foreground/80 font-light italic">
            "Film-Grade AI Prompting—Unmatched Power, Unrivaled Control"
          </p>
        </div>
        
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;