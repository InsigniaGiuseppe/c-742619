
import { useState, useEffect } from 'react';
import { useDevAuth } from '@/contexts/DevAuthContext';

export const useDevAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, mockUserType } = useDevAuth();

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // In dev mode, check the mock user type
    if (mockUserType === 'admin' || user.email === 'admin@prompto.trading') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [user, mockUserType]);

  return { isAdmin, loading };
};
