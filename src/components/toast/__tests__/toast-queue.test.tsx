import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/i18n';
import { en } from '@/i18n/locales/en';
import { Toaster } from '@/components/toast/toaster';
import { dismiss, toast } from '@/components/toast/use-toast';

const openToasts = () => document.querySelectorAll('li[data-state="open"]');

const show = (props: Parameters<typeof toast>[0]): ReturnType<typeof toast> => {
    let handle: ReturnType<typeof toast> | undefined;
    act(() => {
        handle = toast(props);
    });
    if (handle === undefined) {
        throw new Error('Toast handle was not created');
    }
    return handle;
};

describe('toast queue', () => {
    beforeAll(async () => {
        await initI18n();
    });

    afterEach(() => {
        dismiss();
    });

    it('shows an error and a status toast at the same time', () => {
        render(<Toaster />);

        show({ title: 'Saved', duration: 60_000 });
        show({
            title: 'Save failed',
            variant: 'destructive',
            duration: 60_000,
        });

        const visible = openToasts();
        expect(visible).toHaveLength(2);
        expect(visible[0]).toHaveTextContent('Saved');
        expect(visible[1]).toHaveTextContent('Save failed');
        expect(visible[1]).toHaveClass('destructive');
    });

    it('queues a second error until the first is dismissed', () => {
        render(<Toaster />);

        const first = show({
            title: 'First error',
            variant: 'destructive',
            duration: 60_000,
        });
        show({
            title: 'Second error',
            variant: 'destructive',
            duration: 60_000,
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('First error');

        act(() => {
            first.dismiss();
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Second error');
    });

    it('queues a second status toast behind the first', () => {
        render(<Toaster />);

        const first = show({ title: 'First status', duration: 60_000 });
        show({ title: 'Second status', duration: 60_000 });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('First status');

        act(() => {
            first.dismiss();
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Second status');
    });

    it('does not dedupe matching text without a dedupe key', () => {
        render(<Toaster />);

        const first = show({
            title: 'Identical',
            variant: 'destructive',
            duration: 60_000,
        });
        show({
            title: 'Identical',
            variant: 'destructive',
            duration: 60_000,
        });

        expect(openToasts()).toHaveLength(1);

        act(() => {
            first.dismiss();
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Identical');
    });

    it('updates a visible toast with the same dedupe key', () => {
        render(<Toaster />);

        show({
            title: 'Saving',
            dedupeKey: 'validation:register',
            variant: 'destructive',
            duration: 60_000,
        });
        show({
            title: 'Still saving',
            dedupeKey: 'validation:register',
            variant: 'destructive',
            duration: 60_000,
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Still saving');
        expect(document.body).not.toHaveTextContent('Saving');
    });

    it('updates a queued toast in place and keeps the following item', () => {
        render(<Toaster />);

        const first = show({
            title: 'Visible',
            variant: 'destructive',
            duration: 60_000,
        });
        show({
            title: 'Queued',
            dedupeKey: 'diagram:save-failed:1',
            variant: 'destructive',
            duration: 60_000,
        });
        show({
            title: 'After',
            variant: 'destructive',
            duration: 60_000,
        });
        const updated = show({
            title: 'Queued updated',
            dedupeKey: 'diagram:save-failed:1',
            variant: 'destructive',
            duration: 60_000,
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Visible');

        act(() => {
            first.dismiss();
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Queued updated');

        act(() => {
            updated.dismiss();
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('After');
    });

    it('keeps at most two toasts in the document', () => {
        render(<Toaster />);

        show({ title: 'Status 1', duration: 60_000 });
        show({ title: 'Status 2', duration: 60_000 });
        show({
            title: 'Error 1',
            variant: 'destructive',
            duration: 60_000,
        });
        show({
            title: 'Error 2',
            variant: 'destructive',
            duration: 60_000,
        });

        expect(openToasts()).toHaveLength(2);
        expect(document.body).toHaveTextContent('Status 1');
        expect(document.body).toHaveTextContent('Error 1');
        expect(document.body).not.toHaveTextContent('Status 2');
        expect(document.body).not.toHaveTextContent('Error 2');
    });

    it('updates a toast in place and can move it to the error lane', () => {
        render(<Toaster />);

        const pending = show({ title: 'Loading', duration: Infinity });

        act(() => {
            pending.update({ title: 'Saved', duration: 60_000 });
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Saved');
        expect(openToasts()[0]).not.toHaveClass('destructive');

        act(() => {
            pending.update({
                title: 'Failed',
                variant: 'destructive',
                duration: 60_000,
            });
        });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Failed');
        expect(openToasts()[0]).toHaveClass('destructive');
    });

    it('assigns semantic variants to the danger and status lanes', () => {
        render(<Toaster />);

        show({ title: 'Saved', variant: 'success', duration: 60_000 });
        show({ title: 'Failed', variant: 'danger', duration: 60_000 });

        let visible = openToasts();
        expect(visible).toHaveLength(2);
        expect(visible[0]).toHaveClass('success');
        expect(visible[1]).toHaveClass('danger');

        dismiss();
        show({ title: 'Careful', variant: 'warning', duration: 60_000 });
        show({ title: 'Failed', variant: 'danger', duration: 60_000 });
        visible = openToasts();
        expect(visible).toHaveLength(2);
        expect(visible[0]).toHaveClass('warning');
        expect(visible[1]).toHaveClass('danger');

        dismiss();
        show({ title: 'Note', variant: 'info', duration: 60_000 });
        show({ title: 'Failed', variant: 'danger', duration: 60_000 });
        visible = openToasts();
        expect(visible).toHaveLength(2);
        expect(visible[0]).toHaveClass('info');
        expect(visible[1]).toHaveClass('danger');
    });

    it('queues status variants in one lane', () => {
        render(<Toaster />);

        const first = show({
            title: 'Saved',
            variant: 'success',
            duration: 60_000,
        });
        show({ title: 'Careful', variant: 'warning', duration: 60_000 });
        show({ title: 'Note', variant: 'info', duration: 60_000 });

        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Saved');

        act(() => {
            first.dismiss();
        });
        expect(openToasts()[0]).toHaveTextContent('Careful');
    });

    it('closes only the clicked toast and promotes the same lane', () => {
        render(<Toaster />);

        show({ title: 'Saved', variant: 'success', duration: 60_000 });
        show({ title: 'First danger', variant: 'danger', duration: 60_000 });
        show({ title: 'Second danger', variant: 'danger', duration: 60_000 });

        const closeButtons = screen.getAllByRole('button', {
            name: en.translation.toast.close,
        });
        expect(closeButtons).toHaveLength(2);

        const dangerToast = Array.from(openToasts()).find((item) =>
            item.textContent?.includes('First danger')
        );
        const dangerClose = dangerToast?.querySelector('button');
        expect(dangerClose).toBeInstanceOf(HTMLButtonElement);
        fireEvent.click(dangerClose as HTMLButtonElement);

        const visible = openToasts();
        expect(visible).toHaveLength(2);
        expect(document.body).toHaveTextContent('Saved');
        expect(document.body).toHaveTextContent('Second danger');
        expect(document.body).not.toHaveTextContent('First danger');
    });
});

describe('toast dismissal timer', () => {
    beforeAll(async () => {
        await initI18n();
    });

    afterEach(() => {
        dismiss();
        vi.useRealTimers();
    });

    const region = (): HTMLElement => {
        const toastRegion = document.querySelector(
            '[aria-label^="Notifications"]'
        );
        if (!(toastRegion instanceof HTMLElement)) {
            throw new Error('Toast region was not rendered');
        }
        return toastRegion;
    };

    it('auto-dismisses, pauses while hovered, and resumes the remaining time', () => {
        vi.useFakeTimers();
        render(<Toaster />);

        show({ title: 'Brief', variant: 'info', duration: 5_000 });
        act(() => {
            vi.advanceTimersByTime(5_000);
        });
        expect(openToasts()).toHaveLength(0);

        show({ title: 'Stay', variant: 'danger', duration: 5_000 });
        act(() => {
            vi.advanceTimersByTime(1_000);
            region().dispatchEvent(new Event('pointermove'));
        });
        act(() => {
            vi.advanceTimersByTime(20_000);
        });
        expect(openToasts()).toHaveLength(1);
        expect(openToasts()[0]).toHaveTextContent('Stay');

        act(() => {
            region().dispatchEvent(new Event('pointerleave'));
            vi.advanceTimersByTime(4_000);
        });
        expect(openToasts()).toHaveLength(0);
    });

    it('closes a hovered toast immediately and shows the queued danger toast', () => {
        vi.useFakeTimers();
        render(<Toaster />);

        show({ title: 'Visible', variant: 'danger', duration: 5_000 });
        show({ title: 'Queued', variant: 'danger', duration: 5_000 });
        show({ title: 'Saved', variant: 'success', duration: 60_000 });

        act(() => {
            region().dispatchEvent(new Event('pointermove'));
            vi.advanceTimersByTime(20_000);
        });
        expect(document.body).toHaveTextContent('Visible');

        const dangerToast = Array.from(openToasts()).find((item) =>
            item.textContent?.includes('Visible')
        );
        fireEvent.click(
            dangerToast?.querySelector('button') as HTMLButtonElement
        );

        expect(document.body).not.toHaveTextContent('Visible');
        expect(document.body).toHaveTextContent('Queued');
        expect(document.body).toHaveTextContent('Saved');
    });

    it('pauses while a toast control is focused', () => {
        vi.useFakeTimers();
        render(<Toaster />);

        show({ title: 'Focused', variant: 'warning', duration: 5_000 });
        const closeButton = screen.getByRole('button', {
            name: en.translation.toast.close,
        });
        act(() => {
            closeButton.focus();
            region().dispatchEvent(
                new FocusEvent('focusin', { bubbles: true })
            );
            vi.advanceTimersByTime(20_000);
        });
        expect(openToasts()).toHaveLength(1);

        act(() => {
            region().dispatchEvent(
                new FocusEvent('focusout', {
                    bubbles: true,
                    relatedTarget: document.body,
                })
            );
            vi.advanceTimersByTime(5_000);
        });
        expect(openToasts()).toHaveLength(0);
    });
});
