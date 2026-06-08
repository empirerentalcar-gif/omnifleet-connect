import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import SEO from '@/components/SEO';

const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  return !!data;
};

const SignIn = () => {
  const { t } = useTranslation();
  const signInSchema = z.object({
    email: z.string().trim().email(t('auth.signIn.errInvalidEmail')).max(255, t('auth.signIn.errEmailTooLong')),
    password: z.string().min(1, t('auth.signIn.errPwRequired')).max(128, t('auth.signIn.errPwTooLong')),
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      toast({
        title: t('auth.signIn.validation'),
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error || !signInData?.user) {
      toast({
        title: t('auth.signIn.errFail'),
        description: t('auth.signIn.errInvalid'),
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Role-based redirect using the freshly authenticated user id.
    // Use { replace: true } so the SignIn page is removed from history.
    const userId = signInData.user.id;
    let isAdmin = false;
    try {
      isAdmin = await checkIsAdmin(userId);
    } catch (e) {
      console.error('Role check failed after sign-in:', e);
    }
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Sign In | ZUVIO" description="Sign in to your ZUVIO rental agency dashboard." path="/signin" noindex />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t('auth.signIn.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.signIn.welcome')}
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              {t('auth.signIn.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.signIn.emailPh')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              {t('auth.signIn.password')}
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.signIn.passwordPh')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signIn.submitting') : t('auth.signIn.submit')}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={async () => {
              if (!email.trim()) {
                toast({ title: t('auth.signIn.needEmail'), description: t('auth.signIn.needEmailDesc'), variant: 'destructive' });
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
              } else {
                toast({ title: t('auth.signIn.resetSent'), description: t('auth.signIn.resetSentDesc') });
              }
            }}
            className="text-sm text-primary hover:underline"
          >
            {t('auth.signIn.forgot')}
          </button>
          <p className="text-sm text-muted-foreground">
            {t('auth.signIn.noAccount')}{' '}
            <Link to="/signup" className="text-primary hover:underline">
              {t('auth.signIn.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
