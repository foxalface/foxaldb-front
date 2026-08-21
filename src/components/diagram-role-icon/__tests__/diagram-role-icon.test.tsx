import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { en } from '@/i18n/locales/en';

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

import { DiagramRoleIcon } from '../diagram-role-icon';

describe('DiagramRoleIcon', () => {
    it('renders owner, editor and viewer icons with role tooltips', () => {
        const { rerender } = render(
            <TooltipProvider>
                <DiagramRoleIcon role="owner" />
            </TooltipProvider>
        );
        expect(screen.getByLabelText('Owner')).toBeInTheDocument();

        rerender(
            <TooltipProvider>
                <DiagramRoleIcon role="editor" />
            </TooltipProvider>
        );
        expect(screen.getByLabelText('Editor')).toBeInTheDocument();

        rerender(
            <TooltipProvider>
                <DiagramRoleIcon role="viewer" />
            </TooltipProvider>
        );
        expect(screen.getByLabelText('Viewer')).toBeInTheDocument();
    });
});
