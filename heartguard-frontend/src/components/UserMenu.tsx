/**
 * UserMenu Component
 * PART 5: User menu for navigation with account settings and logout
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, CreditCard, LogOut, Menu } from 'lucide-react';

interface UserMenuProps {
  mobile?: boolean;
}

export function UserMenu({ mobile = false }: UserMenuProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (mobile) {
    return (
      <div className="space-y-2 p-4 border-t border-gray-200">
        <div className="px-3 py-2 text-sm text-gray-600">
          {user?.email}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => navigate('/account')}
        >
          <Settings className="w-4 h-4 mr-2" />
          My Account
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => navigate('/billing/manage')}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Subscription
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {loading ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm text-gray-600">
          {user?.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/account')}>
          <Settings className="w-4 h-4 mr-2" />
          My Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/billing/manage')}>
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Subscription
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          className="text-red-600 focus:text-red-700 focus:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {loading ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
