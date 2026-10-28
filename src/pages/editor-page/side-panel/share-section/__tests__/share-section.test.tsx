import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    readOnlineDiagramId,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';

const { listDiagramMembersMock } = vi.hoisted(() => ({
    listDiagramMembersMock: vi.fn(),
}));

const chartDbState = {
    currentDiagram: { id: '42' } as { id: string } | null,
};

const locationState: { location: DiagramLocation } = {
    location: onlineDiagramLocation('42'),
};

vi.mock('@/lib/api/diagram-members', () => ({
    listDiagramMembers: listDiagramMembersMock,
    DIAGRAM_MEMBER_ROLE_EDITOR: 'editor',
    DIAGRAM_MEMBER_ROLE_VIEWER: 'viewer',
    DIAGRAM_MEMBER_ROLES: ['editor', 'viewer'],
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

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation: vi.fn(),
    }),
    useOnlineDiagramId: () =>
        readOnlineDiagramId(
            locationState.location,
            chartDbState.currentDiagram?.id
        ),
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

const renderShareSection = () =>
    render(
        <TooltipProvider>
            <ShareSection />
        </TooltipProvider>
    );

describe('ShareSection', () => {
    beforeEach(() => {
        listDiagramMembersMock.mockReset();
        listDiagramMembersMock.mockResolvedValue([]);
        chartDbState.currentDiagram = { id: '42' };
        locationState.location = onlineDiagramLocation('42');
    });

    it('renders collaborator and public link tabs', async () => {
        renderShareSection();

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

    it('does not fetch members for device diagrams', async () => {
        locationState.location = deviceDiagramLocation('42');
        chartDbState.currentDiagram = { id: '42' };

        const { container } = renderShareSection();
        expect(container).toBeEmptyDOMElement();
        expect(listDiagramMembersMock).not.toHaveBeenCalled();
    });

    it('does not fetch when online location does not match the open diagram', async () => {
        locationState.location = onlineDiagramLocation('123');
        chartDbState.currentDiagram = { id: '456' };

        const { container } = renderShareSection();
        expect(container).toBeEmptyDOMElement();
        expect(listDiagramMembersMock).not.toHaveBeenCalled();
    });

    it('shows the public link placeholder when that tab is selected', async () => {
        const user = userEvent.setup();
        renderShareSection();

        await user.click(screen.getByRole('tab', { name: 'Public link' }));

        expect(
            screen.getByText(
                'Share a read-only snapshot of your diagram with anyone who has the link.'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('Coming soon.')).toBeInTheDocument();
    });

    it('shows the empty collaborators message when there are no members', async () => {
        renderShareSection();

        expect(
            await screen.findByText('No collaborators yet.')
        ).toBeInTheDocument();
        expect(screen.queryByText('Owner User')).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Add collaborator' })
        ).toBeInTheDocument();
    });

    it('opens the add collaborator dialog from the toolbar button', async () => {
        const user = userEvent.setup();
        renderShareSection();

        await screen.findByText('No collaborators yet.');
        await user.click(
            screen.getByRole('button', { name: 'Add collaborator' })
        );

        expect(
            screen.getByRole('dialog', { name: 'Add collaborator' })
        ).toBeInTheDocument();
    });
});
