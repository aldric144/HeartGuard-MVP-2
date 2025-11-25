/**
 * Reset Password Page - /auth/reset
 * PART 1: Password reset with token
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '@/features/auth/AuthCard';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { AuthInput } from '@/features/auth/AuthInput';
import { PasswordStrengthBar } from '@/features/auth/PasswordStrengthBar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPassword } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

export function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Invalid reset link',
        description: 'Please request a new password reset',
        variant: 'destructive'
      });
      navigate('/auth/forgot');
    }
  }, [token, navigate, toast]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, formData.password);

      toast({
        title: 'Password reset successful!',
        description: 'You can now log in with your new password.'
      });

      navigate('/auth/login');
    } catch (err) {
      toast({
        title: 'Reset failed',
        description: err instanceof Error ? err.message : 'Invalid or expired reset link',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!token) {
    return (
      <AuthCard title="Invalid Reset Link">
        <AuthHeader />
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <AlertDescription className="ml-2">
            This password reset link is invalid or has expired.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate('/auth/forgot')}
          className="w-full h-12 text-base font-bold bg-[#D4A44A] hover:bg-[#B8903E] text-white mt-4"
        >
          Request New Reset Link
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set New Password" subtitle="Choose a strong password for your account">
      <AuthHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="password"
          label="New Password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          placeholder="Minimum 8 characters"
          required
        />

        <PasswordStrengthBar password={formData.password} />

        <AuthInput
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="Re-enter your password"
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
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
