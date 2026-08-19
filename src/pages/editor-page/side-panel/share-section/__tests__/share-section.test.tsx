import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';

const { listDiagramMembersMock } = vi.hoisted(() => ({
    listDiagramMembersMock: vi.fn(),
}));

vi.mock('@/lib/api/diagram-members', () => ({
    listDiagramMembers: listDiagramMembersMock,
    DIAGRAM_MEMBER_ROLE_EDITOR: 'editor',
    DIAGRAM_MEMBER_ROLE_VIEWER: 'viewer',
    addDiagramMember: vi.fn(),
    updateDiagramMember: vi.fn(),
    removeDiagramMember: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            full_name: 'Owner User',
            email: 'owner@example.com',
        },
    }),
}));

vi.mock('react-router-dom', () => ({
    useParams: () => ({ diagramId: '42' }),
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
    }),
}));

import { ShareSection } from '../share-section';

describe('ShareSection', () => {
    beforeEach(() => {
        listDiagramMembersMock.mockReset();
        listDiagramMembersMock.mockResolvedValue([]);
    });

    it('renders collaborator and public link tabs', async () => {
        render(<ShareSection />);

        expect(
            screen.getByRole('tab', { name: 'Collaborators' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: 'Public link' })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(listDiagramMembersMock).toHaveBeenCalledWith('42');
        });
    });

    it('shows the public link placeholder when that tab is selected', async () => {
        const user = userEvent.setup();
        render(<ShareSection />);

        await user.click(screen.getByRole('tab', { name: 'Public link' }));

        expect(
            screen.getByText(
                'Share a read-only snapshot of your diagram with anyone who has the link.'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('Coming soon.')).toBeInTheDocument();
    });

    it('renders the owner card after members load', async () => {
        render(<ShareSection />);

        expect(await screen.findByText('Owner User')).toBeInTheDocument();
        expect(screen.getByText('owner@example.com')).toBeInTheDocument();
    });
});
