import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { resolveConversationMessageMutationError } from '@/lib/conversations/format-conversation-message-mutation-error';

describe('resolveConversationMessageMutationError', () => {
    it('maps a Laravel 422 to validation without returning the prose', () => {
        const error = new ApiError('The body field is required.', 422, {
            message: 'The body field is required.',
            errors: {
                body: ['The body field is required.'],
            },
        });

        expect(resolveConversationMessageMutationError(error)).toEqual({
            key: 'validation',
        });
        expect(
            JSON.stringify(resolveConversationMessageMutationError(error))
        ).not.toContain('The body field is required.');
    });
});
