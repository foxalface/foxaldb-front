import { useContext } from 'react';
import {
    EditingBroadcastContext,
    type EditingBroadcastContextValue,
} from '@/context/editing-broadcast-context/editing-broadcast-context';
import { emptyFn } from '@/lib/utils';

const NOOP_EDITING_BROADCAST: EditingBroadcastContextValue = {
    startEditing: emptyFn,
    updateEditing: emptyFn,
    stopEditing: emptyFn,
};

/**
 * Access the shared editing-awareness broadcaster. Returns no-op helpers when
 * rendered outside an EditingBroadcastProvider (e.g. guest mode) so edit
 * surfaces can call it unconditionally without breaking local UX.
 */
export const useEditingBroadcast = (): EditingBroadcastContextValue => {
    const context = useContext(EditingBroadcastContext);

    return context ?? NOOP_EDITING_BROADCAST;
};
