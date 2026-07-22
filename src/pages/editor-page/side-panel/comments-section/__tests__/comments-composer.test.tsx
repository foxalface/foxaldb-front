import React from 'react';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    DiagramComment,
    DiagramCommentTarget,
} from '@/lib/comments/comment-types';
import { en } from '@/i18n/locales/en';

const { createCommentMock } = vi.hoisted(() => ({
    createCommentMock: vi.fn(),
}));

vi.mock('@/hooks/use-comment-mutations', () => ({
    useCommentMutations: () => ({
        createComment: createCommentMock,
        updateComment: vi.fn(),
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

import { CommentsComposer } from '../comments-composer';

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const createdComment = (
    overrides: Partial<DiagramComment> = {}
): DiagramComment => ({
    id: 99,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: 'Hello world',
    user: { id: 1, name: 'Alice' },
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
});

const renderComposer = (
    props: Partial<React.ComponentProps<typeof CommentsComposer>> = {}
) =>
    render(
        <CommentsComposer
            diagramId={props.diagramId ?? '42'}
            target={
                props.target ?? {
                    targetType: 'diagram',
                    targetId: null,
                }
            }
        />
    );

describe('CommentsComposer', () => {
    beforeEach(() => {
        createCommentMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders label, textarea, counter, Post and Cancel', () => {
        renderComposer();

        expect(screen.getByText('Message')).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: 'Message' })
        ).toBeInTheDocument();
        expect(screen.getByText('0 / 2000')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Post' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Cancel' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('form', { name: 'New discussion message' })
        ).toBeInTheDocument();
    });

    it('shows initial counter as 0 / 2000', () => {
        renderComposer();
        expect(screen.getByText('0 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('0 of 2000 characters used')
        ).toBeInTheDocument();
    });

    it('updates the counter as the user types', async () => {
        const user = userEvent.setup();
        renderComposer();

        await user.type(screen.getByRole('textbox'), 'Hi');
        expect(screen.getByText('2 / 2000')).toBeInTheDocument();
    });

    it('keeps Post disabled for an empty body', () => {
        renderComposer();
        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
    });

    it('does not submit whitespace-only bodies', async () => {
        const user = userEvent.setup();
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, '   ');
        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
        expect(screen.getByText('0 / 2000')).toBeInTheDocument();

        await user.keyboard('{Enter}');
        expect(createCommentMock).not.toHaveBeenCalled();
    });

    it('does not submit newline-only bodies', async () => {
        const user = userEvent.setup();
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, '{Shift>}{Enter}{/Shift}');
        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
        expect(createCommentMock).not.toHaveBeenCalled();
    });

    it('disables Post and shows a translated error when over 2000 characters', async () => {
        const user = userEvent.setup();
        renderComposer();

        const tooLong = 'a'.repeat(2001);
        await user.click(screen.getByRole('textbox'));
        await user.paste(tooLong);

        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
        expect(
            screen.getByText('Messages cannot exceed 2000 characters.')
        ).toBeInTheDocument();
        expect(screen.getByText('2001 / 2000')).toBeInTheDocument();
        expect(createCommentMock).not.toHaveBeenCalled();
    });

    it('allows exactly 2000 characters', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);
        renderComposer();

        const exact = 'b'.repeat(2000);
        await user.click(screen.getByRole('textbox'));
        await user.paste(exact);

        expect(screen.getByText('2000 / 2000')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith({
            targetType: 'diagram',
            targetId: null,
            body: exact,
        });

        await act(async () => {
            pending.resolve(createdComment({ body: exact }));
        });
    });

    it('submits a trimmed body with the target prop values', async () => {
        const user = userEvent.setup();
        createCommentMock.mockResolvedValue(createdComment());
        renderComposer({
            target: { targetType: 'diagram', targetId: null },
        });

        await user.type(screen.getByRole('textbox'), '  Hello world  ');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        expect(createCommentMock).toHaveBeenCalledWith({
            targetType: 'diagram',
            targetId: null,
            body: 'Hello world',
        });
    });

    it('does not introduce optimistic list behavior', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);
        renderComposer();

        await user.type(screen.getByRole('textbox'), 'Pending message');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('Pending message');

        await act(async () => {
            pending.resolve(createdComment({ body: 'Pending message' }));
        });
    });

    it('clears the draft and errors after a successful submit and refocuses', async () => {
        const user = userEvent.setup();
        createCommentMock.mockResolvedValue(createdComment());
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'Done');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        await waitFor(() => {
            expect(textarea).toHaveValue('');
        });
        await waitFor(() => {
            expect(textarea).toHaveFocus();
        });
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps the exact draft and shows a generic error on failure', async () => {
        const user = userEvent.setup();
        createCommentMock.mockRejectedValue(
            new Error('secret backend validation XYZ')
        );
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'Keep this draft');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Could not post the message. Please try again.'
                )
            ).toBeInTheDocument();
        });
        expect(textarea).toHaveValue('Keep this draft');
        expect(
            screen.queryByText('secret backend validation XYZ')
        ).not.toBeInTheDocument();
        await waitFor(() => {
            expect(textarea).toHaveFocus();
        });
    });

    it('disables controls and shows the submitting label while pending', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);
        renderComposer();

        await user.type(screen.getByRole('textbox'), 'Hang on');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Posting…' })).toBeDisabled();

        await act(async () => {
            pending.resolve(createdComment({ body: 'Hang on' }));
        });
    });

    it('invokes createComment once for same-tick double submit', async () => {
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await act(async () => {
            textarea.focus();
        });
        await userEvent.setup().type(textarea, 'Once only');

        const form = screen.getByRole('form') as HTMLFormElement;
        await act(async () => {
            form.requestSubmit();
            form.requestSubmit();
        });

        expect(createCommentMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending.resolve(createdComment({ body: 'Once only' }));
        });
    });

    it('submits on Enter', async () => {
        const user = userEvent.setup();
        createCommentMock.mockResolvedValue(createdComment());
        renderComposer();

        await user.type(screen.getByRole('textbox'), 'Enter send');
        await user.keyboard('{Enter}');

        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith({
            targetType: 'diagram',
            targetId: null,
            body: 'Enter send',
        });
    });

    it('inserts a newline on Shift+Enter without submitting', async () => {
        const user = userEvent.setup();
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'line1');
        await user.keyboard('{Shift>}{Enter}{/Shift}');
        await user.type(textarea, 'line2');

        expect(textarea).toHaveValue('line1\nline2');
        expect(createCommentMock).not.toHaveBeenCalled();
    });

    it('does not submit Enter while IME composition is active', async () => {
        const user = userEvent.setup();
        renderComposer();

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

        expect(createCommentMock).not.toHaveBeenCalled();
    });

    it('clears draft and errors on Escape and keeps focus', async () => {
        const user = userEvent.setup();
        createCommentMock.mockRejectedValue(new Error('fail'));
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'will clear');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        await waitFor(() => {
            expect(textarea).toHaveFocus();
        });

        await user.keyboard('{Escape}');

        expect(textarea).toHaveValue('');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(textarea).toHaveFocus();
    });

    it('clears draft and errors on Cancel and refocuses the textarea', async () => {
        const user = userEvent.setup();
        renderComposer();

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'draft');
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(textarea).toHaveValue('');
        expect(textarea).toHaveFocus();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('resets draft and errors when diagramId changes without remounting', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <CommentsComposer
                diagramId="42"
                target={{ targetType: 'diagram', targetId: null }}
            />
        );

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'diagram A draft');
        expect(textarea).toHaveValue('diagram A draft');

        rerender(
            <CommentsComposer
                diagramId="99"
                target={{ targetType: 'diagram', targetId: null }}
            />
        );

        expect(screen.getByRole('textbox')).toHaveValue('');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('0 / 2000')).toBeInTheDocument();
    });

    it('does not clear the new diagram draft when a stale request resolves', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);

        const { rerender } = render(
            <CommentsComposer
                diagramId="42"
                target={{ targetType: 'diagram', targetId: null }}
            />
        );

        await user.type(screen.getByRole('textbox'), 'old diagram');
        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenCalledTimes(1);

        rerender(
            <CommentsComposer
                diagramId="99"
                target={{ targetType: 'diagram', targetId: null }}
            />
        );

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'new diagram draft');

        await act(async () => {
            pending.resolve(createdComment({ body: 'old diagram' }));
        });

        expect(textarea).toHaveValue('new diagram draft');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not warn about state updates when unmounted during pending success', async () => {
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { unmount } = renderComposer();
        const textarea = screen.getByRole('textbox');
        await userEvent.setup().type(textarea, 'unmount success');
        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Post' }));

        unmount();

        await act(async () => {
            pending.resolve(createdComment({ body: 'unmount success' }));
        });

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        expect(messages).not.toMatch(
            /Can't perform a React state update on a component/i
        );

        consoleError.mockRestore();
    });

    it('does not warn about state updates when unmounted during pending failure', async () => {
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { unmount } = renderComposer();
        await userEvent
            .setup()
            .type(screen.getByRole('textbox'), 'unmount fail');
        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Post' }));

        unmount();

        await act(async () => {
            pending.reject(new Error('network'));
        });

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        expect(messages).not.toMatch(
            /Can't perform a React state update on a component/i
        );

        consoleError.mockRestore();
    });

    it('forwards a non-diagram target prop to createComment', async () => {
        const user = userEvent.setup();
        createCommentMock.mockResolvedValue(
            createdComment({
                targetType: 'table',
                targetId: 'tbl-1',
            })
        );

        renderComposer({
            target: { targetType: 'table', targetId: 'tbl-1' },
        });

        await user.type(screen.getByRole('textbox'), 'Table note');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        expect(createCommentMock).toHaveBeenCalledWith({
            targetType: 'table',
            targetId: 'tbl-1',
            body: 'Table note',
        });
    });

    it('does not clear the new target draft when a stale same-diagram request succeeds', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);

        const targetA: DiagramCommentTarget = {
            targetType: 'table',
            targetId: 'table-a',
        };
        const targetB: DiagramCommentTarget = {
            targetType: 'field',
            targetId: 'field-b',
        };

        const { rerender } = render(
            <CommentsComposer diagramId="42" target={targetA} />
        );

        await user.type(screen.getByRole('textbox'), 'target A draft');
        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenCalledTimes(1);

        rerender(<CommentsComposer diagramId="42" target={targetB} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('');
        await user.type(textarea, 'target B draft');
        textarea.blur();
        expect(textarea).not.toHaveFocus();

        await act(async () => {
            pending.resolve(
                createdComment({
                    targetType: 'table',
                    targetId: 'table-a',
                    body: 'target A draft',
                })
            );
        });

        expect(textarea).toHaveValue('target B draft');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(textarea).not.toHaveFocus();
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();
    });

    it('does not show a stale create error when a same-diagram target request fails', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);

        const targetA: DiagramCommentTarget = {
            targetType: 'table',
            targetId: 'table-a',
        };
        const targetB: DiagramCommentTarget = {
            targetType: 'field',
            targetId: 'field-b',
        };

        const { rerender } = render(
            <CommentsComposer diagramId="42" target={targetA} />
        );

        await user.type(screen.getByRole('textbox'), 'target A fail');
        await user.click(screen.getByRole('button', { name: 'Post' }));

        rerender(<CommentsComposer diagramId="42" target={targetB} />);

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'target B ready');

        await act(async () => {
            pending.reject(new Error('stale target failure'));
        });

        expect(textarea).toHaveValue('target B ready');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Could not post the message. Please try again.')
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();

        createCommentMock.mockResolvedValue(
            createdComment({
                targetType: 'field',
                targetId: 'field-b',
                body: 'target B ready',
            })
        );
        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenLastCalledWith({
            targetType: 'field',
            targetId: 'field-b',
            body: 'target B ready',
        });
    });

    it('does not clear the new diagram draft when a stale request rejects', async () => {
        const user = userEvent.setup();
        const pending = deferred<DiagramComment>();
        createCommentMock.mockReturnValue(pending.promise);

        const { rerender } = render(
            <CommentsComposer
                diagramId="42"
                target={{ targetType: 'diagram', targetId: null }}
            />
        );

        await user.type(screen.getByRole('textbox'), 'old diagram fail');
        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenCalledTimes(1);

        rerender(
            <CommentsComposer
                diagramId="84"
                target={{ targetType: 'diagram', targetId: null }}
            />
        );

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'diagram 84 draft');

        await act(async () => {
            pending.reject(new Error('diagram 42 network'));
        });

        expect(textarea).toHaveValue('diagram 84 draft');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Could not post the message. Please try again.')
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();
    });

    it('counts an emoji as one Unicode code point in the counter', () => {
        renderComposer();
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: '😀' } });

        expect(screen.getByText('1 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('1 of 2000 characters used')
        ).toBeInTheDocument();
        expect('😀'.length).toBe(2);
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();
    });

    it('accepts exactly 2000 emoji code points and rejects 2001', async () => {
        const user = userEvent.setup();
        createCommentMock.mockResolvedValue(createdComment());
        renderComposer();

        const textarea = screen.getByRole('textbox');
        const exact = '😀'.repeat(2000);
        fireEvent.change(textarea, { target: { value: exact } });

        expect(screen.getByText('2000 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('2000 of 2000 characters used')
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith({
            targetType: 'diagram',
            targetId: null,
            body: exact,
        });

        fireEvent.change(textarea, {
            target: { value: '😀'.repeat(2001) },
        });
        expect(screen.getByText('2001 / 2000')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
        expect(
            screen.getByText('Messages cannot exceed 2000 characters.')
        ).toBeInTheDocument();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
    });

    it('counts CJK, combining marks, and ZWJ sequences as Unicode code points', () => {
        renderComposer();
        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, { target: { value: '中文' } });
        expect(screen.getByText('2 / 2000')).toBeInTheDocument();

        // e + combining acute = two code points (not one grapheme).
        fireEvent.change(textarea, { target: { value: 'e\u0301' } });
        expect(screen.getByText('2 / 2000')).toBeInTheDocument();

        // Family ZWJ sequence: man, ZWJ, woman, ZWJ, girl = 5 code points.
        const family = '👨‍👩‍👧';
        fireEvent.change(textarea, { target: { value: family } });
        expect(Array.from(family).length).toBe(5);
        expect(screen.getByText('5 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('5 of 2000 characters used')
        ).toBeInTheDocument();
    });

    it('excludes leading and trailing whitespace from the counter and validation', async () => {
        const user = userEvent.setup();
        createCommentMock.mockResolvedValue(createdComment());
        renderComposer();

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, {
            target: { value: '  hello world  ' },
        });

        expect(screen.getByText('11 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('11 of 2000 characters used')
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Post' }));
        expect(createCommentMock).toHaveBeenCalledWith({
            targetType: 'diagram',
            targetId: null,
            body: 'hello world',
        });
    });

    it('counts internal spaces and newlines toward the limit', () => {
        renderComposer();
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, {
            target: { value: 'a b\nc' },
        });

        expect(screen.getByText('5 / 2000')).toBeInTheDocument();
        expect(
            screen.getByLabelText('5 of 2000 characters used')
        ).toBeInTheDocument();
    });

    it('does not call createComment for 2001 Unicode code points with padding', () => {
        renderComposer();
        const textarea = screen.getByRole('textbox');
        // Raw string is longer in UTF-16/units, but trimmed Unicode count is 2001.
        fireEvent.change(textarea, {
            target: { value: `  ${'x'.repeat(2001)}  ` },
        });

        expect(screen.getByText('2001 / 2000')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
        expect(
            screen.getByText('Messages cannot exceed 2000 characters.')
        ).toBeInTheDocument();
        expect(createCommentMock).not.toHaveBeenCalled();
    });
});
