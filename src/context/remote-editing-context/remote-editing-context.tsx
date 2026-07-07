import { createContext } from 'react';
import type { EditingByEntity } from '@/lib/realtime/editing-utils';

// Shared remote editing-awareness state for the editor. A single reducer +
// transport subscription lives behind this context (see
// remote-editing-provider.tsx) so table nodes, field rows and relationship
// rows can read editing awareness without spinning up independent reducers or
// subscriptions per node/field.
export interface RemoteEditingContextValue {
    isEditingActive: boolean;
    editingByEntity: EditingByEntity;
}

export const RemoteEditingContext =
    createContext<RemoteEditingContextValue | null>(null);
