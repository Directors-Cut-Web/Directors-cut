/// src/pages/StudioPage.tsx

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActionButtons from '@/components/ActionButtons';
import MembershipSection from '@/components/MembershipSection';

const StudioPage = () => {
  // The default state is now 'true' so the studios are always visible during development.
  const [isSubscribed, setIsSubscribed] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 min-h-screen">
        {isSubscribed ? (
          // The studios will now be shown by default.
          <ActionButtons />
        ) : (
          // This "paywall" section will be hidden for now.
          <>
            <div className="text-center py-10 px-6">
              <h1 className="text-4xl font-bold text-primary mb-4">Studio Access</h1>
              <p className="text-xl text-muted-foreground">
                Please select a membership plan to access the AI Video Studios.
              </p>
            </div>
            <MembershipSection />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudioPage;