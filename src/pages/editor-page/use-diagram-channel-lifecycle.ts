import { useAuth } from '@/hooks/use-auth';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';
import { useRealtime } from '@/hooks/use-realtime';
import { useEffect } from 'react';

export const useDiagramChannelLifecycle = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const diagramId = useOnlineDiagramId();
    const { joinDiagram, leaveDiagram, connectionStatus } = useRealtime();

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        return () => {
            leaveDiagram();
        };
    }, [isLoading, isAuthenticated, diagramId, leaveDiagram]);

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        // Stay joined across a transport drop so rejoinAll still has this id.
        // Join again when the socket is up, including after the id changes
        // while the transport is reconnecting.
        if (
            connectionStatus !== 'connected' &&
            connectionStatus !== 'reconnecting'
        ) {
            return;
        }

        joinDiagram(diagramId);
    }, [isLoading, isAuthenticated, diagramId, connectionStatus, joinDiagram]);
};
