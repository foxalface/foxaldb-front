import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import type { UseDiagramCommentsResult } from '@/hooks/use-diagram-comments';
import { en } from '@/i18n/locales/en';
import {
    isEnglishTimeAgoLocaleId,
    OFFICIAL_APPLICATION_LOCALES,
    resolveTimeAgoLocale,
} from '../comment-timeago-locale';
import { format, register as registerLocale } from 'timeago.js';

const { commentsState, i18nState } = vi.hoisted(() => ({
    commentsState: {
        current: {
            comments: [],
            status: 'idle',
            error: null,
            isActive: true,
            diagramId: '42',
            reload: vi.fn(async () => undefined),
        } as UseDiagramCommentsResult,
    },
    i18nState: {
        language: 'en',
    },
}));

vi.mock('@/hooks/use-diagram-comments', () => ({
    useDiagramComments: () => commentsState.current,
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({ effectiveTheme: 'light' }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
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
            return typeof current === 'string' ? current : key;
        },
        i18n: i18nState,
    }),
}));

vi.mock('timeago-react', () => ({
    default: ({
        datetime,
        locale,
    }: {
        datetime: Date | string;
        locale?: string;
    }) => {
        const value =
            datetime instanceof Date
                ? datetime.toISOString()
                : String(datetime);
        return (
            <span data-testid="relative-time" data-locale={locale ?? ''}>
                {value}
            </span>
        );
    },
}));

import { CommentsSection } from '../comments-section';

const createComment = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice Wonder' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

const setState = (partial: Partial<UseDiagramCommentsResult>) => {
    commentsState.current = {
        comments: [],
        status: 'idle',
        error: null,
        isActive: true,
        diagramId: '42',
        reload: vi.fn(async () => undefined),
        ...partial,
    };
};

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

