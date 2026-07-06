import { describe, expect, it } from 'vitest';
import {
    resetCursorSendState,
    trySendCursorUpdate,
} from '../cursor-send-state';

describe('cursor-send-state', () => {
    it('deduplicates cursor sends through shared state', () => {
        resetCursorSendState();
        const sent: Array<{ x: number; y: number }> = [];

        trySendCursorUpdate(
            { x: 10, y: 20 },
            () => {
                sent.push({ x: 10, y: 20 });
            },
            1
        );

        trySendCursorUpdate(
            { x: 10, y: 20 },
            () => {
                sent.push({ x: 10, y: 20 });
            },
            1,
            1_100
        );

        expect(sent).toEqual([{ x: 10, y: 20 }]);
    });
});
