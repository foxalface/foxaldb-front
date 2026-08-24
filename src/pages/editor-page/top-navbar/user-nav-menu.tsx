import React, { useCallback, useMemo, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { CheckIcon } from '@radix-ui/react-icons';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import { LanguageFlag } from '@/components/language-flag/language-flag';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { getUserInitials } from '@/lib/user';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { getLanguageByCode, languages } from '@/i18n/languages';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';
import { cn } from '@/lib/utils';
import { LogOut, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export interface UserNavMenuProps {
    className?: string;
}

export const UserNavMenu: React.FC<UserNavMenuProps> = ({ className }) => {
    const { t, i18n } = useTranslation();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const { openAuthDialog, openUserSettingsDialog } = useDialog();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const currentLanguageCode = useMemo(() => {
        return (
            languages.find((language) => language.code === i18n.language)
                ?.code ??
            languages.find((language) => i18n.languages.includes(language.code))
                ?.code ??
            'en'
        );
    }, [i18n.language, i18n.languages]);

    const currentLanguage = getLanguageByCode(currentLanguageCode);

    const showRoleBadge =
        isAuthenticated &&
        diagramId &&
        isValidBackendDiagramId(diagramId) &&
        diagramAccess?.role;

    const initials = useMemo(() => {
        if (!user) {
            return null;
        }

        return getUserInitials(user.first_name, user.last_name);
    }, [user]);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);

        try {
            await logout();
            setMenuOpen(false);
        } catch {
            // AuthProvider clears the local session even when the request fails.
        } finally {
            setIsLoggingOut(false);
        }
    }, [logout]);

    const handleLanguageChange = useCallback(
        async (languageCode: string) => {
            await i18n.changeLanguage(languageCode);
        },
        [i18n]
    );

    const handleOpenSettings = useCallback(() => {
        setMenuOpen(false);
        openUserSettingsDialog();
    }, [openUserSettingsDialog]);

    const handleOpenAuth = useCallback(() => {
        setMenuOpen(false);
        openAuthDialog();
    }, [openAuthDialog]);

    if (isLoading) {
        return (
            <div className={cn('flex items-center justify-center', className)}>
                <div className="size-8 animate-pulse rounded-full bg-muted" />
            </div>
        );
    }

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="rounded-full p-0.5 outline-none transition-colors hover:bg-muted/60 focus-visible:outline-none data-[state=open]:bg-muted/60"
                        aria-label={t('auth.nav.user_menu')}
                    >
                        <div className="relative">
                            <Avatar className="size-8 border border-border/60 shadow-sm">
                                <AvatarFallback
                                    className={cn(
                                        'text-xs font-semibold',
                                        isAuthenticated
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    {isAuthenticated && initials ? (
                                        initials
                                    ) : (
                                        <User className="size-4" />
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            {showRoleBadge ? (
                                <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-background bg-background text-muted-foreground shadow-sm">
                                    <DiagramRoleIcon
                                        role={diagramAccess.role}
                                        withTooltip={false}
                                        className="text-muted-foreground"
                                        iconClassName="size-2.5"
                                    />
                                </span>
                            ) : null}
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-60"
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                >
                    {isAuthenticated && user ? (
                        <>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col gap-0.5">
                                    <span className="truncate font-medium">
                                        {user.full_name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </>
                    ) : null}

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            {currentLanguage ? (
                                <LanguageFlag
                                    countryCode={currentLanguage.countryCode}
                                    className="mr-2 size-4"
                                />
                            ) : null}
                            {t('auth.nav.change_language')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
                            {languages.map((language) => {
                                const isSelected =
                                    language.code === currentLanguageCode;

                                return (
                                    <DropdownMenuItem
                                        key={language.code}
                                        className={cn(
                                            'relative gap-2 pr-8',
                                            isSelected &&
                                                'bg-accent text-accent-foreground'
                                        )}
                                        onSelect={(event) => {
                                            event.preventDefault();
                                            void handleLanguageChange(
                                                language.code
                                            );
                                        }}
                                    >
                                        <LanguageFlag
                                            countryCode={language.countryCode}
                                            className="size-4 shrink-0"
                                        />
                                        <span className="truncate">
                                            {language.nativeName}
                                        </span>
                                        <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                            <CheckIcon
                                                className={cn(
                                                    'size-4',
                                                    isSelected
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                        </span>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {isAuthenticated && user ? (
                        <DropdownMenuItem onClick={handleOpenSettings}>
                            <Settings className="mr-2 size-4" />
                            {t('auth.nav.settings')}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={handleOpenAuth}>
                            <User className="mr-2 size-4" />
                            {t('auth.nav.sign_in')}
                        </DropdownMenuItem>
                    )}

                    {isAuthenticated ? (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                disabled={isLoggingOut}
                                className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                                onClick={() => {
                                    void handleLogout();
                                }}
                            >
                                <LogOut
                                    className={
                                        SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                    }
                                />
                                {isLoggingOut
                                    ? t('auth.nav.loading')
                                    : t('auth.nav.logout')}
                            </DropdownMenuItem>
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
