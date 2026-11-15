// Inspired by react-hot-toast library
import React from 'react';

import type { ToastActionElement, ToastProps } from '@/components/toast/toast';

const SEMANTIC_TOAST_DURATION_MS = {
    success: 3_000,
    info: 3_000,
    warning: 4_000,
    danger: 4_000,
} as const;

export type ToastLane = 'error' | 'status';

type ToasterToast = ToastProps & {
    id: string;
    lane: ToastLane;
    revision: number;
    dedupeKey?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
    layout?: 'row' | 'column';
    hideCloseButton?: boolean;
};

type ToastOptions = Omit<
    ToasterToast,
    'id' | 'lane' | 'revision' | 'open' | 'onOpenChange'
>;

export type ToastUpdate = Partial<
    Omit<ToasterToast, 'id' | 'lane' | 'revision' | 'open' | 'onOpenChange'>
>;

interface LaneState {
    visible: ToasterToast | null;
    queue: ToasterToast[];
}

interface State {
    error: LaneState;
    status: LaneState;
}

type Action =
    | {
          type: 'ADD_TOAST';
          toast: ToasterToast;
      }
    | {
          type: 'UPDATE_TOAST';
          toast: { id: string } & ToastUpdate;
      }
    | {
          type: 'DISMISS_TOAST';
          toastId?: string;
      };

const emptyLane = (): LaneState => ({ visible: null, queue: [] });

const laneFor = (variant: ToastProps['variant']): ToastLane =>
    variant === 'danger' || variant === 'destructive' ? 'error' : 'status';

const defaultDuration = (variant: ToastProps['variant']): number => {
    switch (variant) {
        case 'success':
            return SEMANTIC_TOAST_DURATION_MS.success;
        case 'warning':
            return SEMANTIC_TOAST_DURATION_MS.warning;
        case 'danger':
        case 'destructive':
            return SEMANTIC_TOAST_DURATION_MS.danger;
        case 'info':
        case 'default':
        default:
            return SEMANTIC_TOAST_DURATION_MS.info;
    }
};

let count = 0;

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

const findDedupe = (
    lane: LaneState,
    dedupeKey: string
): {
    place: 'visible' | 'queue';
    index: number;
    toast: ToasterToast;
} | null => {
    if (lane.visible?.dedupeKey === dedupeKey) {
        return { place: 'visible', index: -1, toast: lane.visible };
    }

    const index = lane.queue.findIndex((item) => item.dedupeKey === dedupeKey);
    if (index === -1) {
        return null;
    }

    return { place: 'queue', index, toast: lane.queue[index] };
};

const locate = (
    state: State,
    toastId: string
): {
    lane: ToastLane;
    place: 'visible' | 'queue';
    index: number;
    toast: ToasterToast;
} | null => {
    for (const lane of ['error', 'status'] as const) {
        if (state[lane].visible?.id === toastId) {
            return {
                lane,
                place: 'visible',
                index: -1,
                toast: state[lane].visible,
            };
        }

        const index = state[lane].queue.findIndex(
            (item) => item.id === toastId
        );
        if (index !== -1) {
            return {
                lane,
                place: 'queue',
                index,
                toast: state[lane].queue[index],
            };
        }
    }

    return null;
};

const writeInPlace = (
    state: State,
    lane: ToastLane,
    place: 'visible' | 'queue',
    index: number,
    toast: ToasterToast
): State => {
    const current = state[lane];
    if (place === 'visible') {
        return {
            ...state,
            [lane]: { ...current, visible: toast },
        };
    }

    const queue = current.queue.slice();
    queue[index] = toast;
    return {
        ...state,
        [lane]: { ...current, queue },
    };
};

const removeFromLane = (lane: LaneState, toastId: string): LaneState => {
    if (lane.visible?.id === toastId) {
        const [next, ...queue] = lane.queue;
        return { visible: next ?? null, queue };
    }

    return {
        visible: lane.visible,
        queue: lane.queue.filter((item) => item.id !== toastId),
    };
};

const addToLane = (lane: LaneState, toast: ToasterToast): LaneState => {
    if (lane.visible === null) {
        return { visible: toast, queue: lane.queue };
    }

    return { visible: lane.visible, queue: [...lane.queue, toast] };
};

const mergeToast = (
    current: ToasterToast,
    patch: { id: string } & ToastUpdate
): ToasterToast => {
    const next: ToasterToast = { ...current, id: current.id };

    for (const key of Object.keys(patch) as Array<keyof typeof patch>) {
        if (key === 'id') {
            continue;
        }
        const value = patch[key];
        if (value !== undefined) {
            Object.assign(next, { [key]: value });
        }
    }

    next.onOpenChange = current.onOpenChange;
    next.revision = current.revision + 1;
    next.open = true;
    next.lane = laneFor(next.variant);
    return next;
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_TOAST': {
            const lane = action.toast.lane;
            return {
                ...state,
                [lane]: addToLane(state[lane], action.toast),
            };
        }

        case 'UPDATE_TOAST': {
            const located = locate(state, action.toast.id);
            if (located === null) {
                return state;
            }

            const merged = mergeToast(located.toast, action.toast);
            if (merged.lane === located.lane) {
                return writeInPlace(
                    state,
                    located.lane,
                    located.place,
                    located.index,
                    merged
                );
            }

            const without = removeFromLane(
                state[located.lane],
                located.toast.id
            );
            return {
                ...state,
                [located.lane]: without,
                [merged.lane]: addToLane(state[merged.lane], merged),
            };
        }

        case 'DISMISS_TOAST': {
            if (action.toastId === undefined) {
                return { error: emptyLane(), status: emptyLane() };
            }

            return {
                error: removeFromLane(state.error, action.toastId),
                status: removeFromLane(state.status, action.toastId),
            };
        }
    }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { error: emptyLane(), status: emptyLane() };

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}

export function dismiss(toastId?: string) {
    dispatch({ type: 'DISMISS_TOAST', toastId });
}

export interface ToastHandle {
    id: string;
    dismiss: () => void;
    update: (props: ToastUpdate) => void;
}

function createHandle(id: string): ToastHandle {
    return {
        id,
        dismiss: () => dismiss(id),
        update: (props) =>
            dispatch({
                type: 'UPDATE_TOAST',
                toast: { ...props, id },
            }),
    };
}

function toast(props: ToastOptions): ToastHandle {
    const variant = props.variant ?? 'default';
    const lane = laneFor(variant);
    const duration = props.duration ?? defaultDuration(variant);
    const dedupeKey = props.dedupeKey;

    if (dedupeKey !== undefined && dedupeKey !== '') {
        const existing = findDedupe(memoryState[lane], dedupeKey);
        if (existing) {
            const handle = createHandle(existing.toast.id);
            dispatch({
                type: 'UPDATE_TOAST',
                toast: {
                    ...props,
                    id: existing.toast.id,
                    variant,
                    duration,
                    dedupeKey,
                },
            });
            return handle;
        }
    }

    const id = genId();
    const handle = createHandle(id);

    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            lane,
            variant,
            duration,
            dedupeKey,
            revision: 0,
            open: true,
            onOpenChange: (open) => {
                if (!open) {
                    dismiss(id);
                }
            },
        },
    });

    return handle;
}

export function visibleToasts(state: State): ToasterToast[] {
    const toasts: ToasterToast[] = [];
    if (state.status.visible) {
        toasts.push(state.status.visible);
    }
    if (state.error.visible) {
        toasts.push(state.error.visible);
    }
    return toasts;
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);

    return {
        toasts: visibleToasts(state),
        toast,
        dismiss,
    };
}

export { useToast, toast };
export type { ToasterToast };
