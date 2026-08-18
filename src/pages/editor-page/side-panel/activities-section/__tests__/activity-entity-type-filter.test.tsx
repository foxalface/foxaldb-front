import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import type { ActivityEntityType } from '@/components/side-panel/side-panel-entity-type-icons';
import { ActivityEntityTypeFilter } from '../activity-entity-type-filter';
import { DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES } from '../filter-activities';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
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

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
                const value = options?.[token];
                return value === undefined || value === null
                    ? ''
                    : String(value);
            });
        },
        i18n: { language: 'en' },
    }),
}));

const StatefulActivityEntityTypeFilter: React.FC = () => {
    const [selectedEntityTypes, setSelectedEntityTypes] = useState<
        ActivityEntityType[]
    >(DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES);

    return (
        <ActivityEntityTypeFilter
            selectedEntityTypes={selectedEntityTypes}
            onSelectedEntityTypesChange={setSelectedEntityTypes}
        />
    );
};

describe('ActivityEntityTypeFilter', () => {
    it('toggles selected entity types', async () => {
        const user = userEvent.setup();

        render(<StatefulActivityEntityTypeFilter />);

        await user.click(
            screen.getByRole('button', { name: 'Filter by activity type' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Diagram' }));
        await user.click(screen.getByRole('checkbox', { name: 'Note' }));

        expect(screen.getByRole('checkbox', { name: 'Table' })).toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Diagram' })
        ).not.toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Note' })
        ).not.toBeChecked();
    });

    it('uses a stable trigger label', () => {
        render(
            <ActivityEntityTypeFilter
                selectedEntityTypes={['table', 'field']}
                onSelectedEntityTypesChange={vi.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Filter by activity type',
            })
        ).toHaveTextContent('Type');
    });

    it('selects all from the header checkbox when partially selected', async () => {
        const user = userEvent.setup();
        const onSelectedEntityTypesChange = vi.fn();

        render(
            <ActivityEntityTypeFilter
                selectedEntityTypes={['table']}
                onSelectedEntityTypesChange={onSelectedEntityTypesChange}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Filter by activity type' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select All' }));

        expect(onSelectedEntityTypesChange).toHaveBeenCalledWith([
            'diagram',
            'table',
            'field',
            'relationship',
            'note',
            'area',
            'dependency',
        ]);
    });

    it('deselects all from the header checkbox when fully selected', async () => {
        const user = userEvent.setup();
        const onSelectedEntityTypesChange = vi.fn();

        render(
            <ActivityEntityTypeFilter
                selectedEntityTypes={[
                    'diagram',
                    'table',
                    'field',
                    'relationship',
                    'note',
                    'area',
                    'dependency',
                ]}
                onSelectedEntityTypesChange={onSelectedEntityTypesChange}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Filter by activity type' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select All' }));

        expect(onSelectedEntityTypesChange).toHaveBeenCalledWith([]);
    });
});
