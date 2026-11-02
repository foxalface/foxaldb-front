import { createContext, useContext, type RefObject } from 'react';

export const VisualCompareSceneRefContext =
    createContext<RefObject<HTMLElement | null> | null>(null);

export const VisualCompareRepaintKeyContext = createContext<number>(0);

export function useVisualCompareSceneRef(): RefObject<HTMLElement | null> | null {
    return useContext(VisualCompareSceneRefContext);
}
