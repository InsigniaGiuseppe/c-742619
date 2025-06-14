
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ReferralsPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <h1 className="text-4xl font-bold mb-8">Referral Program</h1>
        <p>Referral codes, links, and rewards information will be here.</p>
        {/* Content for ReferralsPage */}
      </main>
      <Footer />
    </div>
  );
};

export default ReferralsPage;
