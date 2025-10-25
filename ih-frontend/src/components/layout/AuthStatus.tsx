'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { User, LogOut, LogIn } from 'lucide-react';

export function AuthStatus() {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <DropdownMenu
        trigger={
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sapphire-900 to-emerald-900 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">{user?.name || 'Account'}</span>
          </Button>
        }
      >
        <DropdownMenuItem>
          Signed in as {user?.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Register</Link>
      </Button>
    </div>
  );
}
