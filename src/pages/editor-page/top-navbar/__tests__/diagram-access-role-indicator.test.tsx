import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    readOnlineDiagramId,
} from '@/lib/diagram/diagram-location';
import type { DiagramLocation } from '@/lib/diagram/diagram-location';

const authState = { isAuthenticated: true };
const accessState = { diagramAccess: null as DiagramAccess | null };
const chartDbState = { currentDiagram: { id: '42' } as { id: string } | null };
const locationState = { location: null as DiagramLocation | null };

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => accessState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram: chartDbState.currentDiagram }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useOnlineDiagramId: () =>
        readOnlineDiagramId(
            locationState.location,
            chartDbState.currentDiagram?.id
        ),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

import { DiagramAccessRoleIndicator } from '../diagram-access-role-indicator';

describe('DiagramAccessRoleIndicator', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        accessState.diagramAccess = {
            role: 'owner',
            can_edit: true,
            can_manage_members: true,
        };
        chartDbState.currentDiagram = { id: '42' };
        locationState.location = onlineDiagramLocation('42');
    });

    it('renders the role for online diagrams', () => {
        render(
            <TooltipProvider>
                <DiagramAccessRoleIndicator />
            </TooltipProvider>
        );
        expect(screen.getByLabelText('diagram_role.owner')).toBeInTheDocument();
    });

    it('renders nothing for device diagrams', () => {
        locationState.location = deviceDiagramLocation('42');
        const { container } = render(
            <TooltipProvider>
                <DiagramAccessRoleIndicator />
            </TooltipProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing for numeric-looking device diagrams', () => {
        locationState.location = deviceDiagramLocation('123');
        chartDbState.currentDiagram = { id: '123' };
        const { container } = render(
            <TooltipProvider>
                <DiagramAccessRoleIndicator />
            </TooltipProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when online location does not match the editor diagram', () => {
        locationState.location = onlineDiagramLocation('123');
        chartDbState.currentDiagram = { id: '456' };
        const { container } = render(
            <TooltipProvider>
                <DiagramAccessRoleIndicator />
            </TooltipProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
