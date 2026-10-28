import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreateDiagramDialog } from '../create-diagram-dialog';

const closeCreateDiagramDialog = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        isAuthenticated: false,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        loadDiagramFromData: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        closeCreateDiagramDialog,
        openAuthDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({
        updateConfig: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        listDiagrams: vi.fn().mockResolvedValue([]),
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

describe('CreateDiagramDialog entry-flow ownership', () => {
    it('does not close when entry flow owns the dialog', () => {
        render(
            <CreateDiagramDialog
                dialog={{ open: true }}
                entryCreateDiagramActions={{
                    onDiagramCreated: vi.fn(),
                }}
            />
        );

        const event = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
        });

        document.dispatchEvent(event);

        expect(closeCreateDiagramDialog).not.toHaveBeenCalled();
    });
});
