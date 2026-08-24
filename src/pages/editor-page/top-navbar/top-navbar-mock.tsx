import React from 'react';
import { SiteBrand } from './site-brand';
import { SIDEBAR_WIDTH_ICON_EXTENDED } from '@/components/sidebar/sidebar';

export const TopNavbarMock: React.FC = () => {
    return (
        <nav className="flex h-10 items-center border-b bg-background">
            <div
                className="flex h-full shrink-0 items-center justify-center"
                style={{ width: SIDEBAR_WIDTH_ICON_EXTENDED }}
            >
                <SiteBrand />
            </div>
        </nav>
    );
};