describe('CommentsSection', () => {
    beforeEach(() => {
        i18nState.language = 'en';
        setState({ isActive: true, status: 'ready', comments: [] });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the inactive state without attempting a request', () => {
        const reload = vi.fn(async () => undefined);
        setState({
            isActive: false,
            status: 'idle',
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        expect(screen.getByText('Discussions unavailable')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Discussions are only available on authenticated cloud diagrams.'
            )
        ).toBeInTheDocument();
        expect(reload).not.toHaveBeenCalled();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows initial loading when status is loading and there are no comments', () => {
        setState({ status: 'loading', comments: [] });

        render(<CommentsSection />);

        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Loading discussions…')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows the empty ready state', () => {
        setState({ status: 'ready', comments: [] });

        render(<CommentsSection />);

        expect(screen.getByText('No discussions yet')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Conversations about this diagram will appear here.'
            )
        ).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows a load error with retry and never renders the raw error', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setState({
            status: 'error',
            error: new Error('secret backend failure XYZ'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        expect(
            screen.getByText('Could not load discussions')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('secret backend failure XYZ')
        ).not.toBeInTheDocument();

        const retry = screen.getByRole('button', { name: 'Retry' });
        await user.click(retry);

        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('disables Retry while reload is pending', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        setState({
            status: 'error',
            error: new Error('fail'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
        });

        expect(retry).toBeDisabled();
        expect(reload).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending.resolve();
        });

        await waitFor(() => {
            expect(retry).not.toBeDisabled();
        });
    });

    it('invokes reload only once for two same-tick Retry clicks', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        setState({
            status: 'error',
            error: new Error('fail'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
            retry.click();
        });

        expect(reload).toHaveBeenCalledTimes(1);

        await act(async () => {
            pending.resolve();
        });
    });

    it('handles rejected reload without unhandled rejection and re-enables Retry', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        const unhandled: unknown[] = [];
        const onUnhandled = (reason: unknown) => {
            unhandled.push(reason);
        };
        process.on('unhandledRejection', onUnhandled);

        setState({
            status: 'error',
            error: new Error('visible provider error'),
            comments: [],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
        });

        await act(async () => {
            pending.reject(new Error('network down'));
        });

        await waitFor(() => {
            expect(retry).not.toBeDisabled();
        });

        expect(
            screen.getByText('Could not load discussions')
        ).toBeInTheDocument();
        expect(screen.queryByText('network down')).not.toBeInTheDocument();
        expect(
            screen.queryByText('visible provider error')
        ).not.toBeInTheDocument();
        expect(unhandled).toHaveLength(0);

        process.off('unhandledRejection', onUnhandled);
    });

    it('does not warn about state updates when unmounted during pending reload', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        setState({
            status: 'error',
            error: new Error('fail'),
            comments: [],
            reload,
        });

        const { unmount } = render(<CommentsSection />);
        const retry = screen.getByRole('button', { name: 'Retry' });

        await act(async () => {
            retry.click();
        });

        unmount();

        await act(async () => {
            pending.resolve();
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

    it('keeps existing comments visible while reloading', () => {
        setState({
            status: 'loading',
            comments: [createComment({ id: 1, body: 'Still here' })],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Still here')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(
            screen.queryByText('Loading discussions…')
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('status', { name: 'Loading discussions…' })
        ).toBeInTheDocument();
    });

    it('keeps existing comments visible on reload error and offers retry', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setState({
            status: 'error',
            error: new Error('raw reload boom'),
            comments: [createComment({ id: 1, body: 'Persisted message' })],
            reload,
        });

        render(<CommentsSection />);

        expect(screen.getByText('Persisted message')).toBeInTheDocument();
        expect(screen.queryByText('raw reload boom')).not.toBeInTheDocument();

        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);

        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('keeps existing comments visible while a reload retry is pending', async () => {
        const pending = deferred<void>();
        const reload = vi.fn(() => pending.promise);
        setState({
            status: 'error',
            error: new Error('reload failed'),
            comments: [createComment({ id: 1, body: 'Keep me' })],
            reload,
        });

        render(<CommentsSection />);

        const retry = screen.getByRole('button', { name: 'Retry' });
        await act(async () => {
            retry.click();
        });

        expect(screen.getByText('Keep me')).toBeInTheDocument();
        expect(retry).toBeDisabled();
        expect(screen.queryByText('reload failed')).not.toBeInTheDocument();

        await act(async () => {
            pending.resolve();
        });
    });

    it('renders comments in received order as a semantic list', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, body: 'First' }),
                createComment({ id: 2, body: 'Second' }),
                createComment({ id: 3, body: 'Third' }),
            ],
        });

        render(<CommentsSection />);

        const list = screen.getByRole('list');
        expect(list).toHaveAttribute(
            'aria-labelledby',
            'comments-section-heading'
        );
        const items = within(list).getAllByRole('listitem');
        expect(items).toHaveLength(3);
        expect(items.map((item) => item.textContent)).toEqual(
            expect.arrayContaining([
                expect.stringContaining('First'),
                expect.stringContaining('Second'),
                expect.stringContaining('Third'),
            ])
        );
        expect(items[0].textContent).toContain('First');
        expect(items[1].textContent).toContain('Second');
        expect(items[2].textContent).toContain('Third');
    });

    it('renders known author name and initials', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    user: { id: 7, name: 'Alice Wonder' },
                }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Alice Wonder')).toBeInTheDocument();
        expect(screen.getByText('AW')).toBeInTheDocument();
    });

    it('renders deleted author fallback', () => {
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, user: null })],
        });

        render(<CommentsSection />);

        expect(screen.getByText('Deleted user')).toBeInTheDocument();
        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('renders relative and accessible exact timestamps with locale', () => {
        const createdAt = '2026-01-05T10:00:00.000Z';
        i18nState.language = 'pt_BR';
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, createdAt })],
        });

        render(<CommentsSection />);

        expect(screen.getByTestId('relative-time')).toHaveAttribute(
            'data-locale',
            'pt_BR'
        );

        const time = screen.getByText(
            (_, element) => element?.tagName === 'TIME'
        );
        expect(time).toHaveAttribute('dateTime', createdAt);
        expect(time).toHaveAttribute('title');
        expect(time.getAttribute('title')).toBeTruthy();
    });

    it('updates the TimeAgo locale when the i18n language changes', () => {
        i18nState.language = 'fr';
        setState({
            status: 'ready',
            comments: [createComment({ id: 1 })],
        });

        const { rerender } = render(<CommentsSection />);
        expect(screen.getByTestId('relative-time')).toHaveAttribute(
            'data-locale',
            'fr'
        );

        i18nState.language = 'ko_KR';
        rerender(<CommentsSection />);
        expect(screen.getByTestId('relative-time')).toHaveAttribute(
            'data-locale',
            'ko'
        );
    });

    it('resolves all 22 official locales without English fallback for non-English codes', () => {
        for (const code of OFFICIAL_APPLICATION_LOCALES) {
            const resolved = resolveTimeAgoLocale(code);
            expect(resolved.lang).toBeTruthy();
            expect(resolved.locale).toEqual(expect.any(Function));

            if (code === 'en') {
                expect(resolved.lang).toBe('en_US');
            } else {
                expect(isEnglishTimeAgoLocaleId(resolved.lang)).toBe(false);
            }
        }
    });

    it('maps normalized locale codes to the correct TimeAgo ids', () => {
        expect(resolveTimeAgoLocale('ko_KR').lang).toBe('ko');
        expect(resolveTimeAgoLocale('pt_BR').lang).toBe('pt_BR');
        expect(resolveTimeAgoLocale('id_ID').lang).toBe('id_ID');
        expect(resolveTimeAgoLocale('zh_CN').lang).toBe('zh_CN');
        expect(resolveTimeAgoLocale('zh_TW').lang).toBe('zh_TW');
        expect(resolveTimeAgoLocale('hi').lang).toBe('hi_IN');
        expect(resolveTimeAgoLocale('bn').lang).toBe('bn_IN');
    });

    it.each([
        ['hr', 'hr', /prije/],
        ['ne', 'ne', /मिनेट|अघि/],
        ['mr', 'mr', /मिनिट|पूर्वी/],
        ['te', 'te', /నిమిష|క్రితం/],
        ['gu', 'gu', /મિનિટ|પહેલાં/],
    ] as const)(
        'registers and formats %s with a localized relative-time locale',
        (appCode, expectedLang, localizedPattern) => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const { locale, lang } = resolveTimeAgoLocale(appCode);
            expect(lang).toBe(expectedLang);
            expect(isEnglishTimeAgoLocaleId(lang)).toBe(false);

            registerLocale(lang, locale);
            const formatted = format(fiveMinutesAgo, lang);
            expect(formatted).toMatch(localizedPattern);
            expect(formatted.toLowerCase()).not.toMatch(/\bago\b/);
            expect(formatted.toLowerCase()).not.toMatch(/\bminute/);
        }
    );

    it('falls back to en_US only for genuinely unknown language codes', () => {
        expect(resolveTimeAgoLocale('xyz-unknown')).toMatchObject({
            lang: 'en_US',
        });
        expect(resolveTimeAgoLocale('hr').lang).toBe('hr');
        expect(resolveTimeAgoLocale('ne').lang).toBe('ne');
        expect(resolveTimeAgoLocale('mr').lang).toBe('mr');
        expect(resolveTimeAgoLocale('te').lang).toBe('te');
        expect(resolveTimeAgoLocale('gu').lang).toBe('gu');
    });

    it('does not render a time element for invalid timestamps', () => {
        setState({
            status: 'ready',
            comments: [
                createComment({ id: 1, createdAt: 'not-a-real-timestamp' }),
            ],
        });

        render(<CommentsSection />);

        expect(screen.queryByTestId('relative-time')).not.toBeInTheDocument();
        expect(
            screen.queryByText((_, element) => element?.tagName === 'TIME')
        ).not.toBeInTheDocument();
    });

    it.each([
        ['diagram', null, 'Diagram discussion'],
        ['table', 'tbl-1', 'Table discussion'],
        ['field', 'fld-1', 'Field discussion'],
        ['relationship', 'rel-1', 'Relationship discussion'],
    ] as const)(
        'renders %s target context without raw target ids',
        (targetType, targetId, label) => {
            setState({
                status: 'ready',
                comments: [
                    createComment({
                        id: 1,
                        targetType,
                        targetId,
                        body: 'Hello',
                    }),
                ],
            });

            render(<CommentsSection />);

            expect(screen.getByText(label)).toBeInTheDocument();
            if (targetId) {
                expect(screen.queryByText(targetId)).not.toBeInTheDocument();
            }
        }
    );

    it('preserves multiline bodies and long-word wrapping classes', () => {
        const longWord =
            'supercalifragilisticexpialidocioussupercalifragilisticexpialidocious';
        setState({
            status: 'ready',
            comments: [
                createComment({
                    id: 1,
                    body: `line one\nline two\n${longWord}`,
                }),
            ],
        });

        render(<CommentsSection />);

        const body = screen.getByText((_, element) => {
            return (
                element?.tagName === 'P' &&
                (element.textContent?.includes('line one') ?? false) &&
                (element.textContent?.includes('line two') ?? false)
            );
        });

        expect(body).toHaveClass('whitespace-pre-wrap');
        expect(body).toHaveClass('break-words');
        expect(body.className).toMatch(
            /overflow-wrap:anywhere|\[overflow-wrap:anywhere\]/
        );
        expect(body.textContent).toContain('line one\nline two');
    });

    it('renders HTML/script-like content as text only', () => {
        const malicious = '<script>alert(1)</script>';
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, body: malicious })],
        });

        const { container } = render(<CommentsSection />);

        expect(screen.getByText(malicious)).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
        expect(container.innerHTML).toContain('&lt;script&gt;');
    });

    it('has an accessible heading and bounded scroll area without mutation controls', () => {
        setState({
            status: 'ready',
            comments: [createComment({ id: 1, body: 'Hello' })],
        });

        render(<CommentsSection />);

        const heading = screen.getByRole('heading', { name: 'Discussions' });
        expect(heading).toHaveAttribute('id', 'comments-section-heading');

        const section = heading.closest('section');
        expect(section).toHaveAttribute(
            'aria-labelledby',
            'comments-section-heading'
        );

        expect(screen.getByTestId('comments-scroll-area')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /delete|edit|send|post/i })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('ensures interactive controls have accessible names', async () => {
        const user = userEvent.setup();
        const reload = vi.fn(async () => undefined);
        setState({
            status: 'error',
            comments: [],
            error: new Error('nope'),
            reload,
        });

        render(<CommentsSection />);

        const buttons = screen.getAllByRole('button');
        for (const button of buttons) {
            expect(button).toHaveAccessibleName();
        }

        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not show composer, filters, or counters', () => {
        setState({
            status: 'ready',
            comments: [createComment({ id: 1 }), createComment({ id: 2 })],
        });

        const { container } = render(<CommentsSection />);

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.queryByText(/filter/i)).not.toBeInTheDocument();
        expect(within(container).queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
});
