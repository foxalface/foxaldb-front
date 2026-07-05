import { describe, expect, it } from 'vitest';
import {
    initialRemoteSelectionsState,
    selectionReducer,
} from '../selection-reducer';
import {
    areSelectionSnapshotsEqual,
    buildSelectionSnapshotFromFlowSelection,
    buildSelectionsByEntity,
    toEntityKey,
} from '../selection-utils';

describe('selection-utils', () => {
    describe('areSelectionSnapshotsEqual', () => {
        it('compares selection snapshots regardless of order', () => {
            expect(
                areSelectionSnapshotsEqual(
                    [
                        { entityType: 'table', entityId: 'b' },
                        { entityType: 'table', entityId: 'a' },
                    ],
                    [
                        { entityType: 'table', entityId: 'a' },
                        { entityType: 'table', entityId: 'b' },
                    ]
                )
            ).toBe(true);
        });

        it('returns false when snapshots differ', () => {
            expect(
                areSelectionSnapshotsEqual(
                    [{ entityType: 'table', entityId: 'a' }],
                    [{ entityType: 'relationship', entityId: 'a' }]
                )
            ).toBe(false);
        });
    });

    describe('buildSelectionSnapshotFromFlowSelection', () => {
        it('includes only selected table nodes and relationship edges', () => {
            const snapshot = buildSelectionSnapshotFromFlowSelection({
                selectedNodeIds: ['table-1', 'note-1'],
                selectedEdgeIds: ['rel-1', 'dep-1'],
                tableNodeIds: new Set(['table-1']),
                relationshipEdgeIds: new Set(['rel-1']),
            });

            expect(snapshot).toEqual([
                { entityType: 'relationship', entityId: 'rel-1' },
                { entityType: 'table', entityId: 'table-1' },
            ]);
        });
    });

    describe('buildSelectionsByEntity', () => {
        it('derives an entity map with multiple collaborators on the same entity', () => {
            let state = selectionReducer(initialRemoteSelectionsState(), {
                type: 'UPDATE',
                userId: 2,
                selections: [{ entityType: 'table', entityId: 'table-1' }],
                receivedAt: 1_000,
            });
            state = selectionReducer(state, {
                type: 'UPDATE',
                userId: 3,
                selections: [{ entityType: 'table', entityId: 'table-1' }],
                receivedAt: 1_000,
            });

            const byEntity = buildSelectionsByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([
                    [2, { name: 'Bob' }],
                    [3, { name: 'Alice' }],
                ]),
                knownPresenceUserIds: new Set([2, 3]),
            });

            const collaborators = byEntity.get(toEntityKey('table', 'table-1'));

            expect(collaborators?.map((item) => item.userId)).toEqual([3, 2]);
            expect(collaborators?.every((item) => !item.isSelf)).toBe(true);
        });

        it('filters self and unknown presence users', () => {
            let state = selectionReducer(initialRemoteSelectionsState(), {
                type: 'UPDATE',
                userId: 1,
                selections: [{ entityType: 'table', entityId: 'table-self' }],
                receivedAt: 1_000,
            });
            state = selectionReducer(state, {
                type: 'UPDATE',
                userId: 99,
                selections: [
                    { entityType: 'table', entityId: 'table-unknown' },
                ],
                receivedAt: 1_000,
            });

            const byEntity = buildSelectionsByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[1, { name: 'Me' }]]),
                knownPresenceUserIds: new Set([1]),
            });

            expect(byEntity.size).toBe(0);
        });

        it('clears entities when a user sends an empty selection snapshot', () => {
            let state = selectionReducer(initialRemoteSelectionsState(), {
                type: 'UPDATE',
                userId: 2,
                selections: [{ entityType: 'table', entityId: 'table-1' }],
                receivedAt: 1_000,
            });
            state = selectionReducer(state, {
                type: 'UPDATE',
                userId: 2,
                selections: [],
                receivedAt: 2_000,
            });

            const byEntity = buildSelectionsByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[2, { name: 'Bob' }]]),
                knownPresenceUserIds: new Set([2]),
            });

            expect(byEntity.size).toBe(0);
        });

        it('supports multi-selection per user', () => {
            const state = selectionReducer(initialRemoteSelectionsState(), {
                type: 'UPDATE',
                userId: 2,
                selections: [
                    { entityType: 'table', entityId: 'table-1' },
                    { entityType: 'relationship', entityId: 'rel-1' },
                ],
                receivedAt: 1_000,
            });

            const byEntity = buildSelectionsByEntity(state, {
                selfUserId: 1,
                presenceMembers: new Map([[2, { name: 'Bob' }]]),
                knownPresenceUserIds: new Set([2]),
            });

            expect(byEntity.get(toEntityKey('table', 'table-1'))).toHaveLength(
                1
            );
            expect(
                byEntity.get(toEntityKey('relationship', 'rel-1'))
            ).toHaveLength(1);
        });
    });
});
