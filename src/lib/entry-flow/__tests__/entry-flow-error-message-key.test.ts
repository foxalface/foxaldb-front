import { describe, expect, it } from 'vitest';
import { resolveEntryFlowErrorMessageKey } from '../entry-flow-error-message-key';

describe('resolveEntryFlowErrorMessageKey', () => {
    it('returns explicit message keys when provided', () => {
        expect(
            resolveEntryFlowErrorMessageKey({
                kind: 'diagramOpen',
                messageKey: 'custom.key',
            })
        ).toBe('custom.key');
    });

    it('falls back to defaults by error kind', () => {
        expect(resolveEntryFlowErrorMessageKey({ kind: 'diagramOpen' })).toBe(
            'entry_flow.errors.open_diagram_failed'
        );
        expect(
            resolveEntryFlowErrorMessageKey({ kind: 'remoteDiagramLoad' })
        ).toBe('entry_flow.errors.load_remote_failed');
    });
});
