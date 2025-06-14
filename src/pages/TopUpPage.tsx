
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TopUpPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <h1 className="text-4xl font-bold mb-8">Top Up Funds</h1>
        <p>Top-up methods and history will be displayed here.</p>
        {/* Content for TopUpPage */}
      </main>
      <Footer />
    </div>
  );
};

export default TopUpPage;
