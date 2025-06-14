
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24 flex items-center justify-center">
        <div className="glass glass-hover rounded-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
          <form className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-1 bg-background/80" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="mt-1 bg-background/80" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* "Remember me" placeholder */}
              </div>
              <Link to="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full button-gradient">
              Login
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
