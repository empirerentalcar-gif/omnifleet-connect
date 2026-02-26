import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    const checkRole = async () => {
      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      setIsAdmin(!!data);
      setRoleLoading(false);
    };

    checkRole();
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || roleLoading };
};
