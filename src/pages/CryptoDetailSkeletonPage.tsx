
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CryptoDetailSkeletonPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto px-4 py-20 pt-24 animate-pulse">
        <Button variant="ghost" className="mb-6 text-white hover:text-white/80" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trading
        </Button>

        {/* Coin Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/10" />
            <div>
              <div className="h-8 w-48 bg-white/10 rounded mb-2" />
              <div className="h-6 w-24 bg-white/10 rounded" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-56 bg-white/10 rounded" />
            <div className="h-7 w-20 bg-white/10 rounded" />
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="h-5 w-full bg-white/10 rounded" />
            <div className="h-5 w-full bg-white/10 rounded" />
            <div className="h-5 w-full bg-white/10 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section Skeleton */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="h-7 w-32 bg-white/10 rounded" />
                  <div className="flex gap-2">
                    <div className="h-9 w-12 bg-white/10 rounded-md" />
                    <div className="h-9 w-12 bg-white/10 rounded-md" />
                    <div className="h-9 w-12 bg-white/10 rounded-md" />
                    <div className="h-9 w-12 bg-white/10 rounded-md" />
                    <div className="h-9 w-12 bg-white/10 rounded-md" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[400px] bg-white/5 rounded-lg" />
              </CardContent>
            </Card>
          </div>

          {/* Trading Section Skeleton */}
          <div>
            <Card className="glass">
              <CardHeader>
                <div className="h-7 w-40 bg-white/10 rounded mb-2" />
                <div className="h-5 w-48 bg-white/10 rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-white/10 rounded" />
                  <div className="h-10 flex-1 bg-white/10 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-16 w-full bg-white/10 rounded" />
                  <div className="h-16 w-full bg-white/10 rounded" />
                  <div className="h-10 w-full bg-white/10 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CryptoDetailSkeletonPage;
