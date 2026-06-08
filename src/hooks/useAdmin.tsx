import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }

    const checkAdmin = async () => {
      // Retry once on transient error so a freshly authenticated admin
      // is not incorrectly bounced off the admin dashboard.
      let data: boolean | null = null;
      let error: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        data = res.data as boolean | null;
        error = res.error;
        if (!error) break;
        await new Promise((r) => setTimeout(r, 250));
      }

      if (error) {
        console.error('Admin role check failed:', error);
        navigate('/dashboard', { replace: true });
        return;
      }
      if (!data) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  return { isAdmin, loading: authLoading || loading };
};
