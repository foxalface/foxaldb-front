import {
    useEntityRemoteEditing,
    EMPTY_REMOTE_EDITORS,
} from '@/hooks/use-remote-editing';
import {
    buildEditingConflictMessage,
    computeEditingConflictSeverity,
    type EditingConflictSeverity,
} from '@/lib/realtime/editing-conflict-utils';
import type { EditingEntityType } from '@/lib/realtime/editing-types';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface UseEditingConflictWarningOptions {
    isLocallyEditing: boolean;
    debounceMs?: number;
}

export interface UseEditingConflictWarningResult {
    hasConflict: boolean;
    severity: EditingConflictSeverity;
    editors: readonly RemoteEditingViewModel[];
    message: string;
}

const DEFAULT_DEBOUNCE_MS = 300;

const normalizeDebounceMs = (debounceMs: number): number =>
    debounceMs < 0 ? 0 : debounceMs;

export const useEditingConflictWarning = (
    entityType: EditingEntityType,
    entityId: string,
    options: UseEditingConflictWarningOptions
): UseEditingConflictWarningResult => {
    const { t } = useTranslation();
    const { isLocallyEditing, debounceMs = DEFAULT_DEBOUNCE_MS } = options;
    const remoteEditors = useEntityRemoteEditing(entityType, entityId);
    const hasRawConflict = isLocallyEditing && remoteEditors.length > 0;
    const [isConflictVisible, setIsConflictVisible] = useState(false);
    const timerRef = useRef<number | null>(null);
    const hasRawConflictRef = useRef(hasRawConflict);
    hasRawConflictRef.current = hasRawConflict;

    const normalizedDebounceMs = normalizeDebounceMs(debounceMs);

    useEffect(() => {
        if (!hasRawConflict) {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            setIsConflictVisible(false);
            return;
        }

        if (isConflictVisible) {
            return;
        }

        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;

            if (hasRawConflictRef.current) {
                setIsConflictVisible(true);
            }
        }, normalizedDebounceMs);

        return () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [hasRawConflict, isConflictVisible, normalizedDebounceMs]);

    const editors = isConflictVisible ? remoteEditors : EMPTY_REMOTE_EDITORS;

    const severity = computeEditingConflictSeverity({
        isLocallyEditing: isLocallyEditing && isConflictVisible,
        remoteEditors: editors,
    });

    const hasConflict = severity === 'high';

    const message = useMemo(
        () => buildEditingConflictMessage(editors, t),
        [editors, t]
    );

    return useMemo(
        () => ({
            hasConflict,
            severity,
            editors,
            message,
        }),
        [hasConflict, severity, editors, message]
    );
};
