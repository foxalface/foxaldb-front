import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterQueryMultiValue } from '../filter-query-multi-value';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (
            key: string,
            options?: { count?: number; name?: string }
        ): string => {
            if (options?.name !== undefined && options?.count !== undefined) {
                return `${options.name} +${options.count}`;
            }
            return key;
        },
    }),
}));

const options = [
    { id: 'a', name: 'Alpha' },
    { id: 'b', name: 'Beta' },
    { id: 'c', name: 'Gamma' },
] as const;

describe('FilterQueryMultiValue', () => {
    it.each([
        ['tag', 'tags-label'],
        ['area', 'areas-label'],
        ['schema', 'schemas-label'],
    ] as const)(
        'shows compact empty, single-label, and summary triggers for %s',
        (_kind, label) => {
            const { rerender } = render(
                <FilterQueryMultiValue
                    conditionId="c1"
                    label={label}
                    selectLabel="Select"
                    options={options}
                    selectedIds={[]}
                    onChange={() => undefined}
                />
            );

            expect(
                screen.getByRole('button', { name: label })
            ).toHaveTextContent('Select');

            rerender(
                <FilterQueryMultiValue
                    conditionId="c1"
                    label={label}
                    selectLabel="Select"
                    options={options}
                    selectedIds={['b']}
                    onChange={() => undefined}
                />
            );
            expect(
                screen.getByRole('button', { name: label })
            ).toHaveTextContent('Beta');

            rerender(
                <FilterQueryMultiValue
                    conditionId="c1"
                    label={label}
                    selectLabel="Select"
                    options={options}
                    selectedIds={['a', 'b', 'c']}
                    onChange={() => undefined}
                />
            );
            expect(
                screen.getByRole('button', { name: label })
            ).toHaveTextContent('Alpha +2');
        }
    );
});
