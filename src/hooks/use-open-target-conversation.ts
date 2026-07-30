import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useConversationTargetPending } from '@/hooks/use-conversation-target-pending';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useLayout } from '@/hooks/use-layout';
import { useActiveConversationForTarget } from '@/hooks/use-active-conversation-for-target';
import { getConversationTargetKey } from '@/lib/conversations/conversation-target-key';
import {
    releaseConversationTargetPending,
    tryAcquireConversationTargetPending,
} from '@/lib/conversations/conversation-target-pending';
import {
    resolveConversationTargetMutationError,
    type ConversationTargetMutationErrorKey,
} from '@/lib/conversations/format-conversation-target-mutation-error';
import type { DiagramConversationTarget } from '@/lib/conversations/conversation-types';

export interface UseOpenTargetConversationResult {
    hasActiveConversation: boolean;
    canCreate: boolean;
    isPending: boolean;
    errorKey: ConversationTargetMutationErrorKey | null;
    errorMessage: string | null;
    clearError: () => void;
    openConversation: () => Promise<void>;
}

export const useOpenTargetConversation = (
    target: DiagramConversationTarget
): UseOpenTargetConversationResult => {
    const { t } = useTranslation();
    const { diagramId } = useChartDB();
    const { openConversationDetail } = useLayout();
    const { findOrCreateConversation } = useConversationMutations();
    const { diagramAccess } = useDiagramAccess();
    const isAvailable = useConversationsAvailability();
    const activeConversation = useActiveConversationForTarget(target);
    const [errorKey, setErrorKey] =
        useState<ConversationTargetMutationErrorKey | null>(null);
    const isMountedRef = useRef(true);
    const diagramIdRef = useRef(diagramId);

    const scopedTargetKey =
        diagramId !== null && diagramId !== undefined && diagramId.length > 0
            ? getConversationTargetKey(diagramId, target)
            : null;

    const isPending = useConversationTargetPending(scopedTargetKey);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        diagramIdRef.current = diagramId;
    }, [diagramId]);

    const canCreate =
        isAvailable &&
        diagramAccess?.can_edit === true &&
        scopedTargetKey !== null &&
        !isPending;

    const clearError = useCallback(() => {
        if (!isMountedRef.current) {
            return;
        }

        setErrorKey(null);
    }, []);

    const errorMessage =
        errorKey === null
            ? null
            : t(
                  `side_panel.conversations_section.target_entry.errors.${errorKey}`
              );

    const openConversation = useCallback(async (): Promise<void> => {
        if (scopedTargetKey === null || diagramId === null) {
            return;
        }

        if (isMountedRef.current) {
            setErrorKey(null);
        }

        if (activeConversation !== undefined) {
            openConversationDetail(activeConversation.id);
            return;
        }

        if (!isAvailable || diagramAccess?.can_edit !== true) {
            return;
        }

        if (!tryAcquireConversationTargetPending(scopedTargetKey)) {
            return;
        }

        const operationDiagramId = diagramIdRef.current;

        try {
            const conversation = await findOrCreateConversation(target);

            if (operationDiagramId !== diagramIdRef.current) {
                return;
            }

            openConversationDetail(conversation.id);
        } catch (error) {
            if (!isMountedRef.current) {
                return;
            }

            const resolved = resolveConversationTargetMutationError(error);
            setErrorKey(resolved.key);
        } finally {
            releaseConversationTargetPending(scopedTargetKey);
        }
    }, [
        activeConversation,
        diagramAccess?.can_edit,
        diagramId,
        findOrCreateConversation,
        isAvailable,
        openConversationDetail,
        scopedTargetKey,
        target,
    ]);

    return {
        hasActiveConversation: activeConversation !== undefined,
        canCreate,
        isPending,
        errorKey,
        errorMessage,
        clearError,
        openConversation,
    };
};
