import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import type * as DiagramMembersApi from '@/lib/api/diagram-members';
import type { DiagramMemberResource } from '@/lib/api/diagram-members';

const { addDiagramMemberMock } = vi.hoisted(() => ({
    addDiagramMemberMock: vi.fn(),
}));

vi.mock('@/lib/api/diagram-members', async (importOriginal) => {
    const actual = await importOriginal<typeof DiagramMembersApi>();
    return {
        ...actual,
        addDiagramMember: addDiagramMemberMock,
        updateDiagramMember: vi.fn(),
        removeDiagramMember: vi.fn(),
    };
});

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
    }),
}));

import { ShareAddMemberDialog } from '../share-add-member-dialog';

const member: DiagramMemberResource = {
    id: 1,
    role: 'editor',
    user: {
        id: 2,
        firstName: 'Alexis',
        lastName: 'Renart',
        fullName: 'Alexis Renart',
        email: 'alexis@example.com',
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

describe('ShareAddMemberDialog', () => {
    beforeEach(() => {
        addDiagramMemberMock.mockReset();
        addDiagramMemberMock.mockResolvedValue(member);
    });

    it('submits the collaborator email and role', async () => {
        const user = userEvent.setup();
        const onMemberAdded = vi.fn();
        const onOpenChange = vi.fn();

        render(
            <ShareAddMemberDialog
                diagramId="42"
                open
                onOpenChange={onOpenChange}
                onMemberAdded={onMemberAdded}
            />
        );

        await user.type(screen.getByLabelText('Email'), 'alexis@example.com');
        await user.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => {
            expect(addDiagramMemberMock).toHaveBeenCalledWith('42', {
                email: 'alexis@example.com',
                role: 'editor',
            });
        });
        expect(onMemberAdded).toHaveBeenCalledWith(member);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
