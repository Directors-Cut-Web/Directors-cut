// src/pages/Index.tsx

import HeroSection from '@/components/HeroSection';
import MembershipSection from '@/components/MembershipSection';
import BackgroundVideo from '../components/BackgroundVideo';

const Index = () => {
  return (
    <div className="relative">
      <BackgroundVideo />

      {/* This container places your original content on top of the video */}
      <div className="relative z-10">
        <HeroSection />
        <MembershipSection />
      </div>
    </div>
  );
};

export default Index;