'use client';

import { ReactNode } from 'react';
import { AuthGuard } from '@/components/features/auth/auth-guard';
import { UserMenu } from '@/components/features/auth/user-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  requireAdmin?: boolean;
  title?: string;
  description?: string;
}

export function AuthLayout({ children, requireAdmin = false, title, description }: AuthLayoutProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <AuthGuard requireAuth requireAdmin={requireAdmin}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">
                {title || 'Dashboard'}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <UserMenu />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-sm text-muted-foreground">
                © 2024 Next.js Starter Kit. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <a
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}