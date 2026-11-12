import React from 'react';
import { cn } from '@/lib/utils';

export interface LegalAppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}

/**
 * Legal/document links opened from application flows (auth, editor menu, etc.).
 * Opens in a new tab so the current surface (including modals) stays intact.
 */
export const LegalAppLink: React.FC<LegalAppLinkProps> = ({
    className,
    children,
    href,
    ...props
}) => (
    <a
        className={cn(className)}
        href={href}
        {...props}
        rel="noopener noreferrer"
        target="_blank"
    >
        {children}
    </a>
);
