import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface AuthNavActionProps {
    compact?: boolean;
}

export const AuthNavAction: React.FC<AuthNavActionProps> = ({ compact }) => {
    const { t } = useTranslation();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { openAuthDialog } = useDialog();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);

        try {
            await logout();
        } catch {
            // AuthProvider clears the local session even when the request fails.
        } finally {
            setIsLoggingOut(false);
        }
    }, [logout]);

    if (isLoading) {
        return (
            <Button disabled size="sm" type="button" variant="secondary">
                {t('auth.nav.loading')}
            </Button>
        );
    }

    if (!isAuthenticated) {
        return (
            <Button
                className="font-medium"
                size="sm"
                type="button"
                onClick={openAuthDialog}
            >
                {t('auth.nav.sign_in')}
            </Button>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-2">
            <span
                className={cn(
                    'truncate text-xs text-muted-foreground',
                    compact ? 'max-w-20' : 'max-w-36'
                )}
                title={user?.full_name}
            >
                {user?.full_name}
            </span>
            <Button
                disabled={isLoggingOut}
                onClick={handleLogout}
                size="sm"
                type="button"
                variant="secondary"
            >
                {isLoggingOut ? t('auth.nav.loading') : t('auth.nav.logout')}
            </Button>
        </div>
    );
};
