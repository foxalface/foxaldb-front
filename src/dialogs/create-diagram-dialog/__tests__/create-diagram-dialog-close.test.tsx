import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreateDiagramDialog } from '../create-diagram-dialog';

const closeCreateDiagramDialog = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: {
            id: '42',
            name: 'Billing',
            databaseType: 'postgresql',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        loadDiagramFromData: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeCreateDiagramDialog,
        openAuthDialog: vi.fn(),
        openImportDiagramDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        updateConfig: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        listDiagrams: vi.fn().mockResolvedValue([{ id: '42' }]),
        addDiagram: vi.fn(),
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('CreateDiagramDialog close control', () => {
    it('shows the dialog close button when another diagram is already open', () => {
        render(<CreateDiagramDialog dialog={{ open: true }} />);

        expect(
            screen.getByRole('button', { name: 'Close' })
        ).toBeInTheDocument();
    });
});
