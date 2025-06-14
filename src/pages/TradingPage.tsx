
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TradingPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <h1 className="text-4xl font-bold mb-8">Trading</h1>
        <p>Live crypto prices and trading simulation will be here.</p>
        {/* Content for TradingPage */}
      </main>
      <Footer />
    </div>
  );
};

export default TradingPage;
