
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Clock, Shield, FileText, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-400' },
    { title: 'Total Balances', value: '$2.5M', icon: DollarSign, color: 'text-green-400' },
    { title: 'Pending KYCs', value: '23', icon: Clock, color: 'text-yellow-400' },
    { title: 'Pending Transactions', value: '8', icon: AlertTriangle, color: 'text-red-400' }
  ];

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage user accounts, KYC, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'border-blue-500/30 hover:bg-blue-500/10'
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
      path: '/admin/logs',
      color: 'border-orange-500/30 hover:bg-orange-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/a2c0bb3a-a47b-40bf-ba26-d79f2f9e741b.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-4xl font-bold">PROMPTO TRADING</h1>
              <h2 className="text-xl text-muted-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Admin Dashboard
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground">Manage platform operations, users, and transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Open {section.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="glass glass-hover mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/admin/users')} 
                variant="outline" 
                className="glass"
              >
                <Users className="w-4 h-4 mr-2" />
                View All Users
              </Button>
              <Button 
                onClick={() => navigate('/admin/transactions')} 
                variant="outline" 
                className="glass"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pending Approvals
              </Button>
              <Button 
                onClick={() => navigate('/admin/wallets')} 
                variant="outline" 
                className="glass"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Wallet Verifications
              </Button>
              <Button 
                onClick={() => navigate('/admin/logs')} 
                variant="outline" 
                className="glass"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
