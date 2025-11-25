/**
 * AuthCard Component - Hybrid Theme
 * White card on dark background with subtle glow
 */

import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" 
         style={{ 
           background: 'linear-gradient(135deg, #0D0F12 0%, #1B1E23 100%)'
         }}>
      <div className="relative w-full max-w-md">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
        
        {/* White card */}
        <div className="relative bg-white rounded-xl shadow-2xl p-8">
          {title && (
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
