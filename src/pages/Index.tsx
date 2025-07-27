import HeroSection from '@/components/HeroSection';
import MembershipSection from '@/components/MembershipSection';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <MembershipSection />
    </div>
  );
};

export default Index;