/**
 * AuthHeader Component
 * HeartGuard branding for auth pages
 */

import { Shield } from 'lucide-react';

export function AuthHeader() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <Shield className="w-8 h-8 text-[#D4A44A]" />
      <span className="text-2xl font-bold text-gray-900">
        HeartGuard
      </span>
    </div>
  );
}
