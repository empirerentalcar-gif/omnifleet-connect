import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import SEO from '@/components/SEO';
import { Crown, Check, X } from 'lucide-react';

const checkPasswordRules = (pw: string) => ({
  length: pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  lowercase: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

const PASSWORD_RULE_KEYS: { key: keyof ReturnType<typeof checkPasswordRules>; tKey: string }[] = [
  { key: 'length', tKey: 'auth.signUp.pwRule.length' },
  { key: 'uppercase', tKey: 'auth.signUp.pwRule.uppercase' },
  { key: 'lowercase', tKey: 'auth.signUp.pwRule.lowercase' },
  { key: 'number', tKey: 'auth.signUp.pwRule.number' },
  { key: 'special', tKey: 'auth.signUp.pwRule.special' },
];

const SignUp = () => {
  const { t } = useTranslation();
  const signUpSchema = z.object({
    registrationCode: z.string().trim().min(1, t('auth.signUp.errCodeReq')).max(100, t('auth.signUp.errCodeLong')),
    businessName: z.string().trim().min(1, t('auth.signUp.errBizReq')).max(200, t('auth.signUp.errBizLong')),
    email: z.string().trim().email(t('auth.signUp.errEmail')).max(255, t('auth.signUp.errEmailLong')),
    password: z
      .string()
      .min(8, t('auth.signUp.errPwShort'))
      .max(128, t('auth.signUp.errPwLong'))
      .regex(/[A-Z]/, t('auth.signUp.errPwUpper'))
      .regex(/[a-z]/, t('auth.signUp.errPwLower'))
      .regex(/[0-9]/, t('auth.signUp.errPwNumber'))
      .regex(/[^A-Za-z0-9]/, t('auth.signUp.errPwSpecial')),
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundingCount, setFoundingCount] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoundingCount = async () => {
      const { data } = await supabase.rpc('get_founding_member_count');
      setFoundingCount(typeof data === 'number' ? data : 0);
    };
    fetchFoundingCount();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs with Zod
    const result = signUpSchema.safeParse({ registrationCode, businessName, email, password });
    if (!result.success) {
      const passwordErrors = result.error.errors.filter((err) => err.path[0] === 'password');
      if (passwordErrors.length > 0) {
        toast({
          title: t('auth.signUp.pwTitle'),
          description: passwordErrors.map((err) => `• ${err.message}`).join('\n'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('auth.signUp.validation'),
          description: result.error.errors[0].message,
          variant: 'destructive',
        });
      }
      setLoading(false);
      return;
    }

    const validated = result.data;
    let codeType: 'access' | 'invite' | null = null;

    // Try invite code first
    const { data: isInviteValid } = await supabase.rpc('validate_invite_code', {
      code_to_check: validated.registrationCode,
    });
    if (isInviteValid) {
      codeType = 'invite';
    } else {
      // Try access code
      const { data: isAccessValid } = await supabase.rpc('validate_access_code', {
        code_to_check: validated.registrationCode,
      });
      if (isAccessValid) {
        codeType = 'access';
      }
    }

    if (!codeType) {
      toast({
        title: t('auth.signUp.errCode'),
        description: t('auth.signUp.errCodeDesc'),
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Create account with business_name in metadata (trigger will create profile)
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          business_name: validated.businessName,
        },
      },
    });

    if (error) {
      console.error('[SignUp] supabase.auth.signUp error:', error);
      const raw = error.message || '';
      let friendly = raw || t('auth.signUp.friendly.default');

      if (/already registered|already been registered|user already/i.test(raw)) {
        friendly = t('auth.signUp.friendly.exists');
      } else if (/password/i.test(raw) && /pwned|leaked|compromis/i.test(raw)) {
        friendly = t('auth.signUp.friendly.leaked');
      } else if (/rate limit|too many/i.test(raw)) {
        friendly = t('auth.signUp.friendly.rate');
      } else if (/invalid.*email|email.*invalid/i.test(raw)) {
        friendly = t('auth.signUp.friendly.invalidEmail');
      } else if (/database error|unexpected_failure|saving new user/i.test(raw)) {
        friendly = t('auth.signUp.friendly.server');
      }

      toast({
        title: t('auth.signUp.failed'),
        description: friendly,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Redeem the code if we have a user and profile
    if (signUpData.user) {
      if (codeType === 'invite') {
        await supabase.rpc('redeem_invite_code', {
          code_to_redeem: validated.registrationCode,
        });
      } else if (codeType === 'access') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', signUpData.user.id)
          .single();

        if (profile) {
          await supabase.rpc('redeem_access_code', {
            code_to_redeem: validated.registrationCode,
            user_profile_id: profile.id,
          });
        }
      }

      // Notify admin of new agency signup (fire-and-forget)
      try {
        await supabase.functions.invoke('notify-new-agency', {
          body: {
            agency: {
              id: signUpData.user.id,
              agency_name: validated.businessName,
              email: validated.email,
              created_at: new Date().toISOString(),
            },
          },
        });
      } catch (notifyErr) {
        console.error('Admin notification failed (non-blocking):', notifyErr);
      }
    }

    // Track successful form submission
    const { trackFormSubmission } = await import('@/lib/analytics');
    trackFormSubmission('signup_form');

    toast({
      title: t('auth.signUp.checkEmail'),
      description: t('auth.signUp.checkEmailDesc'),
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Sign Up | ZUVIO" description="Create a ZUVIO account to list your independent car rental business." path="/signup" noindex />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t('auth.signUp.title')}</h1>
          {foundingCount !== null && foundingCount < 25 ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-amber-600">{t('auth.signUp.founding')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('auth.signUp.foundingSub')}
              </p>
              <div className="flex flex-col items-center gap-1">
                <Badge variant="secondary" className="text-sm">
                  {t('auth.signUp.spots')}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  <Trans i18nKey="auth.signUp.afterTrial" components={{ strong: <strong /> }} />
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                <Trans i18nKey="auth.signUp.startTrial" components={{ strong: <strong /> }} />
              </p>
              <p className="text-xs text-muted-foreground">
                <Trans i18nKey="auth.signUp.afterTrialPlain" components={{ strong: <strong /> }} />
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="registration-code" className="block text-sm font-medium text-foreground mb-1">
              {t('auth.signUp.regCode')}
            </label>
            <Input
              id="registration-code"
              type="text"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              required
              placeholder={t('auth.signUp.regCodePh')}
            />
          </div>

          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-foreground mb-1">
              {t('auth.signUp.businessName')}
            </label>
            <Input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder={t('auth.signUp.businessNamePh')}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              {t('auth.signUp.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.signUp.emailPh')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              {t('auth.signUp.password')}
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder={t('auth.signUp.passwordPh')}
            />
            <ul className="mt-2 space-y-1" aria-label={t('auth.signUp.pwReq')}>
              {(() => {
                const rules = checkPasswordRules(password);
                return PASSWORD_RULE_KEYS.map(({ key, tKey }) => {
                  const ok = rules[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-center gap-2 text-xs ${
                        ok ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {ok ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>{t(tKey)}</span>
                    </li>
                  );
                });
              })()}
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signUp.submitting') : t('auth.signUp.submit')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.signUp.haveAccount')}{' '}
          <Link to="/signin" className="text-primary hover:underline">
            {t('auth.signUp.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
