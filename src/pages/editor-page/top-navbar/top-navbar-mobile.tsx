import React from 'react';
import { Menu } from './menu/menu';
import { Button } from '@/components/button/button';
import { useSidebar } from '@/components/sidebar/use-sidebar';
import { MenuIcon } from 'lucide-react';
import { PresenceAvatarStack } from '@/components/presence/presence-avatar-stack';
import { SiteBrand } from './site-brand';
import { UserNavMenu } from './user-nav-menu';
import { SIDEBAR_WIDTH_ICON_EXTENDED } from '@/components/sidebar/sidebar';

import type { EntryFlowActiveDiagramDeletionActions } from '@/pages/editor-page/entry-flow-active-diagram-deletion-actions';

export interface TopNavbarMobileProps extends EntryFlowActiveDiagramDeletionActions {}

export const TopNavbarMobile: React.FC<TopNavbarMobileProps> = ({
    onActiveDiagramDeleted,
}) => {
    const { toggleSidebar } = useSidebar();

    return (
        <nav className="flex h-10 items-center border-b bg-background">
            <Button
                className="shrink-0 md:hidden"
                size="icon"
                variant="ghost"
                onClick={toggleSidebar}
            >
                <MenuIcon className="size-5" />
            </Button>

            <div
                className="flex h-full shrink-0 items-center justify-center"
                style={{ width: SIDEBAR_WIDTH_ICON_EXTENDED }}
            >
                <SiteBrand />
            </div>

            <div className="flex min-w-0 flex-1 items-center overflow-x-auto px-2">
                <Menu onActiveDiagramDeleted={onActiveDiagramDeleted} />
            </div>

            <div className="flex shrink-0 items-center gap-2 px-2">
                <PresenceAvatarStack />
                <UserNavMenu />
            </div>
        </nav>
    );
};
