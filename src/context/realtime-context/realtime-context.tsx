import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type { ConnectionStatus } from '@/lib/realtime/connection-manager';
import type {
    RealtimeEventHandler,
    RealtimeEventName,
} from '@/lib/realtime/events';
import type { CursorWhisperPayload } from '@/lib/realtime/cursor-types';
import {
    initialPresenceState,
    type PresenceState,
} from '@/lib/realtime/presence-reducer';

export interface RealtimeContextValue {
    connectionStatus: ConnectionStatus;
    currentDiagramId: string | null;
    presence: PresenceState;
    joinDiagram: (diagramId: string) => void;
    leaveDiagram: () => void;
    sendCursor: (payload: CursorWhisperPayload) => void;
    on: <T extends RealtimeEventName>(
        event: T,
        handler: RealtimeEventHandler<T>
    ) => () => void;
}

export const RealtimeContext = createContext<RealtimeContextValue>({
    connectionStatus: 'idle',
    currentDiagramId: null,
    presence: initialPresenceState(),
    joinDiagram: emptyFn,
    leaveDiagram: emptyFn,
    sendCursor: emptyFn,
    on: () => emptyFn,
});
