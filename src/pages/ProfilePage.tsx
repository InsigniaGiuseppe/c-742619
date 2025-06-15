
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import PortfolioOverview from '@/components/PortfolioOverview';
import { useAuth } from '@/hooks/useAuth';
import { User, Wallet, Settings } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information and portfolio</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-6">
          <PersonalInfoSection />
        </TabsContent>
        
        <TabsContent value="portfolio" className="mt-6">
          <PortfolioOverview />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="text-center text-muted-foreground py-10">
            Settings panel coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProfilePage;
