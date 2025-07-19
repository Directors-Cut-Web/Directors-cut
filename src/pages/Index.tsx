import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MembershipSection from '@/components/MembershipSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      {/* ActionButtons component is correctly removed from the homepage */}
      <MembershipSection />
      <Footer />
    </div>
  );
};

export default Index;