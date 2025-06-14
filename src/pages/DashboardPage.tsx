
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24"> {/* Added pt-24 for nav offset */}
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <p>Welcome to your CryptoTrade dashboard!</p>
        {/* Content for the dashboard will go here */}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
