import { createContext } from 'react';
import type { DiagramEditingBroadcast } from '@/pages/editor-page/use-diagram-editing-broadcast';

// Shared editing-awareness broadcaster for the editor. A single controller is
// mounted once (see editing-broadcast-provider.tsx) so distant edit surfaces
// (canvas + side panel) emit into one snapshot rather than clobbering each
// other's full-snapshot whispers.
export type EditingBroadcastContextValue = DiagramEditingBroadcast;

export const EditingBroadcastContext =
    createContext<EditingBroadcastContextValue | null>(null);
