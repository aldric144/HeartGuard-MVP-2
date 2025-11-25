/**
 * AuthInput Component - Large, accessible input fields
 */

import { forwardRef, InputHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={props.id} 
          className="text-base font-semibold text-gray-900"
        >
          {label}
        </Label>
        <Input
          ref={ref}
          className={`h-12 text-base ${error ? 'border-red-500' : ''} ${className || ''}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
