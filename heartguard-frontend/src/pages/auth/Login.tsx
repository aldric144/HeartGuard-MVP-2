/**
 * Login Page - /auth/login
 * PART 1: User authentication
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '@/features/auth/AuthCard';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { AuthInput } from '@/features/auth/AuthInput';
import { AuthFooter } from '@/features/auth/AuthFooter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password
      });

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });

      navigate('/home');
    } catch (err) {
      toast({
        title: 'Login failed',
        description: err instanceof Error ? err.message : 'Invalid email or password',
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

  return (
    <AuthCard title="Welcome Back" subtitle="Log in to your HeartGuard account">
      <AuthHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          placeholder="your.email@example.com"
          required
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          placeholder="Enter your password"
          required
        />

        <div className="text-right">
          <a
            href="/auth/forgot"
            className="text-sm font-semibold text-[#D4A44A] hover:text-[#B8903E] transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-bold bg-[#D4A44A] hover:bg-[#B8903E] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Logging In...
            </>
          ) : (
            'Log In'
          )}
        </Button>
      </form>

      <AuthFooter
        text="Don't have an account?"
        linkText="Sign Up"
        linkHref="/auth/signup"
      />
    </AuthCard>
  );
}
