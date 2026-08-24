import React from 'react';
import { LastSaved } from './last-saved';
import { Menu } from './menu/menu';
import { PresenceAvatarStack } from '@/components/presence/presence-avatar-stack';
import { SiteBrand } from './site-brand';
import { UserNavMenu } from './user-nav-menu';
import { SIDEBAR_WIDTH_ICON_EXTENDED } from '@/components/sidebar/sidebar';

import type { EntryFlowActiveDiagramDeletionActions } from '@/pages/editor-page/entry-flow-active-diagram-deletion-actions';

export interface TopNavbarProps extends EntryFlowActiveDiagramDeletionActions {}

export const TopNavbar: React.FC<TopNavbarProps> = ({
    onActiveDiagramDeleted,
}) => {
    return (
        <nav
            className="flex h-10 items-center border-b bg-background"
            style={
                {
                    '--sidebar-width-icon-extended':
                        SIDEBAR_WIDTH_ICON_EXTENDED,
                } as React.CSSProperties
            }
        >
            <div
                className="flex h-full shrink-0 items-center justify-center"
                style={{ width: SIDEBAR_WIDTH_ICON_EXTENDED }}
            >
                <SiteBrand />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Menu onActiveDiagramDeleted={onActiveDiagramDeleted} />
                <div className="ml-auto flex items-center gap-2">
                    <div className="hidden items-center gap-2 sm:flex">
                        <LastSaved />
                        <PresenceAvatarStack />
                    </div>
                    <UserNavMenu />
                </div>
            </div>
        </nav>
    );
};
