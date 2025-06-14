
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Clock, Shield, FileText, Wallet, TrendingUp, AlertTriangle, ArrowRight, ClipboardCheck, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { useAdminStats } from '@/hooks/useAdminStats';
import FormattedNumber from '@/components/FormattedNumber';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useAdminStats();

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'border-blue-500/30 hover:bg-blue-500/10'
    },
    {
      title: 'KYC Submissions',
      description: 'Review and verify user KYC documents',
      icon: ClipboardCheck,
      path: '/admin/kyc',
      color: 'border-cyan-500/30 hover:bg-cyan-500/10'
    },
    {
      title: 'Transaction Monitoring',
      description: 'Monitor and approve transactions',
      icon: TrendingUp,
      path: '/admin/transactions',
      color: 'border-green-500/30 hover:bg-green-500/10'
    },
    {
      title: 'Wallet Verifications',
      description: 'Approve external wallet addresses',
      icon: Wallet,
      path: '/admin/wallets',
      color: 'border-purple-500/30 hover:bg-purple-500/10'
    },
    {
      title: 'Logs & History',
      description: 'View audit logs and admin actions',
      icon: FileText,
      path: '/admin/audit-log',
      color: 'border-orange-500/30 hover:bg-orange-500/10'
    }
  ];

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

  const getStatCards = () => {
    if (isLoading || !stats) {
      return [
        { title: 'Total Users', value: 0, icon: Users, color: 'text-blue-400', isLoading: true },
        { title: 'Total Balances', value: 0, icon: DollarSign, color: 'text-green-400', isLoading: true, type: 'currency' as const },
        { title: 'Pending KYCs', value: 0, icon: Clock, color: 'text-yellow-400', isLoading: true },
        { title: 'Pending Transactions', value: 0, icon: AlertTriangle, color: 'text-red-400', isLoading: true },
        { title: 'Total Trading Profit', value: 0, icon: TrendingUp, color: 'text-purple-400', isLoading: true, type: 'currency' as const },
        { title: 'Total Trades', value: 0, icon: BarChart, color: 'text-orange-400', isLoading: true }
      ];
    }

    return [
      { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
      { title: 'Total Balances', value: stats.totalBalances, icon: DollarSign, color: 'text-green-400', type: 'currency' as const },
      { title: 'Pending KYCs', value: stats.pendingKycs, icon: Clock, color: 'text-yellow-400' },
      { title: 'Pending Transactions', value: stats.pendingTransactions, icon: AlertTriangle, color: 'text-red-400' },
      { title: 'Total Trading Profit', value: stats.totalTradingProfit, icon: TrendingUp, color: 'text-purple-400', type: 'currency' as const },
      { title: 'Total Trades', value: stats.totalTrades, icon: BarChart, color: 'text-orange-400' }
    ];
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-40 pb-20 flex flex-col items-center text-center"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass border-orange-500/30">
            <span className="text-sm font-medium flex items-center gap-2 text-orange-400">
              <Shield className="w-4 h-4" /> Platform Administration
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-normal mb-4 tracking-tight">
            <TextGenerateEffect words="Admin Dashboard" />
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oversee platform operations, manage users, and monitor critical system activities from one central hub.
          </p>
        </motion.section>

        {/* Content Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 pb-20"
        >
          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {error && (
              <div className="col-span-full text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400">Error loading statistics: {error.message}</p>
              </div>
            )}
            {getStatCards().map((stat, index) => (
              <Card key={index} className="glass glass-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.isLoading ? (
                      <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                    ) : stat.type === 'currency' ? (
                      <FormattedNumber
                        value={stat.value}
                        type="currency"
                        showTooltip={false}
                        className="text-2xl font-bold"
                      />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Admin Sections */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-center mb-6">Management Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section, index) => (
                <Card key={index} className={`glass glass-hover cursor-pointer transition-all duration-300 ${section.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <section.icon className="w-6 h-6" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate(section.path)}
                      className="w-full button-gradient"
                    >
                      Open Section <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="glass glass-hover mt-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks for quick access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button onClick={() => navigate('/admin/users')} variant="outline" className="glass"><Users className="w-4 h-4 mr-2" />View All Users</Button>
                  <Button onClick={() => navigate('/admin/kyc')} variant="outline" className="glass"><ClipboardCheck className="w-4 h-4 mr-2" />KYC Submissions</Button>
                  <Button onClick={() => navigate('/admin/transactions')} variant="outline" className="glass"><AlertTriangle className="w-4 h-4 mr-2" />Pending Approvals</Button>
                  <Button onClick={() => navigate('/admin/wallets')} variant="outline" className="glass"><Wallet className="w-4 h-4 mr-2" />Wallet Verifications</Button>
                  <Button onClick={() => navigate('/admin/audit-log')} variant="outline" className="glass"><FileText className="w-4 h-4 mr-2" />View Audit Logs</Button>
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

export default AdminDashboard;
