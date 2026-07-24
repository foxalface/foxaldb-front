import React from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiscussionScrollIntent } from '@/lib/comments/discussion-scroll';
import { useDiscussionScroll } from '../use-discussion-scroll';

type ScrollHookProps = Parameters<typeof useDiscussionScroll>[0];

const comment = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

const intent = (
    overrides: Partial<DiscussionScrollIntent> &
        Pick<DiscussionScrollIntent, 'targetCommentId' | 'generation'>
): DiscussionScrollIntent => ({
    reason: 'local-create',
    ...overrides,
});

const mountScrollHarness = (args: ScrollHookProps) => {
    const scrollIntoView = vi.fn();

    const Harness: React.FC = () => {
        const { scrollAreaRef, setCommentItemRef } = useDiscussionScroll(args);

        return (
            <div ref={scrollAreaRef} data-testid="scroll-root">
                <div
                    data-radix-scroll-area-viewport=""
                    data-testid="viewport"
                    style={{ height: 100, overflow: 'auto' }}
                >
                    <ul>
                        {args.comments.map((item) => (
                            <li
                                key={item.id}
                                ref={(el) => {
                                    if (el) {
                                        el.scrollIntoView = scrollIntoView;
                                        setCommentItemRef(item.id, el);
                                    } else {
                                        setCommentItemRef(item.id, null);
                                    }
                                }}
                                data-comment-id={item.id}
                            >
                                {item.body}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const view = render(<Harness />);
    return { ...view, scrollIntoView };
};

const attachNode = (
    setCommentItemRef: (id: number, node: HTMLElement | null) => void,
    id: number
) => {
    const node = document.createElement('li');
    const scrollIntoView = vi.fn();
    node.scrollIntoView = scrollIntoView;
    setCommentItemRef(id, node);
    return { node, scrollIntoView };
};

describe('useDiscussionScroll', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('scrolls to the latest comment when opening a target scope', async () => {
        const { scrollIntoView } = mountScrollHarness({
            scopeKey: 'target:table:t1',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalled();
        });
        expect(scrollIntoView).toHaveBeenCalledWith(
            expect.objectContaining({
                behavior: 'auto',
                block: 'end',
            })
        );
    });

    it('scrolls to the latest comment when opening diagram scope', async () => {
        const { scrollIntoView } = mountScrollHarness({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'auto',
                    block: 'end',
                })
            );
        });
    });

    it('does not scroll to latest when opening all discussions', async () => {
        const { scrollIntoView } = mountScrollHarness({
            scopeKey: 'all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('smooth-scrolls to a local-create intent target id', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        act(() => {
            attachNode(result.current.setCommentItemRef, 1);
            attachNode(result.current.setCommentItemRef, 2);
        });

        const created = attachNode(result.current.setCommentItemRef, 3);

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
            ],
            scrollIntent: intent({ targetCommentId: 3, generation: 1 }),
        });

        await waitFor(() => {
            expect(created.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('scrolls again when the same target id arrives with a newer generation', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { scrollIntoView } = attachNode(
            result.current.setCommentItemRef,
            1
        );

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 })],
            scrollIntent: intent({ targetCommentId: 1, generation: 1 }),
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        });
        scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 })],
            scrollIntent: intent({ targetCommentId: 1, generation: 2 }),
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        });
    });

    it('executes the same generation only once', async () => {
        const sharedIntent = intent({ targetCommentId: 1, generation: 1 });
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { scrollIntoView } = attachNode(
            result.current.setCommentItemRef,
            1
        );

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 })],
            scrollIntent: sharedIntent,
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        });
        scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1, body: 'updated body' })],
            scrollIntent: sharedIntent,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('does not double-scroll when the layout effect runs twice for one generation', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { scrollIntoView } = attachNode(
            result.current.setCommentItemRef,
            1
        );

        const shared = intent({ targetCommentId: 1, generation: 7 });

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 })],
            scrollIntent: shared,
        });

        // Simulate Strict Mode double invocation by re-rendering with the
        // same props (same generation) after consumption.
        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 })],
            scrollIntent: shared,
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        });
    });

    it('flushes a local-create intent after the item ref attaches later', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: intent({ targetCommentId: 2, generation: 1 }),
        });

        const { scrollIntoView } = attachNode(
            result.current.setCommentItemRef,
            2
        );

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('invalidates an old intent when the discussion scope changes', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'target:table:t1',
                    scrollToLatestOnOpen: true,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: intent({
                        targetCommentId: 2,
                        generation: 1,
                    }),
                } as ScrollHookProps,
            }
        );

        const firstLatest = attachNode(result.current.setCommentItemRef, 2);
        await waitFor(() => {
            expect(firstLatest.scrollIntoView).toHaveBeenCalled();
        });
        firstLatest.scrollIntoView.mockClear();

        act(() => {
            result.current.setCommentItemRef(2, null);
        });

        const secondLatest = attachNode(result.current.setCommentItemRef, 9);

        rerender({
            scopeKey: 'target:table:t2',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 8 }), comment({ id: 9 })],
            // Stale intent from previous scope with a newer generation.
            scrollIntent: intent({ targetCommentId: 2, generation: 2 }),
        });

        await waitFor(() => {
            expect(secondLatest.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'auto',
                    block: 'end',
                })
            );
        });
        expect(firstLatest.scrollIntoView).not.toHaveBeenCalled();
    });

    it('auto-scrolls for realtime appends when near the bottom', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const root = document.createElement('div');
        const viewport = document.createElement('div');
        viewport.setAttribute('data-radix-scroll-area-viewport', '');
        Object.defineProperties(viewport, {
            scrollHeight: { value: 1000, configurable: true },
            scrollTop: { value: 900, configurable: true },
            clientHeight: { value: 100, configurable: true },
        });
        root.appendChild(viewport);

        act(() => {
            result.current.scrollAreaRef(root);
        });

        const incoming = attachNode(result.current.setCommentItemRef, 2);

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(incoming.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('does not force-scroll realtime appends when scrolled away', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const root = document.createElement('div');
        const viewport = document.createElement('div');
        viewport.setAttribute('data-radix-scroll-area-viewport', '');
        Object.defineProperties(viewport, {
            scrollHeight: { value: 1000, configurable: true },
            scrollTop: { value: 50, configurable: true },
            clientHeight: { value: 100, configurable: true },
        });
        root.appendChild(viewport);

        act(() => {
            result.current.scrollAreaRef(root);
        });

        viewport.dispatchEvent(new Event('scroll'));

        const incoming = attachNode(result.current.setCommentItemRef, 2);

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(incoming.scrollIntoView).not.toHaveBeenCalled();
    });

    it('anchors to the next neighbor when deleting the first comment', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [
                        comment({ id: 1 }),
                        comment({ id: 2 }),
                        comment({ id: 3 }),
                    ],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const next = attachNode(result.current.setCommentItemRef, 2);
        const last = attachNode(result.current.setCommentItemRef, 3);
        next.scrollIntoView.mockClear();
        last.scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 2 }), comment({ id: 3 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(next.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'auto',
                    block: 'nearest',
                })
            );
        });
        expect(last.scrollIntoView).not.toHaveBeenCalled();
    });

    it('anchors to the previous neighbor when deleting a middle comment', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [
                        comment({ id: 1 }),
                        comment({ id: 2 }),
                        comment({ id: 3 }),
                    ],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const prev = attachNode(result.current.setCommentItemRef, 1);
        const last = attachNode(result.current.setCommentItemRef, 3);
        prev.scrollIntoView.mockClear();
        last.scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 3 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(prev.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'auto',
                    block: 'nearest',
                })
            );
        });
        expect(last.scrollIntoView).not.toHaveBeenCalled();
    });

    it('anchors to the previous neighbor when deleting the last comment', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [
                        comment({ id: 1 }),
                        comment({ id: 2 }),
                        comment({ id: 3 }),
                    ],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const prev = attachNode(result.current.setCommentItemRef, 2);
        prev.scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(prev.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'auto',
                    block: 'nearest',
                })
            );
        });
    });

    it('does not scroll when deleting the only visible comment', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const only = attachNode(result.current.setCommentItemRef, 1);
        only.scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(only.scrollIntoView).not.toHaveBeenCalled();
    });

    it('does not jump to the bottom when only comment bodies change', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const first = attachNode(result.current.setCommentItemRef, 1);
        const last = attachNode(result.current.setCommentItemRef, 2);
        first.scrollIntoView.mockClear();
        last.scrollIntoView.mockClear();

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2, body: 'edited body' }),
            ],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(first.scrollIntoView).not.toHaveBeenCalled();
        expect(last.scrollIntoView).not.toHaveBeenCalled();
    });

    it('does not steal focus while scrolling', async () => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        expect(document.activeElement).toBe(textarea);

        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { node, scrollIntoView } = attachNode(
            result.current.setCommentItemRef,
            1
        );
        const focusSpy = vi.spyOn(node, 'focus');

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 })],
            scrollIntent: intent({ targetCommentId: 1, generation: 1 }),
        });

        await waitFor(() => {
            expect(scrollIntoView).toHaveBeenCalled();
        });

        expect(focusSpy).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(textarea);

        document.body.removeChild(textarea);
    });

    it('clears pending scroll work on unmount', async () => {
        const { result, unmount, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: intent({ targetCommentId: 2, generation: 1 }),
        });

        unmount();

        const node = document.createElement('li');
        const scrollIntoView = vi.fn();
        node.scrollIntoView = scrollIntoView;

        act(() => {
            result.current.setCommentItemRef(2, node);
        });

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('removes the passive scroll listener on cleanup', () => {
        const { result, unmount, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: 'diagram',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const root = document.createElement('div');
        const viewport = document.createElement('div');
        viewport.setAttribute('data-radix-scroll-area-viewport', '');
        Object.defineProperties(viewport, {
            scrollHeight: { value: 1000, configurable: true },
            scrollTop: { value: 900, configurable: true },
            clientHeight: { value: 100, configurable: true },
        });
        root.appendChild(viewport);
        const removeSpy = vi.spyOn(viewport, 'removeEventListener');

        act(() => {
            result.current.scrollAreaRef(root);
        });

        // Rebind listener by changing comments.length.
        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        unmount();

        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
});
