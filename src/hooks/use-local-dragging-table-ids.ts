import {
    getLocalDraggingTableIds,
    subscribeLocalDraggingTableIds,
} from '@/lib/realtime/local-dragging-table-ids-registry';
import { useSyncExternalStore } from 'react';

export const useLocalDraggingTableIds = (): ReadonlySet<string> =>
    useSyncExternalStore(
        subscribeLocalDraggingTableIds,
        getLocalDraggingTableIds,
        getLocalDraggingTableIds
    );
