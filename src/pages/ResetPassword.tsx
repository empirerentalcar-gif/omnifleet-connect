import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked link and was auto-logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: t('auth.reset.tooShort'), description: t('auth.reset.tooShortDesc'), variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: t('auth.reset.mismatch'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: t('auth.reset.failed'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.reset.updated'), description: t('auth.reset.updatedDesc') });
      navigate('/signin');
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="animate-pulse text-muted-foreground">{t('auth.reset.verifying')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Reset Password | ZUVIO" description="Set a new password for your ZUVIO account." path="/reset-password" noindex />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t('auth.reset.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.reset.subtitle')}</p>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">{t('auth.reset.newPassword')}</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">{t('auth.reset.confirm')}</label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.reset.updating') : t('auth.reset.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
