import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramPresence } from '../use-diagram-presence';

export const DiagramViewers: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { viewerCount, isPresenceActive } = useDiagramPresence();

    if (
        isLoading ||
        !isAuthenticated ||
        !isPresenceActive ||
        viewerCount === 0
    ) {
        return null;
    }

    const label =
        viewerCount === 1 ? 'Viewing alone' : `${viewerCount} viewers`;

    return (
        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
    );
};
