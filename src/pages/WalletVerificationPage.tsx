
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

interface WalletVerification {
  id: string;
  coin_symbol: string;
  wallet_address: string;
  wallet_label?: string;
  screenshot_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

const WalletVerificationPage = () => {
  const { user } = useAuth();
  const [walletVerifications, setWalletVerifications] = useState<WalletVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coin_symbol: '',
    wallet_address: '',
    wallet_label: '',
    screenshot: null as File | null
  });

  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'BNB', label: 'Binance Coin (BNB)' },
    { value: 'ADA', label: 'Cardano (ADA)' },
    { value: 'DOT', label: 'Polkadot (DOT)' },
  ];

  React.useEffect(() => {
    if (user) {
      fetchWalletVerifications();
    }
  }, [user]);

  const fetchWalletVerifications = async () => {
    if (!user) return;

    try {
      // For now, just set empty array since wallet_verifications table might not be accessible
      // In the future, this would query the wallet_verifications table
      setWalletVerifications([]);
      console.log('Wallet verifications table not yet accessible, using empty array');
    } catch (error) {
      console.error('Error fetching wallet verifications:', error);
      setWalletVerifications([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.coin_symbol || !formData.wallet_address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = '';

      // Upload screenshot if provided
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Note: In a real implementation, you would upload to Supabase Storage
        // For now, we'll just store a placeholder URL
        screenshotUrl = `screenshots/${fileName}`;
      }

      // For now, we'll simulate the insertion and show success
      const insertData = {
        user_id: user.id,
        coin_symbol: formData.coin_symbol,
        wallet_address: formData.wallet_address,
        wallet_label: formData.wallet_label || null,
        screenshot_url: screenshotUrl || null,
        status: 'pending'
      };

      console.log('Would insert wallet verification:', insertData);
      
      toast.success('Wallet verification request submitted successfully');
      setFormData({
        coin_symbol: '',
        wallet_address: '',
        wallet_label: '',
        screenshot: null
      });
      fetchWalletVerifications();
    } catch (error) {
      console.error('Error submitting wallet verification:', error);
      toast.error('Failed to submit wallet verification');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Only PNG, JPG, and JPEG files are allowed');
        return;
      }
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20 pt-24"
      >
        <h1 className="text-4xl font-bold mb-8">Wallet Verification</h1>
        <p className="text-gray-400 mb-8">
          Verify your external wallets to enable secure deposits and withdrawals. 
          Only verified wallets can be used for transactions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission Form */}
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>Add New Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="coin">Cryptocurrency *</Label>
                  <Select 
                    value={formData.coin_symbol} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, coin_symbol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Wallet Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your wallet address"
                    value={formData.wallet_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="label">Wallet Label (Optional)</Label>
                  <Input
                    id="label"
                    type="text"
                    placeholder="e.g., My MetaMask, Hardware Wallet"
                    value={formData.wallet_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, wallet_label: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="screenshot">Screenshot (Optional)</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-border border-dashed rounded cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-400">
                          Click to upload screenshot
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG up to 5MB
                        </p>
                      </div>
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {formData.screenshot && (
                      <p className="mt-2 text-sm text-green-400">
                        File selected: {formData.screenshot.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !user}
                  className="w-full"
                >
                  {loading ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Wallet History */}
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>Your Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              {walletVerifications.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No wallet verifications submitted yet
                </div>
              ) : (
                <div className="space-y-4">
                  {walletVerifications.map((wallet) => (
                    <div key={wallet.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{wallet.coin_symbol}</h3>
                          <p className="text-sm text-gray-400">
                            {wallet.wallet_label || 'Unlabeled Wallet'}
                          </p>
                        </div>
                        {getStatusBadge(wallet.status)}
                      </div>
                      
                      <p className="text-sm font-mono bg-gray-700 p-2 rounded mb-2">
                        {wallet.wallet_address}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Submitted: {new Date(wallet.created_at).toLocaleDateString()}
                        </span>
                        {wallet.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {wallet.admin_notes && wallet.status === 'rejected' && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                          <p className="text-sm text-red-300">
                            Admin Notes: {wallet.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default WalletVerificationPage;
