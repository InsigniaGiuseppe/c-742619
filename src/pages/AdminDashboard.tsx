
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Wallet, 
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Vault,
  BarChart3
} from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { formatCurrency } from '@/lib/formatters';

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useAdminStats();

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, accounts, and permissions',
      icon: Users,
      href: '/admin/users',
      stats: stats ? `${stats.totalUsers} total users` : 'Loading...',
      color: 'bg-blue-500'
    },
    {
      title: 'Transaction Management',
      description: 'Monitor and manage all platform transactions',
      icon: CreditCard,
      href: '/admin/transactions',
      stats: stats ? `${stats.completedTransactions} completed` : 'Loading...',
      color: 'bg-green-500'
    },
    {
      title: 'KYC Documents',
      description: 'Review and approve KYC submissions',
      icon: FileText,
      href: '/admin/kyc',
      stats: stats ? `${stats.pendingKyc} pending` : 'Loading...',
      color: 'bg-orange-500'
    },
    {
      title: 'External Wallets',
      description: 'Verify and manage external wallet submissions',
      icon: Wallet,
      href: '/admin/wallets',
      stats: 'Wallet verifications',
      color: 'bg-purple-500'
    },
    {
      title: 'The Reserve',
      description: 'Monitor platform liquidity and reserves',
      icon: Vault,
      href: '/admin/reserves',
      stats: 'Internal vault system',
      color: 'bg-indigo-500'
    },
    {
      title: 'Analytics',
      description: 'Platform analytics and reporting',
      icon: BarChart3,
      href: '/admin/analytics',
      stats: 'Coming soon',
      color: 'bg-pink-500'
    }
  ];

  const quickStats = [
    {
      title: 'Total Volume',
      value: stats ? formatCurrency(stats.totalVolume, { currency: 'EUR', compact: true }) : 'Loading...',
      icon: TrendingUp,
      change: '+12.5%'
    },
    {
      title: 'Total AUM',
      value: stats ? formatCurrency(stats.totalAUM, { currency: 'EUR', compact: true }) : 'Loading...',
      icon: DollarSign,
      change: '+8.2%'
    },
    {
      title: 'Active Users',
      value: stats ? `${stats.activeUsers}` : 'Loading...',
      icon: UserCheck,
      change: '+5.1%'
    },
    {
      title: 'Pending KYC',
      value: stats ? `${stats.pendingKyc}` : 'Loading...',
      icon: AlertTriangle,
      change: stats && stats.pendingKyc > 0 ? 'Needs attention' : 'All clear'
    }
  ];

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="glass">
          <CardContent className="p-6">
            <p className="text-red-400">Error loading admin dashboard: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and monitoring</p>
        </div>
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          System Operational
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-400">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <Card key={index} className="glass hover:bg-white/5 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.color}`}>
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm">{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{section.stats}</p>
              <Button asChild className="w-full">
                <Link to={section.href}>
                  Manage {section.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Real-time platform health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Trading Engine: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">API Services: Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
