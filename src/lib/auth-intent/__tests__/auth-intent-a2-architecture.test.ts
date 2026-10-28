/**
 * A2 auth intent architecture notes for A3 continuation work.
 */
import { describe, expect, it } from 'vitest';

describe('auth intent A2 architecture', () => {
    it('documents the single post-auth consumption owner', () => {
        expect(
            'AuthIntentProvider consumes pending intent once on guest → authenticated transition and exposes lastConsumedIntent for A3.'
        ).toContain('lastConsumedIntent');
    });

    it('documents that A3 replaced automatic guest migration', () => {
        const removed = [
            'AUTHENTICATION_SUCCEEDED no longer enters checkingGuestMigration',
            'GUEST_SESSION_AUTHENTICATED removed',
            'useAuthIntentContinuation is the continuation owner',
        ];

        expect(removed).toHaveLength(3);
    });

    it('documents intended A3 continuations without executing them in A2', () => {
        const continuations = {
            'open-online-tab':
                'select Online tab in open diagram / remote list',
            'open-online-diagram': 'open requested backend diagram id',
            'put-online':
                'run copy/move without retargeting current DEVICE location first',
            'protected-action': 'resume share / export / import / merge action',
        };

        expect(Object.keys(continuations)).toEqual([
            'open-online-tab',
            'open-online-diagram',
            'put-online',
            'protected-action',
        ]);
    });
});
