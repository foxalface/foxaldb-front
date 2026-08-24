import React from 'react';
import { Link } from 'react-router-dom';
import FoxalDBLogo from '@/assets/logo-2.png';
import { cn } from '@/lib/utils';

export interface SiteBrandProps {
    className?: string;
}

export const SiteBrand: React.FC<SiteBrandProps> = ({ className }) => {
    return (
        <Link
            to="/"
            className={cn(
                'flex items-center justify-center rounded-md transition-opacity hover:opacity-80',
                className
            )}
        >
            <img src={FoxalDBLogo} alt="FoxalDB" className="size-6 shrink-0" />
        </Link>
    );
};
