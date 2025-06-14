
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const LendingPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <h1 className="text-4xl font-bold mb-8">Lending & Staking</h1>
        <p>Lending offers and staking options will be displayed here.</p>
        {/* Content for LendingPage */}
      </main>
      <Footer />
    </div>
  );
};

export default LendingPage;
