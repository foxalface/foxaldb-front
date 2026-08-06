import { describe, expect, it } from 'vitest';
import { resolveConversationSummaryDisplayText } from '@/lib/conversations/conversation-summary-body';

describe('resolveConversationSummaryDisplayText', () => {
    it('returns the full last message body', () => {
        expect(
            resolveConversationSummaryDisplayText(
                'Full body text',
                'No messages yet'
            )
        ).toBe('Full body text');
    });

    it('collapses whitespace for display', () => {
        expect(
            resolveConversationSummaryDisplayText(
                'Line one\n\nLine two',
                'No messages yet'
            )
        ).toBe('Line one Line two');
    });

    it('uses the empty fallback when there is no message text', () => {
        expect(
            resolveConversationSummaryDisplayText(null, 'No messages yet')
        ).toBe('No messages yet');
        expect(
            resolveConversationSummaryDisplayText('   ', 'No messages yet')
        ).toBe('No messages yet');
    });
});
