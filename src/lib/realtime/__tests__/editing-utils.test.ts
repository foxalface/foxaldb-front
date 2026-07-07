import { describe, expect, it } from 'vitest';
import { editingReducer, initialRemoteEditingState } from '../editing-reducer';
import {
    areEditingSnapshotsEqual,
    buildEditingByEntity,
    shouldRemoveStaleEditing,
    toEditingEntityKey,
    REMOTE_EDITING_STALE_MS,
} from '../editing-utils';

describe('editing-utils', () => {
    describe('toEditingEntityKey', () => {
        it('builds keys for each entity type', () => {
            expect(toEditingEntityKey('table', 'table-1')).toBe(
                'table:table-1'
            );
            expect(toEditingEntityKey('field', 'field-1')).toBe(
                'field:field-1'
            );
            expect(toEditingEntityKey('relationship', 'rel-1')).toBe(
                'relationship:rel-1'
            );
        });
    });

    describe('shouldRemoveStaleEditing', () => {
        it('uses a 2000ms timeout by default', () => {
            expect(REMOTE_EDITING_STALE_MS).toBe(2000);
            expect(shouldRemoveStaleEditing(1_000, 2_999)).toBe(false);
            expect(shouldRemoveStaleEditing(1_000, 3_000)).toBe(true);
        });
    });

    describe('areEditingSnapshotsEqual', () => {
        it('compares editing snapshots regardless of order', () => {
            expect(
                areEditingSnapshotsEqual(
                    [
                        { entityType: 'field', entityId: 'b' },
                        { entityType: 'field', entityId: 'a' },
                    ],
                    [
                        { entityType: 'field', entityId: 'a' },
                        { entityType: 'field', entityId: 'b' },
                    ]
                )
            ).toBe(true);
        });

        it('returns false when snapshots differ', () => {
            expect(
                areEditingSnapshotsEqual(
                    [{ entityType: 'table', entityId: 'a' }],
                    [{ entityType: 'field', entityId: 'a' }]
                )
            ).toBe(false);
        });
    });

    describe('buildEditingByEntity', () => {
        it('derives an entity map with multiple collaborators on the same entity', () => {
            let state = editingReducer(initialRemoteEditingState(), {
                type: 'UPDATE',
                userId: 2,
                edits: [{ entityType: 'field', entityId: 'field-1' }],
                receivedAt: 1_000,
            });
            state = editingReducer(state, {
                type: 'UPDATE',
                userId: 3,
                edits: [{ entityType: 'field', entityId: 'field-1' }],
                receivedAt: 1_000,
            });

            const byEntity = buildEditingByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([
                    [2, { name: 'Bob' }],
                    [3, { name: 'Alice' }],
                ]),
                knownPresenceUserIds: new Set([2, 3]),
            });

            const collaborators = byEntity.get(
                toEditingEntityKey('field', 'field-1')
            );

            expect(collaborators?.map((item) => item.userId)).toEqual([3, 2]);
            expect(collaborators?.every((item) => !item.isSelf)).toBe(true);
        });

        it('filters self and unknown presence users', () => {
            let state = editingReducer(initialRemoteEditingState(), {
                type: 'UPDATE',
                userId: 1,
                edits: [{ entityType: 'field', entityId: 'field-self' }],
                receivedAt: 1_000,
            });
            state = editingReducer(state, {
                type: 'UPDATE',
                userId: 99,
                edits: [{ entityType: 'field', entityId: 'field-unknown' }],
                receivedAt: 1_000,
            });

            const byEntity = buildEditingByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[1, { name: 'Me' }]]),
                knownPresenceUserIds: new Set([1]),
            });

            expect(byEntity.size).toBe(0);
        });

        it('clears entities when a user sends an empty editing snapshot', () => {
            let state = editingReducer(initialRemoteEditingState(), {
                type: 'UPDATE',
                userId: 2,
                edits: [{ entityType: 'field', entityId: 'field-1' }],
                receivedAt: 1_000,
            });
            state = editingReducer(state, {
                type: 'UPDATE',
                userId: 2,
                edits: [],
                receivedAt: 2_000,
            });

            const byEntity = buildEditingByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[2, { name: 'Bob' }]]),
                knownPresenceUserIds: new Set([2]),
            });

            expect(byEntity.size).toBe(0);
        });

        it('supports multiple edits per user across entity types', () => {
            const state = editingReducer(initialRemoteEditingState(), {
                type: 'UPDATE',
                userId: 2,
                edits: [
                    { entityType: 'table', entityId: 'table-1' },
                    { entityType: 'field', entityId: 'field-1' },
                    { entityType: 'relationship', entityId: 'rel-1' },
                ],
                receivedAt: 1_000,
            });

            const byEntity = buildEditingByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[2, { name: 'Bob' }]]),
                knownPresenceUserIds: new Set([2]),
            });

            expect(
                byEntity.get(toEditingEntityKey('table', 'table-1'))
            ).toHaveLength(1);
            expect(
                byEntity.get(toEditingEntityKey('field', 'field-1'))
            ).toHaveLength(1);
            expect(
                byEntity.get(toEditingEntityKey('relationship', 'rel-1'))
            ).toHaveLength(1);
        });

        it('filters stale editing entries when now is provided', () => {
            const state = editingReducer(initialRemoteEditingState(), {
                type: 'UPDATE',
                userId: 2,
                edits: [{ entityType: 'field', entityId: 'field-1' }],
                receivedAt: 1_000,
            });

            const byEntity = buildEditingByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[2, { name: 'Bob' }]]),
                knownPresenceUserIds: new Set([2]),
                now: 1_000 + REMOTE_EDITING_STALE_MS,
            });

            expect(byEntity.size).toBe(0);
        });
    });
});
