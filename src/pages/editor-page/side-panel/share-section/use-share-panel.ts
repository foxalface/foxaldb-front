import { useCallback, useEffect, useState } from 'react';
import {
    listDiagramMembers,
    type DiagramMemberResource,
} from '@/lib/api/diagram-members';

export type SharePanelStatus = 'idle' | 'loading' | 'error' | 'success';

interface UseSharePanelResult {
    members: DiagramMemberResource[];
    status: SharePanelStatus;
    isRetrying: boolean;
    handleRetry: () => void;
    handleMemberAdded: (member: DiagramMemberResource) => void;
    handleMembersChange: (members: DiagramMemberResource[]) => void;
}

export const useSharePanel = (
    diagramId: string | undefined
): UseSharePanelResult => {
    const [members, setMembers] = useState<DiagramMemberResource[]>([]);
    const [status, setStatus] = useState<SharePanelStatus>('idle');
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchMembers = useCallback(async () => {
        if (diagramId === undefined) {
            setMembers([]);
            setStatus('idle');
            return;
        }

        setStatus((currentStatus) =>
            currentStatus === 'success' ? currentStatus : 'loading'
        );

        try {
            const data = await listDiagramMembers(diagramId);
            setMembers(data);
            setStatus('success');
        } catch {
            setMembers([]);
            setStatus('error');
        }
    }, [diagramId]);

    useEffect(() => {
        void fetchMembers();
    }, [fetchMembers]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        void fetchMembers().finally(() => {
            setIsRetrying(false);
        });
    }, [fetchMembers]);

    const handleMemberAdded = useCallback((member: DiagramMemberResource) => {
        setMembers((current) => [...current, member]);
    }, []);

    const handleMembersChange = useCallback(
        (nextMembers: DiagramMemberResource[]) => {
            setMembers(nextMembers);
        },
        []
    );

    return {
        members,
        status,
        isRetrying,
        handleRetry,
        handleMemberAdded,
        handleMembersChange,
    };
};
