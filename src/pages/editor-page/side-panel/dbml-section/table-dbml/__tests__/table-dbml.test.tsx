import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Diagram } from '@/lib/domain/diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import { TableDBML } from '../table-dbml';

const PRIVATE_EXCEPTION = 'VERY_PRIVATE_INTERNAL_DBML_EXCEPTION';
const VALID_DBML = 'Table users {\n  id integer [pk]\n}\n';

const { generateDBMLFromDiagramMock, toastMock, chartState } = vi.hoisted(
    () => ({
        generateDBMLFromDiagramMock: vi.fn(),
        toastMock: vi.fn(),
        chartState: {
            currentDiagram: null as unknown as Diagram,
        },
    })
);

vi.mock('@/lib/dbml/dbml-export/dbml-export', () => ({
    generateDBMLFromDiagram: generateDBMLFromDiagramMock,
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartState.currentDiagram,
        updateDiagramData: vi.fn(),
        databaseType: DatabaseType.POSTGRESQL,
        readonly: false,
    }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({ effectiveTheme: 'light' }),
}));

vi.mock('@/hooks/use-full-screen-spinner', () => ({
    useFullScreenLoader: () => ({
        showLoader: vi.fn(),
        hideLoader: vi.fn(),
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        calculateDiff: vi.fn(),
        originalDiagram: null,
        resetDiff: vi.fn(),
        hasDiff: false,
        newDiagram: null,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({ code }: { code: string }) => (
        <pre data-testid="dbml-editor">{code}</pre>
    ),
}));

const replaceDiagram = (name: string): void => {
    chartState.currentDiagram = {
        ...chartState.currentDiagram,
        id: `${chartState.currentDiagram.id}-${name}`,
        name,
    };
};

describe('TableDBML generation failure', () => {
    beforeEach(() => {
        generateDBMLFromDiagramMock.mockReset();
        toastMock.mockReset();
        chartState.currentDiagram = {
            id: 'diagram-1',
            name: 'Users',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [],
            relationships: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });

    it('shows a danger toast and does not render the exception', async () => {
        generateDBMLFromDiagramMock.mockResolvedValue({
            standardDbml: `// Error generating DBML: ${PRIVATE_EXCEPTION}`,
            inlineDbml: PRIVATE_EXCEPTION,
            relationshipsDbml: PRIVATE_EXCEPTION,
            error: PRIVATE_EXCEPTION,
        });

        render(<TableDBML />);

        await waitFor(() => {
            expect(toastMock).toHaveBeenCalledWith({
                title: 'dbml_toasts.generate_failed_title',
                description: 'dbml_toasts.generate_failed_description',
                variant: 'danger',
                dedupeKey: 'dbml:generate-failed',
            });
        });

        expect(screen.getByTestId('dbml-editor')).toHaveTextContent('');
        expect(document.body.textContent).not.toContain(PRIVATE_EXCEPTION);
    });

    it('keeps the previous DBML and still toasts on a later failure', async () => {
        generateDBMLFromDiagramMock
            .mockResolvedValueOnce({
                standardDbml: VALID_DBML,
                inlineDbml: VALID_DBML,
                relationshipsDbml: '',
            })
            .mockResolvedValue({
                standardDbml: PRIVATE_EXCEPTION,
                inlineDbml: PRIVATE_EXCEPTION,
                relationshipsDbml: PRIVATE_EXCEPTION,
                error: 'generate_failed',
            });

        const view = render(<TableDBML />);

        await waitFor(() => {
            expect(screen.getByTestId('dbml-editor')).toHaveTextContent(
                'Table users'
            );
        });

        replaceDiagram('Users changed');
        view.rerender(<TableDBML />);

        await waitFor(() => {
            expect(toastMock).toHaveBeenCalledWith(
                expect.objectContaining({ variant: 'danger' })
            );
        });

        expect(screen.getByTestId('dbml-editor')).toHaveTextContent(
            'Table users'
        );
        expect(document.body.textContent).not.toContain(PRIVATE_EXCEPTION);
    });
});
