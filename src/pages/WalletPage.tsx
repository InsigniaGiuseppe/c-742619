
    import React from 'react';
    import Navigation from '@/components/Navigation';
    import Footer from '@/components/Footer';
    import WalletSubmissionForm from '@/components/WalletSubmissionForm';
    import WalletList from '@/components/WalletList';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/hooks/useAuth';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';

    const WalletPage = () => {
      const { user, loading } = useAuth();

      if (loading) {
        return (
           <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center">
             <Loader2 className="h-16 w-16 animate-spin text-primary" />
           </div>
        );
      }
    
      if (!user) {
        return (
          <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please log in to manage your wallets.</p>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-black text-foreground flex flex-col">
          <Navigation />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-grow container mx-auto px-4 py-20 pt-24"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">External Wallet Management</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Add and manage your external cryptocurrency wallets for withdrawals. Submitted wallets will be reviewed for security purposes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1">
                <WalletSubmissionForm />
              </div>
              <div className="lg:col-span-2">
                <WalletList />
              </div>
            </div>
          </motion.main>
          <Footer />
        </div>
      );
    };

    export default WalletPage;
    