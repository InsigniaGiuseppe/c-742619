
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const WalletPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <h1 className="text-4xl font-bold mb-8">My Wallet</h1>
        <p>Wallet overview and balances will be displayed here.</p>
        {/* Content for WalletPage */}
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;
