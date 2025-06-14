
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

const DevAdminContent = () => {
  const navigate = useNavigate();
  const { setMockUserType, mockUserType } = useDevAuth();

  const handleAdminModeActivation = () => {
    setMockUserType('admin');
    console.log('🚧 Development Mode: Activated as ADMIN');
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
          🚧 DEV MODE - Admin Testing Environment (Remove before production)
        </div>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-40 pb-20 flex flex-col items-center text-center"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass border-orange-500/30">
            <span className="text-sm font-medium flex items-center gap-2 text-orange-400">
              <Shield className="w-4 h-4" /> Development Admin Mode
              {mockUserType === 'admin' && <CheckCircle className="w-4 h-4 text-green-400" />}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-normal mb-4 tracking-tight">
            <TextGenerateEffect words="Admin Testing Dashboard" />
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test all admin features without authentication. Activate admin mode below to access protected routes.
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
            <Card className="glass glass-hover border-orange-500/30 max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-orange-400">Development Admin Control</CardTitle>
                <CardDescription>
                  {mockUserType === 'admin' 
                    ? 'Admin mode is active - you can now access admin routes' 
                    : 'Activate admin mode to test admin features'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!mockUserType && (
                  <Button 
                    onClick={handleAdminModeActivation}
                    className="w-full button-gradient"
                    size="lg"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Activate Admin Mode
                  </Button>
                )}
                {mockUserType === 'admin' && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Admin Mode Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You can now access all admin features and protected routes
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
              <Card className="glass glass-hover border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription>Go to the real admin dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/admin')}
                    className="w-full button-gradient"
                    disabled={!mockUserType}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Real Admin
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    User View
                  </CardTitle>
                  <CardDescription>Switch to user development view</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/dev-dashboard')}
                    variant="outline"
                    className="w-full glass"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Switch to User
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

          {/* Admin Features Testing */}
          <motion.div variants={itemVariants}>
            <Card className="glass glass-hover border-orange-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-orange-400">Admin Features</CardTitle>
                <CardDescription>
                  {mockUserType === 'admin' 
                    ? 'Test admin functionality below' 
                    : 'Activate admin mode to access these features'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/admin')} 
                    variant="outline" 
                    className="glass border-orange-500/30 text-orange-400"
                    disabled={!mockUserType}
                  >
                    Admin Dashboard
                  </Button>
                  <Button 
                    onClick={() => navigate('/admin/users')} 
                    variant="outline" 
                    className="glass border-orange-500/30 text-orange-400"
                    disabled={!mockUserType}
                  >
                    User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Features Available to Admin */}
          <motion.div variants={itemVariants}>
            <Card className="glass glass-hover">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">User Features (Admin Access)</CardTitle>
                <CardDescription>
                  {mockUserType === 'admin' 
                    ? 'Test user features with admin privileges' 
                    : 'Activate admin mode to access these features'
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

const DevAdmin = () => {
  return (
    <DevAuthProvider>
      <DevAdminContent />
    </DevAuthProvider>
  );
};

export default DevAdmin;
