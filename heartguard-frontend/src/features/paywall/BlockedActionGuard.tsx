/**
 * Blocked Action Guard
 * Wraps actions that require subscription
 */

import { ReactNode } from 'react';
import { hasUsedFreeScan } from './FreeUsageTracker';

interface BlockedActionGuardProps {
  children: ReactNode;
  onBlocked: () => void;
  isSubscribed?: boolean;
}

export function BlockedActionGuard({ children, onBlocked, isSubscribed = false }: BlockedActionGuardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isSubscribed && hasUsedFreeScan()) {
      e.preventDefault();
      e.stopPropagation();
      onBlocked();
    }
  };

  return (
    <div onClick={handleClick} className="relative">
      {children}
      {!isSubscribed && hasUsedFreeScan() && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg cursor-pointer">
          <div className="text-center p-4">
            <p className="font-semibold">Subscription Required</p>
            <p className="text-sm text-muted-foreground">Upgrade to unlock</p>
          </div>
        </div>
      )}
    </div>
  );
}
