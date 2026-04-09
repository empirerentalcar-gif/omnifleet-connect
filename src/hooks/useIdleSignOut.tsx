import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const useIdleSignOut = () => {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/signin', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleSignOut, IDLE_TIMEOUT_MS);
  }, [handleSignOut]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
};
