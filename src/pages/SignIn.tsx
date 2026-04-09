import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import SEO from '@/components/SEO';

const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  return !!data;
};

const signInSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

const SignIn = () => {
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
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      toast({
        title: 'Sign in failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      // Check if user is admin and redirect accordingly
      const { data: { user: signedInUser } } = await supabase.auth.getUser();
      if (signedInUser && await checkIsAdmin(signedInUser.id)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Sign In | ZUVIO" description="Sign in to your ZUVIO rental agency dashboard." path="/signin" noindex />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back to Zuvio
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
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
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={async () => {
              if (!email.trim()) {
                toast({ title: 'Enter your email', description: 'Please enter your email address first, then click Forgot Password.', variant: 'destructive' });
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
              } else {
                toast({ title: 'Check your email', description: 'A password reset link has been sent if an account exists.' });
              }
            }}
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
