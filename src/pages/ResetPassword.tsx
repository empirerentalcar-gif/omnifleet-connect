import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const markReady = () => {
      if (mounted) setReady(true);
    };

    const markError = (message: string) => {
      if (!mounted) return;
      setVerificationError(message);
      setReady(false);
    };

    const prepareRecoverySession = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const code = params.get('code');
      const errorDescription = params.get('error_description') || hash.get('error_description');

      if (errorDescription) {
        markError(errorDescription);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          markError(error.message);
          return;
        }
        window.history.replaceState({}, document.title, '/reset-password');
        markReady();
        return;
      }

      if (hash.get('type') === 'recovery' || hash.get('access_token')) {
        // Supabase-js hydrates hash-based recovery sessions through the auth listener below.
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) markReady();
      else markError('This reset link is invalid or expired. Please request a new password reset email.');
    };

    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        markReady();
      }
    });

    prepareRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <SEO title="Reset Password | ZUVIO" description="Set a new password for your ZUVIO account." path="/reset-password" noindex />
        <div className="w-full max-w-md space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reset link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">{verificationError}</p>
          </div>
          <Button type="button" className="w-full" onClick={() => navigate('/signin')}>
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

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
            <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">{t('auth.reset.confirm')}</label>
            <PasswordInput id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
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
