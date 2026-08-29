const selectTextareaContents = (
    textarea: HTMLTextAreaElement,
    text: string
): void => {
    textarea.value = text;
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const selection = window.getSelection();
    if (!selection) {
        return;
    }

    const range = document.createRange();
    range.selectNodeContents(textarea);
    selection.removeAllRanges();
    selection.addRange(range);
};

const copyWithLegacyExecCommand = (text: string): boolean => {
    window.getSelection()?.removeAllRanges();

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('aria-hidden', 'true');
    textarea.tabIndex = -1;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    try {
        selectTextareaContents(textarea, text);
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        window.getSelection()?.removeAllRanges();
        document.body.removeChild(textarea);
    }
};

export const copyTextFromElement = (element: HTMLTextAreaElement): boolean => {
    const text = element.value;
    if (!text) {
        return false;
    }

    window.getSelection()?.removeAllRanges();

    try {
        selectTextareaContents(element, text);
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        window.getSelection()?.removeAllRanges();
    }
};

export const copyTextToClipboard = async (
    text: string,
    options?: { fallbackElement?: HTMLTextAreaElement | null }
): Promise<boolean> => {
    if (!text) {
        return false;
    }

    if (window.isSecureContext && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall back for permission errors or transient API failures.
        }
    }

    if (options?.fallbackElement) {
        options.fallbackElement.value = text;
        if (copyTextFromElement(options.fallbackElement)) {
            return true;
        }
    }

    return copyWithLegacyExecCommand(text);
};
