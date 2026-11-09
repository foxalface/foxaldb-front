import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnlineDiagramRowActionsMenu } from '../online-diagram-row-actions-menu';

const deleteDiagram = vi.fn();
const showAlert = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: 'other-diagram',
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        addDiagram: vi.fn(),
        listDiagrams: vi.fn(),
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({
        showAlert,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    deleteDiagram: (...args: unknown[]) => deleteDiagram(...args),
    duplicateDiagram: vi.fn(),
}));

describe('OnlineDiagramRowActionsMenu delete', () => {
    beforeEach(() => {
        deleteDiagram.mockReset();
        showAlert.mockReset();
    });

    it('warns that an online diagram can be recovered and does not touch device storage', async () => {
        render(
            <OnlineDiagramRowActionsMenu
                diagramId="42"
                role="owner"
                onOpen={vi.fn()}
                onOpenLocal={vi.fn()}
                onLocalListChanged={vi.fn()}
                onListChanged={vi.fn()}
                numberOfOnlineDiagrams={2}
            />
        );

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(
            screen.getByText('open_diagram_dialog.diagram_actions.delete')
        );

        expect(showAlert).toHaveBeenCalledWith(
            expect.objectContaining({
                description: 'delete_diagram_alert.description_online',
            })
        );
        expect(deleteDiagram).not.toHaveBeenCalled();
    });
});
