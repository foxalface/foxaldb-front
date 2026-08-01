import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from '@/components/tabs/tabs';
import {
    SidePanelSectionTabsList,
    sidePanelSectionTabListClassName,
    sidePanelSectionTabTriggerClassName,
} from '../side-panel-section-tabs';

describe('sidePanelSectionTabs', () => {
    it('renders the shared list and trigger class contract', () => {
        render(
            <Tabs value="one">
                <SidePanelSectionTabsList data-testid="tabs-list">
                    <button type="button">One</button>
                </SidePanelSectionTabsList>
            </Tabs>
        );

        expect(screen.getByTestId('tabs-list')).toHaveClass(
            ...sidePanelSectionTabListClassName.split(' ')
        );
        expect(sidePanelSectionTabTriggerClassName).toContain(
            'data-[state=active]:bg-sky-600'
        );
    });

    it('is reused by the Visuals and Conversations side panels', () => {
        const repoRoot = join(
            dirname(fileURLToPath(import.meta.url)),
            '../../..'
        );

        const visualsSource = readFileSync(
            join(
                repoRoot,
                'pages/editor-page/side-panel/visuals-section/visuals-section.tsx'
            ),
            'utf8'
        );
        const conversationsSource = readFileSync(
            join(
                repoRoot,
                'pages/editor-page/side-panel/conversations-section/conversations-section.tsx'
            ),
            'utf8'
        );

        expect(visualsSource).toContain(
            '@/components/side-panel-section-tabs/side-panel-section-tabs'
        );
        expect(conversationsSource).toContain(
            '@/components/side-panel-section-tabs/side-panel-section-tabs'
        );
    });
});
