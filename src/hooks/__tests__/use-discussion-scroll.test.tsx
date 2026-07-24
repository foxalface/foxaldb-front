import React from 'react';
import {
    act,
    render,
    renderHook,
    screen,
    waitFor,
} from '@testing-library/react';
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

const createScrollRoot = (options: {
    scrollHeight: number;
    scrollTop: number;
    clientHeight: number;
}) => {
    const root = document.createElement('div');
    const viewport = document.createElement('div');
    viewport.setAttribute('data-radix-scroll-area-viewport', '');
    let scrollTop = options.scrollTop;
    let scrollHeight = options.scrollHeight;
    Object.defineProperties(viewport, {
        scrollHeight: {
            configurable: true,
            get: () => scrollHeight,
            set: (value: number) => {
                scrollHeight = value;
            },
        },
        clientHeight: { value: options.clientHeight, configurable: true },
        scrollTop: {
            configurable: true,
            get: () => scrollTop,
            set: (value: number) => {
                scrollTop = value;
            },
        },
    });
    root.appendChild(viewport);
    return {
        root,
        viewport,
        setScrollHeight: (value: number) => {
            scrollHeight = value;
        },
    };
};

describe('useDiscussionScroll', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('scrolls to the latest comment when opening a target scope', async () => {
        const { scrollIntoView } = mountScrollHarness({
            scopeKey: '42:target:table:t1',
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
            scopeKey: '42:diagram',
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
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('stores and restores All scrollTop when leaving and returning', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
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

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        act(() => {
            viewport.scrollTop = 240;
            viewport.dispatchEvent(new Event('scroll'));
        });
        expect(viewport.scrollTop).toBe(240);

        rerender({
            scopeKey: '42:target:table:t1',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 10 }), comment({ id: 11 })],
            scrollIntent: null,
        });

        const targetLatest = attachNode(result.current.setCommentItemRef, 11);
        await waitFor(() => {
            expect(targetLatest.scrollIntoView).toHaveBeenCalled();
        });

        // Simulate target landing near the bottom of the shared viewport.
        act(() => {
            viewport.scrollTop = 920;
            viewport.dispatchEvent(new Event('scroll'));
        });

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
            ],
            scrollIntent: null,
        });

        expect(viewport.scrollTop).toBe(240);
    });

    it('captures All scrollTop explicitly on scope exit without a prior scroll event', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        // Programmatic position only — no scroll event. Detach while All is
        // still the committed scope (matches CommentsList unmount before
        // layout-effect cleanup when switching to an empty target).
        act(() => {
            viewport.scrollTop = 175;
            result.current.scrollAreaRef(null);
        });

        rerender({
            scopeKey: '42:target:table:empty',
            scrollToLatestOnOpen: true,
            comments: [],
            scrollIntent: null,
        });

        const returned = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(returned.root);
        });

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        expect(returned.viewport.scrollTop).toBe(175);
    });

    it.each([
        ['table', '42:target:table:t-empty'],
        ['field', '42:target:field:f-empty'],
        ['relationship', '42:target:relationship:r-empty'],
        ['diagram', '42:diagram'],
    ] as const)(
        'restores All scrollTop after empty %s scope unbinds the viewport',
        async (_label, emptyScopeKey) => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
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

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
            });

            act(() => {
                viewport.scrollTop = 240;
                viewport.dispatchEvent(new Event('scroll'));
                // Unmount ScrollArea before the scope commit (production order).
                result.current.scrollAreaRef(null);
            });

            rerender({
                scopeKey: emptyScopeKey,
                scrollToLatestOnOpen: true,
                comments: [],
                scrollIntent: null,
            });

            const returned = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(returned.root);
            });

            rerender({
                scopeKey: '42:all',
                scrollToLatestOnOpen: false,
                comments: [
                    comment({ id: 1 }),
                    comment({ id: 2 }),
                    comment({ id: 3 }),
                ],
                scrollIntent: null,
            });

            expect(returned.viewport.scrollTop).toBe(240);
        }
    );

    it('does not follow remote appends after All → empty target → mid-list All restore', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
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

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        act(() => {
            viewport.scrollTop = 50;
            viewport.dispatchEvent(new Event('scroll'));
            result.current.scrollAreaRef(null);
        });

        rerender({
            scopeKey: '42:target:table:empty',
            scrollToLatestOnOpen: true,
            comments: [],
            scrollIntent: null,
        });

        const returned = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(returned.root);
        });

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
            ],
            scrollIntent: null,
        });
        expect(returned.viewport.scrollTop).toBe(50);

        const remote = attachNode(result.current.setCommentItemRef, 4);
        remote.scrollIntoView.mockClear();

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
                comment({ id: 4 }),
            ],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(remote.scrollIntoView).not.toHaveBeenCalled();
        expect(returned.viewport.scrollTop).toBe(50);
    });

    it('follows remote appends after All → empty target → near-bottom All restore', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        act(() => {
            viewport.scrollTop = 920;
            viewport.dispatchEvent(new Event('scroll'));
            result.current.scrollAreaRef(null);
        });

        rerender({
            scopeKey: '42:target:field:empty',
            scrollToLatestOnOpen: true,
            comments: [],
            scrollIntent: null,
        });

        const returned = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(returned.root);
        });

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });
        expect(returned.viewport.scrollTop).toBe(920);

        const remote = attachNode(result.current.setCommentItemRef, 3);
        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
            ],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(remote.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('scrolls to the first local-create comment after an empty target without remounting the hook', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:target:table:new',
                    scrollToLatestOnOpen: true,
                    comments: [],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root } = createScrollRoot({
            scrollHeight: 100,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(root);
        });

        rerender({
            scopeKey: '42:target:table:new',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 99 })],
            scrollIntent: intent({ targetCommentId: 99, generation: 1 }),
        });

        const created = attachNode(result.current.setCommentItemRef, 99);
        await waitFor(() => {
            expect(created.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('follows the first remote append into a previously empty near-bottom target', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:target:table:new',
                    scrollToLatestOnOpen: true,
                    comments: [],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root } = createScrollRoot({
            scrollHeight: 100,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(root);
        });

        const remote = attachNode(result.current.setCommentItemRef, 5);
        rerender({
            scopeKey: '42:target:table:new',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 5 })],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(remote.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('does not store outgoing geometry under the incoming scope key', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(root);
        });
        act(() => {
            viewport.scrollTop = 260;
            viewport.dispatchEvent(new Event('scroll'));
            result.current.scrollAreaRef(null);
        });

        rerender({
            scopeKey: '42:target:table:empty',
            scrollToLatestOnOpen: true,
            comments: [],
            scrollIntent: null,
        });

        // Enter the empty target again after visiting All would restore 260.
        // First return to All to prove 260 was stored under All only.
        const returned = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(returned.root);
        });
        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });
        expect(returned.viewport.scrollTop).toBe(260);

        // Leave All again; empty target must not restore 260 when opened.
        act(() => {
            returned.viewport.scrollTop = 0;
            result.current.scrollAreaRef(null);
        });
        rerender({
            scopeKey: '42:target:table:empty',
            scrollToLatestOnOpen: true,
            comments: [],
            scrollIntent: null,
        });

        const emptyViewport = createScrollRoot({
            scrollHeight: 100,
            scrollTop: 0,
            clientHeight: 100,
        });
        act(() => {
            result.current.scrollAreaRef(emptyViewport.root);
        });
        rerender({
            scopeKey: '42:target:table:empty',
            scrollToLatestOnOpen: true,
            comments: [],
            scrollIntent: null,
        });
        expect(emptyViewport.viewport.scrollTop).toBe(0);
    });

    it('does not auto-scroll remote appends after restoring a mid-list All position', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
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

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        act(() => {
            viewport.scrollTop = 50;
            viewport.dispatchEvent(new Event('scroll'));
        });

        rerender({
            scopeKey: '42:target:table:t1',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 10 }), comment({ id: 11 })],
            scrollIntent: null,
        });
        attachNode(result.current.setCommentItemRef, 11);

        act(() => {
            viewport.scrollTop = 920;
            viewport.dispatchEvent(new Event('scroll'));
        });

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
            ],
            scrollIntent: null,
        });

        expect(viewport.scrollTop).toBe(50);

        const remote = attachNode(result.current.setCommentItemRef, 4);
        remote.scrollIntoView.mockClear();

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
                comment({ id: 4 }),
            ],
            scrollIntent: null,
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(remote.scrollIntoView).not.toHaveBeenCalled();
        expect(viewport.scrollTop).toBe(50);
    });

    it('auto-scrolls remote appends after restoring a near-bottom All position', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        act(() => {
            viewport.scrollTop = 920;
            viewport.dispatchEvent(new Event('scroll'));
        });

        rerender({
            scopeKey: '42:diagram',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 8 }), comment({ id: 9 })],
            scrollIntent: null,
        });
        attachNode(result.current.setCommentItemRef, 9);

        act(() => {
            viewport.scrollTop = 100;
            viewport.dispatchEvent(new Event('scroll'));
        });

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        expect(viewport.scrollTop).toBe(920);

        const remote = attachNode(result.current.setCommentItemRef, 3);

        rerender({
            scopeKey: '42:all',
            scrollToLatestOnOpen: false,
            comments: [
                comment({ id: 1 }),
                comment({ id: 2 }),
                comment({ id: 3 }),
            ],
            scrollIntent: null,
        });

        await waitFor(() => {
            expect(remote.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });
    });

    it('does not restore All scrollTop from a different diagram namespace', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:all',
                    scrollToLatestOnOpen: false,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        act(() => {
            viewport.scrollTop = 310;
            viewport.dispatchEvent(new Event('scroll'));
        });

        // New diagram session starts at the top; must not revive 42's offset.
        act(() => {
            viewport.scrollTop = 0;
        });

        rerender({
            scopeKey: '84:all',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        expect(viewport.scrollTop).toBe(0);
    });

    it('keeps table and field scopes with the same entity id independent', async () => {
        const { result, rerender } = renderHook(
            (props: ScrollHookProps) => useDiscussionScroll(props),
            {
                initialProps: {
                    scopeKey: '42:target:table:same-id',
                    scrollToLatestOnOpen: true,
                    comments: [comment({ id: 1 }), comment({ id: 2 })],
                    scrollIntent: null,
                } as ScrollHookProps,
            }
        );

        const { root, viewport } = createScrollRoot({
            scrollHeight: 1000,
            scrollTop: 0,
            clientHeight: 100,
        });

        act(() => {
            result.current.scrollAreaRef(root);
        });

        const tableLatest = attachNode(result.current.setCommentItemRef, 2);
        await waitFor(() => {
            expect(tableLatest.scrollIntoView).toHaveBeenCalled();
        });
        tableLatest.scrollIntoView.mockClear();

        act(() => {
            viewport.scrollTop = 400;
            viewport.dispatchEvent(new Event('scroll'));
        });

        rerender({
            scopeKey: '42:target:field:same-id',
            scrollToLatestOnOpen: true,
            comments: [comment({ id: 8 }), comment({ id: 9 })],
            scrollIntent: null,
        });

        const fieldLatest = attachNode(result.current.setCommentItemRef, 9);
        await waitFor(() => {
            expect(fieldLatest.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'auto',
                    block: 'end',
                })
            );
        });
        // Field open uses open-to-latest, not the table's stored 400.
        expect(fieldLatest.scrollIntoView).toHaveBeenCalled();
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

        // Rebind listener by replacing the scroll root.
        rerender({
            scopeKey: 'diagram',
            scrollToLatestOnOpen: false,
            comments: [comment({ id: 1 }), comment({ id: 2 })],
            scrollIntent: null,
        });

        act(() => {
            result.current.scrollAreaRef(null);
        });
        unmount();

        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    describe('commit-phase purity and Strict Mode', () => {
        it('does not read viewport scrollTop during render on a scope transition', () => {
            let renderDepth = 0;
            let scrollTopReadsDuringRender = 0;

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            const originalScrollTop = Object.getOwnPropertyDescriptor(
                viewport,
                'scrollTop'
            );
            expect(originalScrollTop?.get).toBeTypeOf('function');

            Object.defineProperty(viewport, 'scrollTop', {
                configurable: true,
                get: () => {
                    if (renderDepth > 0) {
                        scrollTopReadsDuringRender += 1;
                    }
                    return originalScrollTop!.get!.call(viewport);
                },
                set: (value: number) => {
                    originalScrollTop!.set!.call(viewport, value);
                },
            });

            const Harness: React.FC<ScrollHookProps> = (props) => {
                renderDepth += 1;
                try {
                    const { scrollAreaRef } = useDiscussionScroll(props);
                    React.useLayoutEffect(() => {
                        scrollAreaRef(root);
                        return () => {
                            scrollAreaRef(null);
                        };
                    }, [scrollAreaRef]);
                    return null;
                } finally {
                    renderDepth -= 1;
                }
            };

            const { rerender } = render(
                <Harness
                    scopeKey="42:all"
                    scrollToLatestOnOpen={false}
                    comments={[comment({ id: 1 }), comment({ id: 2 })]}
                    scrollIntent={null}
                />
            );

            act(() => {
                viewport.scrollTop = 240;
                viewport.dispatchEvent(new Event('scroll'));
            });

            scrollTopReadsDuringRender = 0;

            rerender(
                <Harness
                    scopeKey="42:target:table:t1"
                    scrollToLatestOnOpen
                    comments={[comment({ id: 10 })]}
                    scrollIntent={null}
                />
            );

            expect(scrollTopReadsDuringRender).toBe(0);
        });

        it('captures outgoing All position in layout-effect cleanup for in-place transitions', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
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

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
            });

            act(() => {
                viewport.scrollTop = 333;
                viewport.dispatchEvent(new Event('scroll'));
            });

            // In-place scope change — viewport stays bound; cleanup must capture.
            rerender({
                scopeKey: '42:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 10 }), comment({ id: 11 })],
                scrollIntent: null,
            });
            attachNode(result.current.setCommentItemRef, 11);

            act(() => {
                viewport.scrollTop = 900;
                viewport.dispatchEvent(new Event('scroll'));
            });

            rerender({
                scopeKey: '42:all',
                scrollToLatestOnOpen: false,
                comments: [
                    comment({ id: 1 }),
                    comment({ id: 2 }),
                    comment({ id: 3 }),
                ],
                scrollIntent: null,
            });

            expect(viewport.scrollTop).toBe(333);
        });

        it('does not let content-collapse clamping overwrite the outgoing All position', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
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

            const { root, viewport, setScrollHeight } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
            });
            act(() => {
                viewport.scrollTop = 280;
                viewport.dispatchEvent(new Event('scroll'));
            });

            // Simulate incoming content collapsing the viewport before/with the
            // committed scope transition — clamp must not erase All's 280.
            act(() => {
                setScrollHeight(120);
                viewport.scrollTop = 0;
                viewport.dispatchEvent(new Event('scroll'));
            });

            rerender({
                scopeKey: '42:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 10 })],
                scrollIntent: null,
            });
            attachNode(result.current.setCommentItemRef, 10);

            setScrollHeight(1000);
            rerender({
                scopeKey: '42:all',
                scrollToLatestOnOpen: false,
                comments: [
                    comment({ id: 1 }),
                    comment({ id: 2 }),
                    comment({ id: 3 }),
                ],
                scrollIntent: null,
            });

            expect(viewport.scrollTop).toBe(280);
        });

        it('Strict Mode still restores All after empty target', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
                        scrollToLatestOnOpen: false,
                        comments: [
                            comment({ id: 1 }),
                            comment({ id: 2 }),
                            comment({ id: 3 }),
                        ],
                        scrollIntent: null,
                    } as ScrollHookProps,
                    wrapper: ({ children }) => (
                        <React.StrictMode>{children}</React.StrictMode>
                    ),
                }
            );

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
            });
            act(() => {
                viewport.scrollTop = 240;
                viewport.dispatchEvent(new Event('scroll'));
                result.current.scrollAreaRef(null);
            });

            rerender({
                scopeKey: '42:target:table:empty',
                scrollToLatestOnOpen: true,
                comments: [],
                scrollIntent: null,
            });

            const restored = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });
            act(() => {
                result.current.scrollAreaRef(restored.root);
            });
            rerender({
                scopeKey: '42:all',
                scrollToLatestOnOpen: false,
                comments: [
                    comment({ id: 1 }),
                    comment({ id: 2 }),
                    comment({ id: 3 }),
                ],
                scrollIntent: null,
            });

            expect(restored.viewport.scrollTop).toBe(240);
        });

        it('Strict Mode does not restore foreign diagram geometry after a namespace switch', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
                        scrollToLatestOnOpen: false,
                        comments: [comment({ id: 1 }), comment({ id: 2 })],
                        scrollIntent: null,
                    } as ScrollHookProps,
                    wrapper: ({ children }) => (
                        <React.StrictMode>{children}</React.StrictMode>
                    ),
                }
            );

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
            });
            act(() => {
                viewport.scrollTop = 310;
                viewport.dispatchEvent(new Event('scroll'));
            });

            act(() => {
                viewport.scrollTop = 0;
            });

            rerender({
                scopeKey: '99:all',
                scrollToLatestOnOpen: false,
                comments: [comment({ id: 1, diagramId: 99 })],
                scrollIntent: null,
            });

            expect(viewport.scrollTop).toBe(0);

            // Leaving and returning within diagram 99 must not revive 310.
            act(() => {
                viewport.scrollTop = 40;
                viewport.dispatchEvent(new Event('scroll'));
            });
            rerender({
                scopeKey: '99:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 5, diagramId: 99 })],
                scrollIntent: null,
            });
            attachNode(result.current.setCommentItemRef, 5);

            act(() => {
                viewport.scrollTop = 800;
                viewport.dispatchEvent(new Event('scroll'));
            });

            rerender({
                scopeKey: '99:all',
                scrollToLatestOnOpen: false,
                comments: [comment({ id: 1, diagramId: 99 })],
                scrollIntent: null,
            });

            expect(viewport.scrollTop).toBe(40);
        });

        it('Strict Mode executes a local-create intent only once', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:target:table:new',
                        scrollToLatestOnOpen: true,
                        comments: [],
                        scrollIntent: null,
                    } as ScrollHookProps,
                    wrapper: ({ children }) => (
                        <React.StrictMode>{children}</React.StrictMode>
                    ),
                }
            );

            const { root } = createScrollRoot({
                scrollHeight: 100,
                scrollTop: 0,
                clientHeight: 100,
            });
            act(() => {
                result.current.scrollAreaRef(root);
            });

            rerender({
                scopeKey: '42:target:table:new',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 99 })],
                scrollIntent: intent({ targetCommentId: 99, generation: 1 }),
            });

            const created = attachNode(result.current.setCommentItemRef, 99);
            await waitFor(() => {
                expect(created.scrollIntoView).toHaveBeenCalledTimes(1);
            });
            expect(created.scrollIntoView).toHaveBeenCalledWith(
                expect.objectContaining({
                    behavior: 'smooth',
                    block: 'end',
                })
            );
        });

        it('Strict Mode open-to-latest scrolls once for a target scope', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:target:table:t1',
                        scrollToLatestOnOpen: true,
                        comments: [comment({ id: 1 }), comment({ id: 2 })],
                        scrollIntent: null,
                    } as ScrollHookProps,
                    wrapper: ({ children }) => (
                        <React.StrictMode>{children}</React.StrictMode>
                    ),
                }
            );

            const latest = attachNode(result.current.setCommentItemRef, 2);
            await waitFor(() => {
                expect(latest.scrollIntoView).toHaveBeenCalled();
            });
            expect(latest.scrollIntoView).toHaveBeenCalledTimes(1);

            latest.scrollIntoView.mockClear();
            rerender({
                scopeKey: '42:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 1 }), comment({ id: 2 })],
                scrollIntent: null,
            });

            await act(async () => {
                await Promise.resolve();
            });
            expect(latest.scrollIntoView).not.toHaveBeenCalled();
        });

        it('keeps a single active passive scroll listener after Strict Mode mount', () => {
            const { result, unmount } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
                        scrollToLatestOnOpen: false,
                        comments: [comment({ id: 1 })],
                        scrollIntent: null,
                    } as ScrollHookProps,
                    wrapper: ({ children }) => (
                        <React.StrictMode>{children}</React.StrictMode>
                    ),
                }
            );

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });
            const addSpy = vi.spyOn(viewport, 'addEventListener');
            const removeSpy = vi.spyOn(viewport, 'removeEventListener');

            act(() => {
                result.current.scrollAreaRef(root);
            });

            const scrollAdds = addSpy.mock.calls.filter(
                (call) => call[0] === 'scroll'
            );
            expect(scrollAdds.length).toBe(1);

            act(() => {
                viewport.scrollTop = 50;
                viewport.dispatchEvent(new Event('scroll'));
            });
            expect(viewport.scrollTop).toBe(50);

            act(() => {
                result.current.scrollAreaRef(null);
            });
            unmount();
            expect(removeSpy).toHaveBeenCalledWith(
                'scroll',
                expect.any(Function)
            );
        });

        it('aborted render attempt cannot alone mutate stored All position', async () => {
            // Architecture proof: render body assigns no lifecycle refs.
            // An intermediate props render that never reaches a committed
            // outgoing capture cannot change restore behavior — only commit
            // cleanup / detach can. Simulate by scrolling All, then jumping
            // All → target → All in one act so both transitions commit, and
            // asserting exact restore (no render-phase overwrite of All).
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
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

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
                viewport.scrollTop = 215;
                viewport.dispatchEvent(new Event('scroll'));
            });

            act(() => {
                rerender({
                    scopeKey: '42:target:table:t1',
                    scrollToLatestOnOpen: true,
                    comments: [comment({ id: 10 })],
                    scrollIntent: null,
                });
                attachNode(result.current.setCommentItemRef, 10);
                rerender({
                    scopeKey: '42:all',
                    scrollToLatestOnOpen: false,
                    comments: [
                        comment({ id: 1 }),
                        comment({ id: 2 }),
                        comment({ id: 3 }),
                    ],
                    scrollIntent: null,
                });
            });

            expect(viewport.scrollTop).toBe(215);
        });

        it('keeps listener attribution on committed A when desired B has not committed to the hook', () => {
            // Parent only forwards scopeKey to the hook after layout commit.
            // A render that desires B therefore cannot suppress A scrolls —
            // matching the hook invariant that render never advances listener
            // identity.
            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            const Parent: React.FC<{ desiredScope: string }> = ({
                desiredScope,
            }) => {
                const [committedScope, setCommittedScope] =
                    React.useState(desiredScope);

                React.useLayoutEffect(() => {
                    setCommittedScope(desiredScope);
                }, [desiredScope]);

                const { scrollAreaRef } = useDiscussionScroll({
                    scopeKey: committedScope,
                    scrollToLatestOnOpen: committedScope !== '42:all',
                    comments:
                        committedScope === '42:all'
                            ? [
                                  comment({ id: 1 }),
                                  comment({ id: 2 }),
                                  comment({ id: 3 }),
                              ]
                            : [comment({ id: 10 })],
                    scrollIntent: null,
                });

                React.useLayoutEffect(() => {
                    scrollAreaRef(root);
                    return () => {
                        scrollAreaRef(null);
                    };
                }, [committedScope, scrollAreaRef]);

                return (
                    <div data-testid="committed-scope">{committedScope}</div>
                );
            };

            const view = render(<Parent desiredScope="42:all" />);
            expect(screen.getByTestId('committed-scope')).toHaveTextContent(
                '42:all'
            );

            act(() => {
                viewport.scrollTop = 194;
                viewport.dispatchEvent(new Event('scroll'));
            });

            act(() => {
                view.rerender(<Parent desiredScope="42:target:table:t1" />);
            });
            expect(screen.getByTestId('committed-scope')).toHaveTextContent(
                '42:target:table:t1'
            );

            act(() => {
                view.rerender(<Parent desiredScope="42:all" />);
            });
            expect(screen.getByTestId('committed-scope')).toHaveTextContent(
                '42:all'
            );
            expect(viewport.scrollTop).toBe(194);
        });

        it('listener writes under committed A until B layout commits, then under B', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
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

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });

            act(() => {
                result.current.scrollAreaRef(root);
            });
            act(() => {
                viewport.scrollTop = 160;
                viewport.dispatchEvent(new Event('scroll'));
            });

            rerender({
                scopeKey: '42:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 10 }), comment({ id: 11 })],
                scrollIntent: null,
            });
            attachNode(result.current.setCommentItemRef, 11);

            // After B commits, scrolling must record under B — returning to
            // All restores 160 (A), not the target viewport offset.
            act(() => {
                viewport.scrollTop = 880;
                viewport.dispatchEvent(new Event('scroll'));
            });

            rerender({
                scopeKey: '42:all',
                scrollToLatestOnOpen: false,
                comments: [
                    comment({ id: 1 }),
                    comment({ id: 2 }),
                    comment({ id: 3 }),
                ],
                scrollIntent: null,
            });
            expect(viewport.scrollTop).toBe(160);
        });

        it('genuine unmount removes the listener and blocks stale item-ref DOM work', () => {
            const { result, unmount, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:target:table:t1',
                        scrollToLatestOnOpen: true,
                        comments: [comment({ id: 1 })],
                        scrollIntent: null,
                    } as ScrollHookProps,
                }
            );

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });
            const removeSpy = vi.spyOn(viewport, 'removeEventListener');
            const addSpy = vi.spyOn(viewport, 'addEventListener');

            act(() => {
                result.current.scrollAreaRef(root);
            });
            expect(
                addSpy.mock.calls.filter((call) => call[0] === 'scroll').length
            ).toBeGreaterThanOrEqual(1);

            rerender({
                scopeKey: '42:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 1 }), comment({ id: 2 })],
                scrollIntent: intent({ targetCommentId: 2, generation: 1 }),
            });

            unmount();

            expect(removeSpy).toHaveBeenCalledWith(
                'scroll',
                expect.any(Function)
            );

            const stale = document.createElement('li');
            const scrollIntoView = vi.fn();
            stale.scrollIntoView = scrollIntoView;

            const addsBeforeStaleAttach = addSpy.mock.calls.filter(
                (call) => call[0] === 'scroll'
            ).length;

            act(() => {
                result.current.setCommentItemRef(2, stale);
                result.current.scrollAreaRef(root);
            });

            expect(scrollIntoView).not.toHaveBeenCalled();
            const addsAfterStaleAttach = addSpy.mock.calls.filter(
                (call) => call[0] === 'scroll'
            ).length;
            expect(addsAfterStaleAttach).toBe(addsBeforeStaleAttach);
        });

        it('genuine unmount prevents later pending local-create execution', () => {
            const { result, unmount, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:target:table:new',
                        scrollToLatestOnOpen: true,
                        comments: [],
                        scrollIntent: null,
                    } as ScrollHookProps,
                }
            );

            rerender({
                scopeKey: '42:target:table:new',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 99 })],
                scrollIntent: intent({ targetCommentId: 99, generation: 3 }),
            });

            unmount();

            const node = document.createElement('li');
            const scrollIntoView = vi.fn();
            node.scrollIntoView = scrollIntoView;

            act(() => {
                result.current.setCommentItemRef(99, node);
            });

            expect(scrollIntoView).not.toHaveBeenCalled();
        });

        it('does not clear diagram namespace positions without a committed switch', async () => {
            const { result, rerender } = renderHook(
                (props: ScrollHookProps) => useDiscussionScroll(props),
                {
                    initialProps: {
                        scopeKey: '42:all',
                        scrollToLatestOnOpen: false,
                        comments: [comment({ id: 1 }), comment({ id: 2 })],
                        scrollIntent: null,
                    } as ScrollHookProps,
                }
            );

            const { root, viewport } = createScrollRoot({
                scrollHeight: 1000,
                scrollTop: 0,
                clientHeight: 100,
            });
            act(() => {
                result.current.scrollAreaRef(root);
            });
            act(() => {
                viewport.scrollTop = 275;
                viewport.dispatchEvent(new Event('scroll'));
            });

            // Same-diagram scope churn must not wipe All's stored offset.
            rerender({
                scopeKey: '42:target:table:t1',
                scrollToLatestOnOpen: true,
                comments: [comment({ id: 10 })],
                scrollIntent: null,
            });
            attachNode(result.current.setCommentItemRef, 10);

            rerender({
                scopeKey: '42:all',
                scrollToLatestOnOpen: false,
                comments: [comment({ id: 1 }), comment({ id: 2 })],
                scrollIntent: null,
            });
            expect(viewport.scrollTop).toBe(275);
        });
    });
});
