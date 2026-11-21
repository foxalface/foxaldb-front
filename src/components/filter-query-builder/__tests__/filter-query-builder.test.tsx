import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterQueryBuilder } from '../filter-query-builder';
import { FILTER_MAX_CLAUSES } from '@/lib/domain/filter-evaluation';
import {
    FILTER_MAX_GROUP_DEPTH,
    createFilterGroup,
    emptyFilterGroup,
    normalizeFilterExpression,
    type FilterCondition,
    type FilterGroup,
} from '@/lib/domain/filter-expression';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { count?: number }) =>
            options?.count === undefined ? key : `${key}:${options.count}`,
    }),
}));

const Harness: React.FC = () => {
    const [expression, setExpression] =
        useState<FilterGroup>(emptyFilterGroup());

    return (
        <FilterQueryBuilder
            expression={expression}
            tags={[{ id: 'backend', name: 'Backend', color: '#f00' }]}
            areas={[
                {
                    id: 'area-backend',
                    name: 'Backend',
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    color: '#fff',
                },
            ]}
            schemas={[{ id: 'public', name: 'public' }]}
            onChange={(next) =>
                setExpression(
                    normalizeFilterExpression(next, {
                        tagIds: new Set(['backend']),
                        areaIds: new Set(['area-backend']),
                        schemaIds: new Set(['public']),
                    })
                )
            }
        />
    );
};

describe('FilterQueryBuilder', () => {
    it('adds, edits, and removes a condition', async () => {
        const user = userEvent.setup();
        render(<Harness />);

        expect(
            screen.getByText('side_panel.filters_section.query.empty')
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.value.tags',
            })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        expect(
            screen.getByText(
                'side_panel.filters_section.query.value.selected:1'
            )
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.remove',
            })
        );

        expect(
            screen.getByText('side_panel.filters_section.query.empty')
        ).toBeInTheDocument();
    });

    it('adds a nested group and disables Add group at the maximum depth', async () => {
        const user = userEvent.setup();
        render(<Harness />);

        for (let level = 0; level < FILTER_MAX_GROUP_DEPTH; level += 1) {
            const buttons = screen.getAllByRole('button', {
                name: 'side_panel.filters_section.query.add_group',
            });
            await user.click(buttons[0]);
        }

        const addGroupButtons = screen.getAllByRole('button', {
            name: 'side_panel.filters_section.query.add_group',
        });
        expect(addGroupButtons[0]).toBeDisabled();
        expect(addGroupButtons).toHaveLength(FILTER_MAX_GROUP_DEPTH + 1);

        await user.click(
            screen.getAllByRole('button', {
                name: 'side_panel.filters_section.query.remove',
            })[0]
        );
        expect(
            screen.getAllByRole('button', {
                name: 'side_panel.filters_section.query.add_group',
            })[0]
        ).toBeEnabled();
    });

    it('changes the group operator', async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(screen.getByRole('combobox'));
        await user.click(
            screen.getByRole('option', {
                name: 'side_panel.filters_section.query.operator_group.or',
            })
        );

        expect(screen.getByRole('combobox')).toHaveTextContent(
            'side_panel.filters_section.query.operator_group.or'
        );
    });

    it('keeps the last valid expression and explains an oversized change', async () => {
        const user = userEvent.setup();
        const nameIs = (id: string): FilterCondition => ({
            kind: 'condition',
            id,
            target: 'table',
            property: 'name',
            operator: 'is',
            value: id,
        });
        const branches = Math.log2(FILTER_MAX_CLAUSES) + 1;
        const initial = createFilterGroup(
            'or',
            Array.from({ length: branches }, (_, index) =>
                createFilterGroup(
                    'or',
                    [nameIs(`left-${index}`), nameIs(`right-${index}`)],
                    `or-${index}`
                )
            ),
            'root'
        );
        const HarnessWithExpression = () => {
            const [expression, setExpression] = useState(initial);

            return (
                <>
                    <span data-testid="root-operator">
                        {expression.operator}
                    </span>
                    <FilterQueryBuilder
                        expression={expression}
                        tags={[]}
                        areas={[]}
                        schemas={[]}
                        onChange={setExpression}
                    />
                </>
            );
        };

        render(<HarnessWithExpression />);

        expect(
            screen.queryByTestId('filter-query-too-complex')
        ).not.toBeInTheDocument();

        await user.click(screen.getAllByRole('combobox')[0]);
        await user.click(
            screen.getByRole('option', {
                name: 'side_panel.filters_section.query.operator_group.and',
            })
        );

        expect(screen.getByTestId('root-operator')).toHaveTextContent('or');
        expect(
            screen.getByTestId('filter-query-too-complex')
        ).toHaveTextContent('side_panel.filters_section.query.too_complex');
    });
});
