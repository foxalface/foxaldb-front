import type { BaseAlertDialogProps } from '@/dialogs/base-alert-dialog/base-alert-dialog';
import { ApiError } from '@/lib/api/client';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { clearPendingDiagramOperationSyncTimers } from '@/lib/realtime/diagram-sync-state';
import type { NavigateFunction } from 'react-router-dom';

export interface KickOutOfDiagramOptions {
    title: string;
    message: string;
    dedupeKey?: string;
    clearDiagramAccess: () => void;
    loadDiagramFromData: (diagram: Diagram) => void;
    navigate: NavigateFunction;
    showAlert: (params: BaseAlertDialogProps) => void;
    openOpenDiagramDialog: (params?: { canClose?: boolean }) => void;
}

let activeKickOutKey: string | null = null;

export const isDiagramAccessDenied = (error: unknown): boolean =>
    error instanceof ApiError && (error.status === 403 || error.status === 404);

export const createBlankDiagramView = (): Diagram => ({
    id: '',
    name: '',
    databaseType: DatabaseType.GENERIC,
    createdAt: new Date(),
    updatedAt: new Date(),
});

export const kickOutOfDiagram = ({
    title,
    message,
    dedupeKey,
    clearDiagramAccess,
    loadDiagramFromData,
    navigate,
    showAlert,
    openOpenDiagramDialog,
}: KickOutOfDiagramOptions): void => {
    const key = dedupeKey ?? `${title}:${message}`;

    if (activeKickOutKey === key) {
        return;
    }

    activeKickOutKey = key;

    clearPendingDiagramOperationSyncTimers();
    clearDiagramAccess();
    loadDiagramFromData(createBlankDiagramView());
    navigate('/');

    showAlert({
        title,
        description: message,
        closeLabel: 'OK',
    });

    openOpenDiagramDialog({ canClose: false });

    window.setTimeout(() => {
        if (activeKickOutKey === key) {
            activeKickOutKey = null;
        }
    }, 2_000);
};
