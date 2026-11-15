export const focusFirstInvalid = (element: HTMLElement | null): void => {
    if (element === null) {
        return;
    }

    element.focus();
    element.scrollIntoView({ block: 'nearest' });
};
