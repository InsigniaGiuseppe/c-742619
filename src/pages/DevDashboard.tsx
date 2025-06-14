
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { DevAuthProvider, useDevAuth } from '@/contexts/DevAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, ArrowRight, Home, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';

const DevDashboardContent = () => {
  const navigate = useNavigate();
  const { setMockUserType, mockUserType } = useDevAuth();

  const handleUserModeActivation = () => {
    setMockUserType('user');
    console.log('🚧 Development Mode: Activated as USER');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4">
        {/* Development Banner */}
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-black text-center py-1 text-sm font-medium z-50">
          🚧 DEV MODE - User Testing Environment (Remove before production)
        </div>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-40 pb-20 flex flex-col items-center text-center"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass">
            <span className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" /> Development User Mode
              {mockUserType === 'user' && <CheckCircle className="w-4 h-4 text-green-400" />}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-normal mb-4 tracking-tight">
            <TextGenerateEffect words="User Testing Dashboard" />
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test all user features without authentication. Activate user mode below to access protected routes.
          </p>
        </motion.section>

        {/* Content Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 pb-20"
        >
          {/* Mode Activation */}
          <motion.div variants={itemVariants}>
            <Card className="glass glass-hover max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Development Mode Control</CardTitle>
                <CardDescription>
                  {mockUserType === 'user' 
                    ? 'User mode is active - you can now access protected routes' 
                    : 'Activate user mode to test protected features'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!mockUserType && (
                  <Button 
                    onClick={handleUserModeActivation}
                    className="w-full button-gradient"
                    size="lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Activate User Mode
                  </Button>
                )}
                {mockUserType === 'user' && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">User Mode Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You can now access all user features and protected routes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-center mb-6">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    User Dashboard
                  </CardTitle>
                  <CardDescription>Go to the real user dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full button-gradient"
                    disabled={!mockUserType}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Real Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass glass-hover border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <Shield className="w-5 h-5" />
                    Admin View
                  </CardTitle>
                  <CardDescription>Switch to admin development view</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/dev-admin')}
                    variant="outline"
                    className="w-full glass border-orange-500/30 text-orange-400"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Switch to Admin
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Home Page
                  </CardTitle>
                  <CardDescription>Return to the landing page</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full glass"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* User Features Testing */}
          <motion.div variants={itemVariants}>
            <Card className="glass glass-hover">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">User Features</CardTitle>
                <CardDescription>
                  {mockUserType === 'user' 
                    ? 'Test user functionality below' 
                    : 'Activate user mode to access these features'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/wallet')} 
                    variant="outline" 
                    className="glass"
                    disabled={!mockUserType}
                  >
                    Wallet
                  </Button>
                  <Button 
                    onClick={() => navigate('/trading')} 
                    variant="outline" 
                    className="glass"
                    disabled={!mockUserType}
                  >
                    Trading
                  </Button>
                  <Button 
                    onClick={() => navigate('/lending')} 
                    variant="outline" 
                    className="glass"
                    disabled={!mockUserType}
                  >
                    Lending
                  </Button>
                  <Button 
                    onClick={() => navigate('/profile')} 
                    variant="outline" 
                    className="glass"
                    disabled={!mockUserType}
                  >
                    Profile
                  </Button>
                  <Button 
                    onClick={() => navigate('/referrals')} 
                    variant="outline" 
                    className="glass"
                    disabled={!mockUserType}
                  >
                    Referrals
                  </Button>
                  <Button 
                    onClick={() => navigate('/messages')} 
                    variant="outline" 
                    className="glass"
                    disabled={!mockUserType}
                  >
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const DevDashboard = () => {
  return (
    <DevAuthProvider>
      <DevDashboardContent />
    </DevAuthProvider>
  );
};

export default DevDashboard;
