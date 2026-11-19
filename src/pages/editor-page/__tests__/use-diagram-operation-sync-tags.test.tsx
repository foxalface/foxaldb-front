import { EventEmitter } from 'ahooks/lib/useEventEmitter';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChartDBEvent } from '@/context/chartdb-context/chartdb-context';
import { remoteSyncDepthRef } from '@/lib/realtime/diagram-sync-state';
import type { DiagramTag } from '@/lib/domain/diagram-tag';

const harness = vi.hoisted(() => ({
    onlineId: '42' as string | null,
    postDiagramOperation: vi.fn(),
}));

const events = new EventEmitter<ChartDBEvent>();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        },
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useOnlineDiagramId: () => harness.onlineId,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ events }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    postDiagramOperation: (...args: unknown[]) =>
        harness.postDiagramOperation(...args),
}));

import { clearPendingDiagramOperationSyncTimers } from '@/lib/realtime/diagram-sync-state';
import { useDiagramOperationSync } from '@/pages/editor-page/use-diagram-operation-sync';

const tag = (id: string): DiagramTag => ({
    id,
    name: 'Backend',
    color: '#8eb7ff',
});

describe('useDiagramOperationSync tags', () => {
    beforeEach(() => {
        harness.onlineId = '42';
        harness.postDiagramOperation.mockReset();
        harness.postDiagramOperation.mockResolvedValue({ message: 'ok' });
        remoteSyncDepthRef.current = 0;
        clearPendingDiagramOperationSyncTimers();
    });

    it('does not post operations for a device diagram', () => {
        harness.onlineId = null;
        renderHook(() => useDiagramOperationSync());

        act(() => {
            events.emit({
                action: 'add_tags',
                data: { tags: [tag('tag-backend')] },
            });
        });

        expect(harness.postDiagramOperation).not.toHaveBeenCalled();
    });

    it('does not post while a remote operation is being applied', () => {
        remoteSyncDepthRef.current = 1;
        renderHook(() => useDiagramOperationSync());

        act(() => {
            events.emit({
                action: 'add_tags',
                data: { tags: [tag('tag-backend')] },
            });
        });

        expect(harness.postDiagramOperation).not.toHaveBeenCalled();
    });

    it('posts update_tag with name and color attributes only', async () => {
        vi.useFakeTimers();
        renderHook(() => useDiagramOperationSync());

        act(() => {
            events.emit({
                action: 'update_tag',
                data: {
                    id: 'tag-backend',
                    tag: { name: 'API', color: '#111111' },
                },
            });
        });

        expect(harness.postDiagramOperation).not.toHaveBeenCalled();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(150);
        });

        expect(harness.postDiagramOperation).toHaveBeenCalledWith('42', {
            action: 'update_tag',
            data: {
                id: 'tag-backend',
                attributes: { name: 'API', color: '#111111' },
            },
            clientId: expect.any(String),
        });
        const body = harness.postDiagramOperation.mock.calls[0]?.[1] as {
            data: Record<string, unknown>;
        };
        expect(body.data).not.toHaveProperty('selectedTagIds');
        expect(body.data).not.toHaveProperty('matchMode');
        vi.useRealTimers();
    });

    it('does not post an empty tag update', async () => {
        vi.useFakeTimers();
        renderHook(() => useDiagramOperationSync());

        act(() => {
            events.emit({
                action: 'update_tag',
                data: { id: 'tag-backend', tag: { name: '   ' } },
            });
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(150);
        });

        expect(harness.postDiagramOperation).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('posts a tag assignment only after the earlier operation settles', async () => {
        let releaseTable: (() => void) | undefined;
        harness.postDiagramOperation.mockImplementation(
            (_diagramId: string, body: { action: string }) => {
                if (body.action === 'add_tags') {
                    return new Promise((resolve) => {
                        releaseTable = () => resolve({ message: 'ok' });
                    });
                }

                return Promise.resolve({ message: 'ok' });
            }
        );

        renderHook(() => useDiagramOperationSync());

        act(() => {
            events.emit({
                action: 'add_tags',
                data: { tags: [tag('tag-backend')] },
            });
            events.emit({
                action: 'add_tag_assignments',
                data: {
                    assignments: [
                        {
                            id: 'as-1',
                            tagId: 'tag-backend',
                            targetType: 'table',
                            targetId: 'table-users',
                        },
                    ],
                },
            });
        });

        expect(harness.postDiagramOperation).toHaveBeenCalledTimes(1);
        expect(harness.postDiagramOperation.mock.calls[0]?.[1]).toMatchObject({
            action: 'add_tags',
        });

        await act(async () => {
            releaseTable?.();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(harness.postDiagramOperation).toHaveBeenCalledTimes(2);
        expect(harness.postDiagramOperation.mock.calls[1]?.[1]).toMatchObject({
            action: 'add_tag_assignments',
        });
    });
});
