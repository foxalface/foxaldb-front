import React from 'react';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { en } from '@/i18n/locales/en';

const { updateCommentMock } = vi.hoisted(() => ({
    updateCommentMock: vi.fn(),
}));

vi.mock('@/hooks/use-comment-mutations', () => ({
    useCommentMutations: () => ({
        createComment: vi.fn(),
        updateComment: updateCommentMock,
        deleteComment: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            if (typeof current !== 'string') {
                return key;
            }
            if (!options) {
                return current;
            }
            return current.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
                String(options[name] ?? `{{${name}}}`)
            );
        },
    }),
}));

import { CommentEditForm } from '../comment-edit-form';

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const baseComment = (
    overrides: Partial<DiagramComment> = {}
): DiagramComment => ({
    id: 7,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: 'Original body',
    user: { id: 1, name: 'Alice' },
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
});

const renderForm = (
    props: Partial<React.ComponentProps<typeof CommentEditForm>> = {}
) => {
    const onCancel = props.onCancel ?? vi.fn();
    const onSaved = props.onSaved ?? vi.fn();
    const comment = props.comment ?? baseComment();
    const result = render(
        <CommentEditForm
            comment={comment}
            diagramId={props.diagramId ?? '42'}
            onCancel={onCancel}
            onSaved={onSaved}
        />
    );
    return { ...result, onCancel, onSaved, comment };
};

