/**
 * Forgot Password Page - /auth/forgot
 * PART 1: Password reset request
 */

import { useState } from 'react';
import { AuthCard } from '@/features/auth/AuthCard';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { AuthInput } from '@/features/auth/AuthInput';
import { AuthFooter } from '@/features/auth/AuthFooter';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { requestPasswordReset } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast({
        title: 'Request failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard title="Check Your Email" subtitle="Password reset instructions sent">
        <AuthHeader />

        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-base text-green-800 ml-2">
            If an account exists with <strong>{email}</strong>, you will receive password reset instructions shortly.
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Button
            onClick={() => window.location.href = '/auth/login'}
            className="w-full h-12 text-base font-bold bg-[#D4A44A] hover:bg-[#B8903E] text-white"
          >
            Return to Login
          </Button>
        </div>

        <AuthFooter
          text="Didn't receive an email?"
          linkText="Try again"
          linkHref="/auth/forgot"
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset Your Password" subtitle="Enter your email to receive reset instructions">
      <AuthHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="your.email@example.com"
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-bold bg-[#D4A44A] hover:bg-[#B8903E] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <AuthFooter
        text="Remember your password?"
        linkText="Log In"
        linkHref="/auth/login"
      />
    </AuthCard>
  );
}
