/**
 * Sign Up Page - /auth/signup
 * PART 1: Full registration with validation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '@/features/auth/AuthCard';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { AuthInput } from '@/features/auth/AuthInput';
import { AuthFooter } from '@/features/auth/AuthFooter';
import { PasswordStrengthBar } from '@/features/auth/PasswordStrengthBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      toast({
        title: 'Account created successfully!',
        description: 'Please log in to continue.'
      });

      navigate('/auth/login');
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err instanceof Error ? err.message : 'Please try again',
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
    <AuthCard title="Create Your Account" subtitle="Join HeartGuard to protect yourself online">
      <AuthHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="firstName"
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          error={errors.firstName}
          placeholder="Enter your first name"
          required
        />

        <AuthInput
          id="lastName"
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          error={errors.lastName}
          placeholder="Enter your last name"
          required
        />

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
          placeholder="Minimum 8 characters"
          required
        />

        <PasswordStrengthBar password={formData.password} />

        <AuthInput
          id="confirmPassword"
          label="Confirm Password"
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <AuthFooter
        text="Already have an account?"
        linkText="Log In"
        linkHref="/auth/login"
      />
    </AuthCard>
  );
}
