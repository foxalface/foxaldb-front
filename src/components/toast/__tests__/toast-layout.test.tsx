import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { initI18n } from '@/i18n/i18n';
import { Toaster } from '@/components/toast/toaster';
import { dismiss, toast } from '@/components/toast/use-toast';

const openToasts = () => document.querySelectorAll('li[data-state="open"]');

const show = (props: Parameters<typeof toast>[0]) => {
    act(() => {
        toast({ duration: 60_000, ...props });
    });
};

describe('toast layout', () => {
    beforeAll(async () => {
        await initI18n();
    });

    it.each([
        ['success', 'success' as const],
        ['warning', 'warning' as const],
        ['info', 'info' as const],
        ['danger', 'danger' as const],
    ])('keeps %s message start-aligned beside the icon', (_label, variant) => {
        dismiss();
        render(<Toaster />);

        const description =
            'Second line of the toast should stay aligned with the first line.';
        show({
            title: 'Toast title',
            description,
            variant,
        });

        const toastRoot = openToasts()[0];
        expect(toastRoot).toBeTruthy();
        expect(toastRoot?.className).toContain('justify-start');
        expect(toastRoot?.className).not.toContain('justify-between');

        const title = screen.getByText('Toast title');
        const content = title.parentElement;

        expect(content?.className).toContain('flex-1');
        expect(content?.className).toContain('min-w-0');
        expect(content?.className).toContain('text-start');
        expect(screen.getByText(description)).toHaveClass('text-start');

        const icon = toastRoot?.querySelector('[data-slot="toast-icon"]');
        expect(icon).toBeTruthy();
        expect(icon?.className).toContain('shrink-0');
        expect(icon?.className).toContain('self-start');
        expect(icon?.className).toContain('items-center');
        expect(icon?.className).not.toContain('self-center');
        expect(toastRoot?.className).toContain('items-start');
        expect(toastRoot?.className).not.toContain('items-center');
    });

    it.each([
        ['success', 'bg-green-50', 'text-green-950'],
        ['warning', 'bg-amber-50', 'text-amber-950'],
        ['info', 'bg-background', 'text-foreground'],
        ['danger', 'bg-destructive', 'text-destructive-foreground'],
    ] as const)(
        'styles a %s toast with its semantic palette',
        (variant, background, foreground) => {
            dismiss();
            render(<Toaster />);

            show({ title: variant, variant });

            const toastRoot = screen.getByText(variant).closest('li');
            expect(toastRoot?.className).toContain(background);
            expect(toastRoot?.className).toContain(foreground);
            if (variant === 'info') {
                expect(toastRoot?.className).not.toContain('bg-green-50');
                expect(toastRoot?.className).not.toContain('bg-amber-50');
            }
            if (variant === 'danger') {
                expect(toastRoot?.className).toContain('destructive');
            }
        }
    );
});
