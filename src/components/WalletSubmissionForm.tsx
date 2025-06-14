
    import React, { useState } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { supabase } from '@/integrations/supabase/client';
    import { useAuth } from '@/hooks/useAuth';
    import { useExternalWallets } from '@/hooks/useExternalWallets';
    import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
    import { useToast } from '@/hooks/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import CryptoLogo from './CryptoLogo';
    import { Loader2 } from 'lucide-react';

    const formSchema = z.object({
      coin_symbol: z.string().min(1, 'Please select a cryptocurrency.'),
      network: z.string().min(1, 'Network is required.'),
      wallet_address: z.string().min(1, 'Wallet address is required.'),
      wallet_label: z.string().optional(),
      screenshot: z.any().optional(),
    });

    type WalletFormValues = z.infer<typeof formSchema>;

    const WalletSubmissionForm: React.FC = () => {
      const { user } = useAuth();
      const { addWallet } = useExternalWallets();
      const { cryptocurrencies } = useCryptocurrencies();
      const { toast } = useToast();
      const [isSubmitting, setIsSubmitting] = useState(false);

      const form = useForm<WalletFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          coin_symbol: '',
          network: '',
          wallet_address: '',
          wallet_label: '',
        },
      });

      const onSubmit = async (values: WalletFormValues) => {
        if (!user) {
          toast({ title: 'Authentication Error', description: 'You must be logged in to add a wallet.', variant: 'destructive' });
          return;
        }
        setIsSubmitting(true);
        try {
          let screenshotUrl: string | undefined;
          const file = values.screenshot?.[0];

          if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${new Date().getTime()}.${fileExt}`;
            const { data, error } = await supabase.storage.from('wallet-screenshots').upload(fileName, file);
            if (error) throw new Error(`Screenshot upload failed: ${error.message}`);
            const { data: { publicUrl } } = supabase.storage.from('wallet-screenshots').getPublicUrl(fileName);
            screenshotUrl = publicUrl;
          }

          await addWallet({
            coin_symbol: values.coin_symbol,
            network: values.network,
            wallet_address: values.wallet_address,
            wallet_label: values.wallet_label,
            screenshot_url: screenshotUrl,
          });

          toast({ title: 'Success', description: 'Your wallet has been submitted for verification.' });
          form.reset();
        } catch (error: any) {
          toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Add New Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="coin_symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cryptocurrency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a coin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cryptocurrencies.map((crypto) => (
                            <SelectItem key={crypto.symbol} value={crypto.symbol}>
                              <div className="flex items-center gap-2">
                                <CryptoLogo logo_url={crypto.logo_url} name={crypto.name} symbol={crypto.symbol} size="sm" />
                                <span>{crypto.name} ({crypto.symbol})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ethereum (ERC20), TRC20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wallet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wallet_label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. My MetaMask Wallet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="screenshot"
                  render={() => (
                    <FormItem>
                      <FormLabel>Wallet Screenshot (Optional)</FormLabel>
                      <FormControl>
                         <Input type="file" accept="image/png, image/jpeg" {...form.register('screenshot')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Wallet'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      );
    };

    export default WalletSubmissionForm;
    