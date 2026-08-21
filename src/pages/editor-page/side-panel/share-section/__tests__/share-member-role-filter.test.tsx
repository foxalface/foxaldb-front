import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import type { DiagramMemberRole } from '@/lib/api/diagram-members';
import { ShareMemberRoleFilter } from '../share-member-role-filter';
import { DEFAULT_SELECTED_MEMBER_ROLES } from '../filter-share-members';

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
        i18n: { language: 'en' },
    }),
}));

const renderWithProviders = (ui: React.ReactElement) =>
    render(<TooltipProvider>{ui}</TooltipProvider>);

const StatefulShareMemberRoleFilter: React.FC = () => {
    const [selectedRoles, setSelectedRoles] = useState<DiagramMemberRole[]>(
        DEFAULT_SELECTED_MEMBER_ROLES
    );

    return (
        <ShareMemberRoleFilter
            selectedRoles={selectedRoles}
            onSelectedRolesChange={setSelectedRoles}
        />
    );
};

describe('ShareMemberRoleFilter', () => {
    it('toggles selected roles', async () => {
        const user = userEvent.setup();

        renderWithProviders(<StatefulShareMemberRoleFilter />);

        await user.click(
            screen.getByRole('button', { name: 'Filter by collaborator role' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Editor' }));

        expect(
            screen.getByRole('checkbox', { name: 'Editor' })
        ).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Viewer' })).toBeChecked();
    });

    it('uses a stable trigger label', () => {
        renderWithProviders(
            <ShareMemberRoleFilter
                selectedRoles={['editor']}
                onSelectedRolesChange={vi.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Filter by collaborator role',
            })
        ).toHaveTextContent('Role');
    });

    it('selects all from the header checkbox when partially selected', async () => {
        const user = userEvent.setup();
        const onSelectedRolesChange = vi.fn();

        renderWithProviders(
            <ShareMemberRoleFilter
                selectedRoles={['editor']}
                onSelectedRolesChange={onSelectedRolesChange}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Filter by collaborator role' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select All' }));

        expect(onSelectedRolesChange).toHaveBeenCalledWith([
            'editor',
            'viewer',
        ]);
    });

    it('deselects all from the header checkbox when fully selected', async () => {
        const user = userEvent.setup();
        const onSelectedRolesChange = vi.fn();

        renderWithProviders(
            <ShareMemberRoleFilter
                selectedRoles={['editor', 'viewer']}
                onSelectedRolesChange={onSelectedRolesChange}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Filter by collaborator role' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select All' }));

        expect(onSelectedRolesChange).toHaveBeenCalledWith([]);
    });
});
