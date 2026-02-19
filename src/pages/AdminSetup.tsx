import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [step, setStep] = useState<'check' | 'form' | 'verify' | 'activate' | 'done' | 'blocked'>('check');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if an admin already exists
  useEffect(() => {
    const check = async () => {
      // Try calling bootstrap — if it fails with "already exists" message, block
      // But we don't want to call it yet. Instead, check auth state first.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is already logged in — try to bootstrap directly
        setStep('activate');
      } else {
        setStep('form');
      }
    };
    check();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { business_name: businessName || 'Admin' } },
    });

    setSubmitting(false);

    if (error) {
      toast({ title: 'Sign-up failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Check your email', description: 'Confirm your email address, then come back here.' });
    setStep('verify');
  };

  const handleActivate = async () => {
    setSubmitting(true);

    // Refresh session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not signed in', description: 'Please confirm your email and sign in first.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.rpc('bootstrap_first_admin' as any);

    setSubmitting(false);

    if (error) {
      if (error.message.includes('already exists')) {
        setStep('blocked');
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }

    setStep('done');
    toast({ title: 'Admin role assigned!', description: 'Redirecting to dashboard…' });
    setTimeout(() => navigate('/admin'), 1500);
  };

  const handleSignIn = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Sign-in failed', description: error.message, variant: 'destructive' });
      return;
    }

    setStep('activate');
  };

  if (step === 'check') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Checking…</div>
      </div>
    );
  }

  if (step === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-2" />
            <CardTitle>Setup Disabled</CardTitle>
            <CardDescription>An admin account already exists. This bootstrap page is no longer available.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/signin')}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle>Admin Account Ready</CardTitle>
            <CardDescription>Redirecting to dashboard…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (step === 'activate') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle>Activate Admin Role</CardTitle>
            <CardDescription>Click below to assign the admin role to your account. This only works if no admin exists yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleActivate} disabled={submitting}>
              {submitting ? 'Activating…' : 'Activate Admin Role'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>Check your inbox for a confirmation link. After confirming, sign in below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSignIn} disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In & Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // step === 'form'
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle>Initial Admin Setup</CardTitle>
          <CardDescription>Create the first admin account. No access code required. This page is disabled once an admin exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="ZUVIO Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Admin Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
