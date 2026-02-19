import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import SEO from '@/components/SEO';

const signUpSchema = z.object({
  accessCode: z.string().trim().min(1, 'Access code is required').max(100, 'Access code too long'),
  businessName: z.string().trim().min(1, 'Business name is required').max(200, 'Business name too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs with Zod
    const result = signUpSchema.safeParse({ accessCode, businessName, email, password });
    if (!result.success) {
      toast({
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const validated = result.data;

    // Validate access code first
    const { data: isValid, error: codeError } = await supabase.rpc('validate_access_code', {
      code_to_check: validated.accessCode,
    });

    if (codeError || !isValid) {
      toast({
        title: 'Invalid access code',
        description: 'The access code is invalid or expired.',
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
      toast({
        title: 'Sign up failed',
        description: 'Unable to create account. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Redeem the access code if we have a user and profile
    if (signUpData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', signUpData.user.id)
        .single();

      if (profile) {
        await supabase.rpc('redeem_access_code', {
          code_to_redeem: validated.accessCode,
          user_profile_id: profile.id,
        });
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

    toast({
      title: 'Check your email',
      description: 'We sent you a confirmation link to verify your account.',
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Sign Up | ZUVIO" description="Create a ZUVIO account to list your independent car rental business." path="/signup" noindex />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the Zuvio network
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="access-code" className="block text-sm font-medium text-foreground mb-1">
              Access Code
            </label>
            <Input
              id="access-code"
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              placeholder="Enter your access code"
            />
          </div>

          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-foreground mb-1">
              Business Name
            </label>
            <Input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="Your rental business name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Min 8 characters, with uppercase, lowercase, and a number
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
