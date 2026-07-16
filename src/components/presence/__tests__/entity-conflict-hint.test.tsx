import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EntityConflictHint } from '../entity-conflict-hint';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';

const createEditor = (
    overrides: Partial<RemoteEditingViewModel> &
        Pick<RemoteEditingViewModel, 'userId' | 'name'>
): RemoteEditingViewModel => ({
    initials: 'CO',
    colorClass: 'bg-red-500',
    borderColorClass: 'border-red-500',
    strokeColorClass: '!stroke-red-500',
    ringColorClass: 'ring-red-500',
    isSelf: false,
    ...overrides,
});

describe('EntityConflictHint', () => {
    it('renders nothing with an empty message', () => {
        const { container } = render(
            <EntityConflictHint
                message=""
                editors={[createEditor({ userId: 2, name: 'Alice' })]}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders nothing with no editors', () => {
        const { container } = render(
            <EntityConflictHint
                message="Alice is also editing this."
                editors={[]}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders the supplied message when active', () => {
        render(
            <EntityConflictHint
                message="Alice is also editing this."
                editors={[createEditor({ userId: 2, name: 'Alice' })]}
            />
        );

        expect(
            screen.getByText('Alice is also editing this.')
        ).toBeInTheDocument();
    });

    it('is passive and non-interactive', () => {
        const { container } = render(
            <EntityConflictHint
                message="Alice is also editing this."
                editors={[createEditor({ userId: 2, name: 'Alice' })]}
            />
        );

        const root = container.firstElementChild;
        expect(root).not.toBeNull();
        expect(root).toHaveClass('pointer-events-none');
        expect(root?.querySelectorAll('button, a, input').length).toBe(0);
        expect(root?.querySelector('[tabindex]')).toBeNull();
    });

    it('hides the decorative warning icon from assistive technology', () => {
        const { container } = render(
            <EntityConflictHint
                message="Alice is also editing this."
                editors={[createEditor({ userId: 2, name: 'Alice' })]}
            />
        );

        const icon = container.querySelector('svg');
        expect(icon).not.toBeNull();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
});
