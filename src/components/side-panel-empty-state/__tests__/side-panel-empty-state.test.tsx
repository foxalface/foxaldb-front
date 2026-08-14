import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateClassName,
    sidePanelEmptyStateIcon,
} from '../side-panel-empty-state';

describe('SidePanelEmptyState', () => {
    it('exports the same top offset used by the Visuals panel empty states', () => {
        const visualsRoot = join(
            dirname(fileURLToPath(import.meta.url)),
            '../../../pages/editor-page/side-panel/visuals-section'
        );

        const areasSource = readFileSync(
            join(visualsRoot, 'areas-tab/areas-tab.tsx'),
            'utf8'
        );
        const notesSource = readFileSync(
            join(visualsRoot, 'notes-tab/notes-tab.tsx'),
            'utf8'
        );

        expect(areasSource).toContain('SidePanelEmptyStateViewport');
        expect(notesSource).toContain('SidePanelEmptyStateViewport');
        expect(sidePanelEmptyStateClassName).toBe('mt-20');
    });

    it('renders children inside the shared scroll viewport', () => {
        render(
            <SidePanelEmptyStateViewport>
                <SidePanelEmptyState
                    title="No areas"
                    description="Create an area to get started"
                />
            </SidePanelEmptyStateViewport>
        );

        expect(screen.getByText('No areas')).toBeInTheDocument();
    });

    it('renders title and description without an action button by default', () => {
        render(
            <SidePanelEmptyState
                icon={sidePanelEmptyStateIcon}
                title="No areas"
                description="Create an area to get started"
            />
        );

        expect(screen.getByText('No areas')).toBeInTheDocument();
        expect(
            screen.getByText('Create an area to get started')
        ).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(
            document.querySelector('[data-slot="empty-title"]')
        ).not.toBeNull();
        expect(
            document.querySelector('[data-slot="empty-description"]')
        ).not.toBeNull();
        expect(
            document.querySelector('[data-slot="empty-icon"]')
        ).not.toBeNull();
        expect(document.querySelector('img[alt="Empty state"]')).toBeNull();
    });
});
