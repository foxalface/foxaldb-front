import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    copyTextFromElement,
    copyTextToClipboard,
} from '../copy-text-to-clipboard';

describe('copyTextToClipboard', () => {
    const originalClipboard = navigator.clipboard;
    const originalIsSecureContext = window.isSecureContext;

    beforeEach(() => {
        document.execCommand = vi.fn().mockReturnValue(true);
        window.getSelection = vi.fn().mockReturnValue({
            removeAllRanges: vi.fn(),
            addRange: vi.fn(),
        });
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard,
        });
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: originalIsSecureContext,
        });
        vi.restoreAllMocks();
    });

    it('uses the Clipboard API in a secure context', async () => {
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: true,
        });

        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        });

        await expect(copyTextToClipboard('SELECT 1')).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith('SELECT 1');
        expect(document.execCommand).not.toHaveBeenCalled();
    });

    it('falls back to execCommand when clipboard API is unavailable', async () => {
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: false,
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });

        await expect(copyTextToClipboard('SELECT 1')).resolves.toBe(true);
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('falls back when clipboard writeText rejects', async () => {
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: true,
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: vi.fn().mockRejectedValue(new Error('denied')),
            },
        });

        await expect(copyTextToClipboard('SELECT 1')).resolves.toBe(true);
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('selects the full fallback text before copying', async () => {
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: false,
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });

        const select = vi.fn();
        const setSelectionRange = vi.fn();
        const originalCreateElement = document.createElement.bind(document);
        const createElementSpy = vi
            .spyOn(document, 'createElement')
            .mockImplementation((tagName, options) => {
                const element = originalCreateElement(tagName, options);

                if (tagName === 'textarea') {
                    const textarea = element as HTMLTextAreaElement;
                    textarea.select = select;
                    textarea.setSelectionRange = setSelectionRange;
                    element.focus = vi.fn();
                }

                return element;
            });

        await copyTextToClipboard('line one\nline two');

        expect(select).toHaveBeenCalled();
        expect(setSelectionRange).toHaveBeenCalledWith(
            0,
            'line one\nline two'.length
        );

        createElementSpy.mockRestore();
    });

    it('copies from a persistent fallback textarea element', async () => {
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: false,
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });

        const textarea = document.createElement('textarea');
        textarea.value = 'full query';
        const select = vi.spyOn(textarea, 'select');
        const setSelectionRange = vi.spyOn(textarea, 'setSelectionRange');

        await expect(
            copyTextToClipboard('full query', { fallbackElement: textarea })
        ).resolves.toBe(true);

        expect(select).toHaveBeenCalled();
        expect(setSelectionRange).toHaveBeenCalledWith(0, 'full query'.length);
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
});

describe('copyTextFromElement', () => {
    beforeEach(() => {
        document.execCommand = vi.fn().mockReturnValue(true);
        window.getSelection = vi.fn().mockReturnValue({
            removeAllRanges: vi.fn(),
            addRange: vi.fn(),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns false for empty textarea values', () => {
        const textarea = document.createElement('textarea');
        expect(copyTextFromElement(textarea)).toBe(false);
    });
});