describe('CommentEditForm', () => {
    beforeEach(() => {
        updateCommentMock.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('initializes the draft from the persisted body and focuses the textarea', async () => {
        renderForm();

        const textarea = screen.getByRole('textbox', { name: 'Message' });
        expect(textarea).toHaveValue('Original body');
        await waitFor(() => {
            expect(textarea).toHaveFocus();
        });
        expect(screen.getByText('13 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('13 of 2000 characters used')
        ).toBeInTheDocument();
    });

    it('treats empty and whitespace-only bodies as invalid', async () => {
        const user = userEvent.setup();
        renderForm();

        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

        await user.type(textarea, '   ');
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        expect(screen.getByText('0 / 2000')).toBeInTheDocument();
        expect(updateCommentMock).not.toHaveBeenCalled();
    });

    it('allows exactly 2000 Unicode code points and rejects 2001', async () => {
        const user = userEvent.setup();
        updateCommentMock.mockResolvedValue(
            baseComment({ body: 'x'.repeat(2000) })
        );
        renderForm({ comment: baseComment({ body: '' }) });

        const textarea = screen.getByRole('textbox');
        await user.click(textarea);
        await user.paste('a'.repeat(2000));
        expect(screen.getByText('2000 / 2000')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();

        await user.clear(textarea);
        await user.paste('a'.repeat(2001));
        expect(screen.getByText('2001 / 2000')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        expect(
            screen.getByText('Messages cannot exceed 2000 characters.')
        ).toBeInTheDocument();
    });

    it('counts emoji, CJK, combining, and ZWJ sequences by code point', async () => {
        const user = userEvent.setup();
        renderForm({ comment: baseComment({ body: '' }) });

        const textarea = screen.getByRole('textbox');
        await user.click(textarea);
        await user.paste('😀日本語e\u0301👩\u200D💻');

        // 😀(1) + 日(1)本(1)語(1) + e(1)+́(1) + 👩(1)+ZWJ(1)+💻(1) = 9
        expect(screen.getByText('9 / 2000')).toBeInTheDocument();
    });

    it('submits a trimmed body and preserves internal newlines', async () => {
        const user = userEvent.setup();
        updateCommentMock.mockResolvedValue(
            baseComment({ body: 'line1\nline2' })
        );
        renderForm();

        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        await user.type(textarea, '  line1');
        await user.keyboard('{Shift>}{Enter}{/Shift}');
        await user.type(textarea, 'line2  ');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(updateCommentMock).toHaveBeenCalledWith(7, {
            body: 'line1\nline2',
        });
    });

    it('saves on Enter and inserts a newline on Shift+Enter', async () => {
        const user = userEvent.setup();
        updateCommentMock.mockResolvedValue(baseComment({ body: 'saved' }));
        const { onSaved } = renderForm({
            comment: baseComment({ body: '' }),
        });

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'line1');
        await user.keyboard('{Shift>}{Enter}{/Shift}');
        await user.type(textarea, 'line2');
        expect(textarea).toHaveValue('line1\nline2');
        expect(updateCommentMock).not.toHaveBeenCalled();

        await user.keyboard('{Enter}');
        expect(updateCommentMock).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledTimes(1);
        });
    });

    it('does not save Enter while IME composition is active', async () => {
        const user = userEvent.setup();
        renderForm({ comment: baseComment({ body: '' }) });

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, '組成');

        await act(async () => {
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, 'isComposing', {
                configurable: true,
                get: () => true,
            });
            textarea.dispatchEvent(event);
        });

        expect(updateCommentMock).not.toHaveBeenCalled();
    });

    it('cancels on Escape when idle and ignores Escape while pending', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        const { unmount } = renderForm({ onCancel });

        await user.keyboard('{Escape}');
        expect(onCancel).toHaveBeenCalledTimes(1);
        unmount();

        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const onCancelPending = vi.fn();
        renderForm({
            comment: baseComment({ body: 'pending' }),
            onCancel: onCancelPending,
        });

        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

        await user.keyboard('{Escape}');
        expect(onCancelPending).not.toHaveBeenCalled();

        await act(async () => {
            pending.resolve(baseComment({ body: 'pending' }));
        });
    });

    it('exits through onSaved on success and retains draft with generic error on failure', async () => {
        const user = userEvent.setup();
        updateCommentMock.mockResolvedValue(baseComment({ body: 'Updated' }));
        const { onSaved, unmount } = renderForm();

        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        await user.type(textarea, 'Updated');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledTimes(1);
        });
        unmount();

        updateCommentMock.mockRejectedValue(
            new Error('secret backend validation XYZ')
        );
        renderForm();
        const failing = screen.getByRole('textbox');
        await user.clear(failing);
        await user.type(failing, 'Keep this draft');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Could not update the message. Please try again.'
                )
            ).toBeInTheDocument();
        });
        expect(failing).toHaveValue('Keep this draft');
        expect(
            screen.queryByText('secret backend validation XYZ')
        ).not.toBeInTheDocument();
        await waitFor(() => {
            expect(failing).toHaveFocus();
        });
    });

    it('invokes updateComment once for same-tick double Save and Enter+click race', async () => {
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const { unmount } = renderForm({
            comment: baseComment({ body: 'Once only' }),
        });

        const form = screen.getByRole('form') as HTMLFormElement;
        await act(async () => {
            form.requestSubmit();
            form.requestSubmit();
        });
        expect(updateCommentMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending.resolve(baseComment({ body: 'Once only' }));
        });
        unmount();

        updateCommentMock.mockReset();
        const pending2 = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending2.promise);
        renderForm({ comment: baseComment({ body: 'Race me' }) });

        const textarea = screen.getByRole('textbox');
        await act(async () => {
            fireEvent.keyDown(textarea, {
                key: 'Enter',
                code: 'Enter',
                bubbles: true,
            });
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        });

        expect(updateCommentMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending2.resolve(baseComment({ body: 'Race me' }));
        });
    });

    it('ignores pending success and failure after unmount', async () => {
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { unmount } = renderForm({
            comment: baseComment({ body: 'unmount success' }),
        });
        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Save' }));
        unmount();

        await act(async () => {
            pending.resolve(baseComment({ body: 'unmount success' }));
        });

        let messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);

        const pendingFail = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pendingFail.promise);
        const second = renderForm({
            comment: baseComment({ body: 'unmount fail' }),
        });
        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Save' }));
        second.unmount();

        await act(async () => {
            pendingFail.reject(new Error('network'));
        });

        messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });

    it('ignores stale session success and failure after identity change', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const onSaved = vi.fn();
        const { rerender, unmount } = render(
            <CommentEditForm
                comment={baseComment({ id: 7, body: 'old session' })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(updateCommentMock).toHaveBeenCalledTimes(1);

        rerender(
            <CommentEditForm
                comment={baseComment({ id: 8, body: 'new session' })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved}
            />
        );

        expect(screen.getByRole('textbox')).toHaveValue('new session');

        await act(async () => {
            pending.resolve(baseComment({ id: 7, body: 'old session' }));
        });
        expect(onSaved).not.toHaveBeenCalled();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        unmount();

        const pendingFail = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pendingFail.promise);
        const onSaved2 = vi.fn();
        const second = render(
            <CommentEditForm
                comment={baseComment({ id: 9, body: 'fail session' })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved2}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Save' }));
        second.rerender(
            <CommentEditForm
                comment={baseComment({ id: 10, body: 'after fail switch' })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved2}
            />
        );

        await act(async () => {
            pendingFail.reject(new Error('stale'));
        });

        expect(onSaved2).not.toHaveBeenCalled();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('after fail switch');
    });

    it('preserves the draft and shows a remote-updated warning, clearing on Cancel and Save', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        const { rerender, unmount } = render(
            <CommentEditForm
                comment={baseComment({
                    body: 'Local draft base',
                    updatedAt: '2026-07-22T10:00:00.000Z',
                })}
                diagramId="42"
                onCancel={onCancel}
                onSaved={vi.fn()}
            />
        );

        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        await user.type(textarea, 'My local draft');

        rerender(
            <CommentEditForm
                comment={baseComment({
                    body: 'Remote body',
                    updatedAt: '2026-07-22T11:00:00.000Z',
                })}
                diagramId="42"
                onCancel={onCancel}
                onSaved={vi.fn()}
            />
        );

        expect(textarea).toHaveValue('My local draft');
        expect(
            screen.getByText(
                'This message was updated elsewhere. Saving will overwrite those changes.'
            )
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onCancel).toHaveBeenCalledTimes(1);
        unmount();

        updateCommentMock.mockResolvedValue(
            baseComment({
                body: 'Saved draft',
                updatedAt: '2026-07-22T12:00:00.000Z',
            })
        );
        const onSaved = vi.fn();
        const third = render(
            <CommentEditForm
                comment={baseComment({
                    body: 'Base',
                    updatedAt: '2026-07-22T10:00:00.000Z',
                })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved}
            />
        );

        await user.clear(screen.getByRole('textbox'));
        await user.type(screen.getByRole('textbox'), 'Final draft');
        third.rerender(
            <CommentEditForm
                comment={baseComment({
                    body: 'Remote again',
                    updatedAt: '2026-07-22T11:30:00.000Z',
                })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved}
            />
        );

        expect(
            screen.getByText(
                'This message was updated elsewhere. Saving will overwrite those changes.'
            )
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledTimes(1);
        });
    });

    it('shows remote warning after pending save fails across a remote update', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);

        const { rerender } = render(
            <CommentEditForm
                comment={baseComment({
                    body: 'Base',
                    updatedAt: '2026-07-22T10:00:00.000Z',
                })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={vi.fn()}
            />
        );

        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        await user.type(textarea, 'Draft during remote');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

        rerender(
            <CommentEditForm
                comment={baseComment({
                    body: 'Remote body',
                    updatedAt: '2026-07-22T11:00:00.000Z',
                })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={vi.fn()}
            />
        );

        expect(textarea).toHaveValue('Draft during remote');
        expect(
            screen.queryByText(
                'This message was updated elsewhere. Saving will overwrite those changes.'
            )
        ).not.toBeInTheDocument();

        await act(async () => {
            pending.reject(new Error('secret backend failure XYZ'));
        });

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Could not update the message. Please try again.'
                )
            ).toBeInTheDocument();
        });
        expect(textarea).toHaveValue('Draft during remote');
        expect(
            screen.getByText(
                'This message was updated elsewhere. Saving will overwrite those changes.'
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByText('secret backend failure XYZ')
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
        await waitFor(() => {
            expect(textarea).toHaveFocus();
        });
    });

    it('exits through onSaved when pending save succeeds after a remote update', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const onSaved = vi.fn();

        const { rerender } = render(
            <CommentEditForm
                comment={baseComment({
                    updatedAt: '2026-07-22T10:00:00.000Z',
                })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Save' }));

        rerender(
            <CommentEditForm
                comment={baseComment({
                    updatedAt: '2026-07-22T11:00:00.000Z',
                })}
                diagramId="42"
                onCancel={vi.fn()}
                onSaved={onSaved}
            />
        );

        await act(async () => {
            pending.resolve(
                baseComment({
                    updatedAt: '2026-07-22T12:00:00.000Z',
                })
            );
        });

        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledTimes(1);
        });
    });

    it('shows only the mutation error when pending save fails without a remote update', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        renderForm({ comment: baseComment({ body: 'Only failure' }) });

        await user.click(screen.getByRole('button', { name: 'Save' }));
        await act(async () => {
            pending.reject(new Error('network'));
        });

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Could not update the message. Please try again.'
                )
            ).toBeInTheDocument();
        });
        expect(
            screen.queryByText(
                'This message was updated elsewhere. Saving will overwrite those changes.'
            )
        ).not.toBeInTheDocument();
    });

    it.each([
        { name: 'Ctrl+Enter', ctrlKey: true },
        { name: 'Meta+Enter', metaKey: true },
        { name: 'Alt+Enter', altKey: true },
    ])(
        'saves exactly once on $name when valid and not composing',
        async ({ ctrlKey, metaKey, altKey }) => {
            updateCommentMock.mockResolvedValue(
                baseComment({ body: 'Modifier save' })
            );
            const { onSaved } = renderForm({
                comment: baseComment({ body: 'modifier save' }),
            });

            const textarea = screen.getByRole('textbox');
            await act(async () => {
                fireEvent.keyDown(textarea, {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true,
                    ctrlKey: ctrlKey === true,
                    metaKey: metaKey === true,
                    altKey: altKey === true,
                });
            });

            expect(updateCommentMock).toHaveBeenCalledTimes(1);
            await waitFor(() => {
                expect(onSaved).toHaveBeenCalledTimes(1);
            });
        }
    );

    it('keeps Shift+Enter as the only Enter modifier that inserts a newline', async () => {
        const user = userEvent.setup();
        renderForm({ comment: baseComment({ body: '' }) });

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'line1');
        await user.keyboard('{Shift>}{Enter}{/Shift}');
        await user.type(textarea, 'line2');

        expect(textarea).toHaveValue('line1\nline2');
        expect(updateCommentMock).not.toHaveBeenCalled();
    });

    it('does not save IME Enter even when a modifier key is present', async () => {
        renderForm({ comment: baseComment({ body: '組成' }) });

        const textarea = screen.getByRole('textbox');
        await act(async () => {
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
                ctrlKey: true,
            });
            Object.defineProperty(event, 'isComposing', {
                configurable: true,
                get: () => true,
            });
            textarea.dispatchEvent(event);
        });

        expect(updateCommentMock).not.toHaveBeenCalled();
    });
});
