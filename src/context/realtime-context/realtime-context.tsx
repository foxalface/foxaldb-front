import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type { ConnectionStatus } from '@/lib/realtime/connection-manager';
import type { CursorAction } from '@/lib/realtime/cursor-reducer';
import type {
    RealtimeEventHandler,
    RealtimeEventName,
} from '@/lib/realtime/events';
import type { CursorWhisperPayload } from '@/lib/realtime/cursor-types';
import type { MovementAction } from '@/lib/realtime/movement-reducer';
import type { MovementWhisperPayload } from '@/lib/realtime/movement-types';
import type { SelectionAction } from '@/lib/realtime/selection-reducer';
import type { SelectionWhisperPayload } from '@/lib/realtime/selection-types';
import type { EditingAction } from '@/lib/realtime/editing-reducer';
import type { EditingWhisperPayload } from '@/lib/realtime/editing-types';
import type { DiagramCommentEventChannel } from '@/lib/realtime/comment-subscriber';
import {
    initialPresenceState,
    type PresenceState,
} from '@/lib/realtime/presence-reducer';

export type CursorActionListener = (action: CursorAction) => void;

export type SelectionActionListener = (action: SelectionAction) => void;

export type MovementActionListener = (action: MovementAction) => void;

export type EditingActionListener = (action: EditingAction) => void;

export interface RealtimeContextValue {
    connectionStatus: ConnectionStatus;
    currentDiagramId: string | null;
    presence: PresenceState;
    joinDiagram: (diagramId: string) => void;
    leaveDiagram: () => void;
    getDiagramPrivateChannel: () => DiagramCommentEventChannel | null;
    onReconnect: (listener: () => void) => () => void;
    sendCursor: (payload: CursorWhisperPayload) => void;
    subscribeToCursorActions: (listener: CursorActionListener) => () => void;
    sendSelection: (payload: SelectionWhisperPayload) => void;
    subscribeToSelectionActions: (
        listener: SelectionActionListener
    ) => () => void;
    sendMovement: (payload: MovementWhisperPayload) => void;
    subscribeToMovementActions: (
        listener: MovementActionListener
    ) => () => void;
    sendEditing: (payload: EditingWhisperPayload) => void;
    subscribeToEditingActions: (listener: EditingActionListener) => () => void;
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
    getDiagramPrivateChannel: () => null,
    onReconnect: () => emptyFn,
    sendCursor: emptyFn,
    subscribeToCursorActions: () => emptyFn,
    sendSelection: emptyFn,
    subscribeToSelectionActions: () => emptyFn,
    sendMovement: emptyFn,
    subscribeToMovementActions: () => emptyFn,
    sendEditing: emptyFn,
    subscribeToEditingActions: () => emptyFn,
    on: () => emptyFn,
});
