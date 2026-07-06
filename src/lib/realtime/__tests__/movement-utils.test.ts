import { describe, expect, it } from 'vitest';
import { initialRemoteMovementsState } from '../movement-reducer';
import {
    advanceInterpolatedPositions,
    applyMovementAction,
    buildRemoteMovementTargets,
    buildRenderOverridePositions,
    findSyncedPendingTableIds,
    freezeMovementEndPositions,
    mergeRemoteTablePositionsIntoNodes,
    positionsMatchWithinEpsilon,
    removeStalePendingSyncOverrides,
    shouldRemoveStaleMovement,
} from '../movement-utils';

describe('movement-utils', () => {
    describe('applyMovementAction', () => {
        it('passes through reducer actions unchanged', () => {
            const state = applyMovementAction(initialRemoteMovementsState(), {
                type: 'UPDATE',
                userId: 2,
                phase: 'move',
                tables: [{ id: 'table-1', x: 10, y: 20 }],
                receivedAt: 1_000,
            });

            expect(state.get(2)).toEqual({
                phase: 'move',
                tables: [{ id: 'table-1', x: 10, y: 20 }],
                receivedAt: 1_000,
            });
        });
    });

    describe('freezeMovementEndPositions', () => {
        it('freezes end positions for authoritative sync handoff', () => {
            const pending = freezeMovementEndPositions(new Map(), {
                userId: 2,
                tables: [{ id: 'table-1', x: 30, y: 40 }],
                frozenAt: 2_000,
            });

            expect(pending.get('table-1')).toEqual({
                x: 30,
                y: 40,
                userId: 2,
                frozenAt: 2_000,
            });
        });
    });

    describe('findSyncedPendingTableIds', () => {
        it('detects when authoritative node position matches frozen override', () => {
            const pending = freezeMovementEndPositions(new Map(), {
                userId: 2,
                tables: [{ id: 'table-1', x: 30, y: 40 }],
                frozenAt: 2_000,
            });

            const synced = findSyncedPendingTableIds(
                [
                    {
                        id: 'table-1',
                        type: 'table',
                        position: { x: 30, y: 40 },
                    },
                ],
                pending
            );

            expect(synced).toEqual(['table-1']);
        });

        it('keeps pending override while authoritative position differs', () => {
            const pending = freezeMovementEndPositions(new Map(), {
                userId: 2,
                tables: [{ id: 'table-1', x: 30, y: 40 }],
                frozenAt: 2_000,
            });

            const synced = findSyncedPendingTableIds(
                [
                    {
                        id: 'table-1',
                        type: 'table',
                        position: { x: 0, y: 0 },
                    },
                ],
                pending
            );

            expect(synced).toEqual([]);
        });
    });

    describe('buildRenderOverridePositions', () => {
        it('includes frozen pending sync positions after active movement ends', () => {
            const overrides = buildRenderOverridePositions(
                new Map(),
                freezeMovementEndPositions(new Map(), {
                    userId: 2,
                    tables: [{ id: 'table-1', x: 30, y: 40 }],
                    frozenAt: 2_000,
                })
            );

            expect(overrides.get('table-1')).toEqual({
                x: 30,
                y: 40,
                userId: 2,
            });
        });
    });

    describe('positionsMatchWithinEpsilon', () => {
        it('treats nearby positions as synced', () => {
            expect(
                positionsMatchWithinEpsilon(
                    { x: 10, y: 20 },
                    { x: 10.2, y: 20.2 }
                )
            ).toBe(true);
        });
    });

    describe('removeStalePendingSyncOverrides', () => {
        it('drops pending overrides after the safety timeout', () => {
            const pending = freezeMovementEndPositions(new Map(), {
                userId: 2,
                tables: [{ id: 'table-1', x: 30, y: 40 }],
                frozenAt: 1_000,
            });

            const next = removeStalePendingSyncOverrides(pending, 7_000, 5_000);

            expect(next.size).toBe(0);
        });
    });

    describe('shouldRemoveStaleMovement', () => {
        it('returns true after the stale timeout', () => {
            expect(shouldRemoveStaleMovement(1_000, 3_100, 2_000)).toBe(true);
        });

        it('returns false before the stale timeout', () => {
            expect(shouldRemoveStaleMovement(1_000, 2_500, 2_000)).toBe(false);
        });
    });

    describe('buildRemoteMovementTargets', () => {
        it('ignores self movement and unknown presence users', () => {
            const state = applyMovementAction(initialRemoteMovementsState(), {
                type: 'UPDATE',
                userId: 1,
                phase: 'move',
                tables: [{ id: 'table-self', x: 1, y: 2 }],
                receivedAt: 1_000,
            });

            const withRemote = applyMovementAction(state, {
                type: 'UPDATE',
                userId: 2,
                phase: 'move',
                tables: [{ id: 'table-remote', x: 10, y: 20 }],
                receivedAt: 1_000,
            });

            const targets = buildRemoteMovementTargets(withRemote, {
                selfUserId: 1,
                knownPresenceUserIds: new Set([2]),
                now: 1_500,
            });

            expect(targets.size).toBe(1);
            expect(targets.get('table-remote')).toEqual({
                x: 10,
                y: 20,
                userId: 2,
            });
        });
    });

    describe('advanceInterpolatedPositions', () => {
        it('moves display positions toward targets', () => {
            const display = new Map([['table-1', { x: 0, y: 0 }]]);
            const targets = new Map([['table-1', { x: 100, y: 100 }]]);

            const changed = advanceInterpolatedPositions(display, targets);

            expect(changed).toBe(true);
            expect(display.get('table-1')?.x).toBeGreaterThan(0);
            expect(display.get('table-1')?.y).toBeGreaterThan(0);
        });

        it('removes display entries when targets disappear', () => {
            const display = new Map([['table-1', { x: 10, y: 20 }]]);

            const changed = advanceInterpolatedPositions(display, new Map());

            expect(changed).toBe(true);
            expect(display.size).toBe(0);
        });
    });

    describe('mergeRemoteTablePositionsIntoNodes', () => {
        const nodes = [
            {
                id: 'table-1',
                type: 'table',
                position: { x: 0, y: 0 },
            },
            {
                id: 'table-2',
                type: 'table',
                position: { x: 5, y: 5 },
            },
        ] as const;

        it('overrides remote table positions at render time', () => {
            const remotePositions = new Map([['table-1', { x: 50, y: 60 }]]);

            const merged = mergeRemoteTablePositionsIntoNodes(
                nodes,
                remotePositions,
                new Set()
            );

            expect(merged[0]?.position).toEqual({ x: 50, y: 60 });
            expect(merged[1]?.position).toEqual({ x: 5, y: 5 });
        });

        it('does not override tables currently dragged locally', () => {
            const remotePositions = new Map([['table-1', { x: 50, y: 60 }]]);

            const merged = mergeRemoteTablePositionsIntoNodes(
                nodes,
                remotePositions,
                new Set(['table-1'])
            );

            expect(merged[0]?.position).toEqual({ x: 0, y: 0 });
        });
    });
});
