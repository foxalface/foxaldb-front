import React, { useState } from 'react';
import {
    render,
    screen,
    within,
    type RenderOptions,
} from '@testing-library/react';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { isFilterConditionComplete } from '@/lib/domain/filter-expression';
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
        t: (
            key: string,
            options?: { count?: number; name?: string }
        ): string => {
            if (options?.name !== undefined && options?.count !== undefined) {
                return `${options.name} +${options.count}`;
            }
            if (options?.count !== undefined) {
                return `${key}:${options.count}`;
            }
            return key;
        },
    }),
}));

const renderWithUi = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) =>
    render(ui, {
        wrapper: ({ children }) => (
            <TooltipProvider>{children}</TooltipProvider>
        ),
        ...options,
    });

const builderProps = {
    tags: [
        { id: 'backend', name: 'Backend', color: '#f00' },
        { id: 'frontend', name: 'Frontend', color: '#0f0' },
        { id: 'api', name: 'API', color: '#00f' },
    ],
    areas: [
        {
            id: 'area-backend',
            name: 'Core',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            color: '#fff',
        },
    ],
    schemas: [{ id: 'public', name: 'public' }],
};

const Harness: React.FC = () => {
    const [expression, setExpression] =
        useState<FilterGroup>(emptyFilterGroup());

    return (
        <FilterQueryBuilder
            expression={expression}
            {...builderProps}
            onChange={(next) =>
                setExpression(
                    normalizeFilterExpression(next, {
                        tagIds: new Set(['backend', 'frontend', 'api']),
                        areaIds: new Set(['area-backend']),
                        schemaIds: new Set(['public']),
                    })
                )
            }
        />
    );
};

const getQueryGroupContainers = (): HTMLElement[] =>
    screen
        .getAllByTestId(/filter-query-group-/)
        .filter((element) =>
            /^filter-query-group-[a-z0-9]+$/.test(
                element.getAttribute('data-testid') ?? ''
            )
        );

const openAddMenu = async (
    user: ReturnType<typeof userEvent.setup>,
    groupId?: string
) => {
    const testId = groupId ? `filter-query-add-${groupId}` : 'filter-query-add';
    const button = groupId
        ? screen.getByTestId(testId)
        : screen.getByRole('button', {
              name: 'side_panel.filters_section.query.add',
          });
    await user.click(button);
};

describe('FilterQueryBuilder', () => {
    it('shows no AND/OR selector on the root when it has 0 or 1 child', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        expect(
            screen.queryByTestId(/^filter-query-group-operator-/)
        ).not.toBeInTheDocument();

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        expect(
            screen.queryByTestId(/^filter-query-group-operator-/)
        ).not.toBeInTheDocument();

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        expect(
            screen.getByTestId(/^filter-query-group-operator-/)
        ).toBeInTheDocument();
    });

    it('shows the AND/OR selector on nested groups only with 2+ children', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        const nestedGroups = getQueryGroupContainers().slice(1);
        const nestedGroup = nestedGroups[0];
        expect(nestedGroup).toBeDefined();
        expect(
            within(nestedGroup).queryByTestId(/^filter-query-group-operator-/)
        ).not.toBeInTheDocument();

        expect(
            within(nestedGroup).queryByTestId(/^filter-query-group-operator-/)
        ).not.toBeInTheDocument();

        const nestedAdd = within(nestedGroup).getByTestId(/^filter-query-add-/);
        await user.click(nestedAdd);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        expect(
            within(nestedGroup).getByTestId(/^filter-query-group-operator-/)
        ).toBeInTheDocument();
    });

    it('adds, edits, and removes a condition via the Add menu and trash action', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        expect(
            screen.getByTestId('filter-query-empty-root')
        ).toBeInTheDocument();

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.value.tags',
            })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        const valueButton = screen.getByTestId(
            /^filter-query-value-[a-z0-9]+$/
        );
        expect(valueButton).toHaveTextContent('Backend');

        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.delete_condition',
            })
        );

        expect(
            screen.getByTestId('filter-query-empty-root')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('side_panel.filters_section.query.remove')
        ).not.toBeInTheDocument();
    });

    it('creates a nested group with one initial empty condition', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        const conditions = screen.getAllByTestId(/^filter-query-condition-/);
        expect(conditions).toHaveLength(1);
    });

    it('hides the Group action at maximum nesting depth', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        const addGroupToDeepest = async () => {
            const groups = getQueryGroupContainers();
            const parent = groups[groups.length - 1];
            await user.click(within(parent).getByTestId(/^filter-query-add-/));
            await user.click(
                screen.getByRole('menuitem', {
                    name: 'side_panel.filters_section.query.add_group',
                })
            );
        };

        for (let level = 0; level < FILTER_MAX_GROUP_DEPTH; level += 1) {
            await addGroupToDeepest();
        }

        const deepestGroup = getQueryGroupContainers().at(-1) ?? null;
        expect(deepestGroup).not.toBeNull();
        await user.click(
            within(deepestGroup as HTMLElement).getByTestId(
                /^filter-query-add-/
            )
        );
        expect(
            screen.queryByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        ).not.toBeInTheDocument();
    });

    it('deletes a nested group with the destructive action', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        const nestedDeleteButtons = screen.getAllByRole('button', {
            name: 'side_panel.filters_section.query.delete_group',
        });
        await user.click(nestedDeleteButtons[0]);

        expect(
            screen.queryAllByTestId(/^filter-query-condition-/)
        ).toHaveLength(0);
    });

    it('clears all root children with Delete all', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );
        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.delete_all',
            })
        );

        expect(
            screen.getByTestId('filter-query-empty-root')
        ).toBeInTheDocument();
        expect(
            screen.queryAllByTestId(/^filter-query-condition-/)
        ).toHaveLength(0);
    });

    it('changes the group operator when two children are present', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );
        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        const rootOperator = screen.getByTestId(
            /^filter-query-group-operator-/
        );
        await user.click(rootOperator);
        await user.click(
            screen.getByRole('option', {
                name: 'side_panel.filters_section.query.operator_group.or',
            })
        );

        expect(rootOperator).toHaveTextContent(
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

        renderWithUi(<HarnessWithExpression />);

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

    it('disables Delete all when the root has no children', () => {
        renderWithUi(<Harness />);

        expect(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.delete_all',
            })
        ).toBeDisabled();
    });

    it('shows incomplete then active condition status using domain completeness', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        const status = await screen.findByTestId(/^filter-query-status-/);
        const conditionId = status
            .getAttribute('data-testid')
            ?.replace('filter-query-status-', '');

        expect(status).toHaveAttribute('data-complete', 'false');
        expect(
            screen.queryByLabelText(
                'side_panel.filters_section.query.status_active'
            )
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.value.tags',
            })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        expect(status).toHaveAttribute('data-complete', 'true');
        expect(conditionId).toBeDefined();
        const cards = screen.getAllByTestId(/^filter-query-condition-/);
        const conditionCard = cards.find((card) =>
            card.getAttribute('data-testid')?.endsWith(conditionId as string)
        );
        expect(conditionCard).toBeDefined();
        expect(
            isFilterConditionComplete({
                kind: 'condition',
                id: conditionId as string,
                target: 'table',
                property: 'tag',
                operator: 'is_any_of',
                value: ['backend'],
            })
        ).toBe(true);
    });

    it('collapses and expands nested groups without changing the expression', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const HarnessWithSpy = () => {
            const [expression, setExpression] =
                useState<FilterGroup>(emptyFilterGroup());

            return (
                <FilterQueryBuilder
                    expression={expression}
                    {...builderProps}
                    onChange={(next) => {
                        onChange(next);
                        setExpression(
                            normalizeFilterExpression(next, {
                                tagIds: new Set(['backend', 'frontend', 'api']),
                                areaIds: new Set(['area-backend']),
                                schemaIds: new Set(['public']),
                            })
                        );
                    }}
                />
            );
        };

        renderWithUi(<HarnessWithSpy />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );
        onChange.mockClear();

        const nestedGroup = getQueryGroupContainers().at(-1) as HTMLElement;
        const nestedGroupId = nestedGroup
            .getAttribute('data-testid')
            ?.replace('filter-query-group-', '');
        const foldToggle = within(nestedGroup).getByTestId(
            `filter-query-fold-toggle-${nestedGroupId}`
        );

        expect(
            within(nestedGroup).getByTestId(
                `filter-query-group-body-${nestedGroupId}`
            )
        ).toBeInTheDocument();

        await user.click(foldToggle);
        expect(onChange).not.toHaveBeenCalled();
        expect(nestedGroup).toHaveAttribute('data-expanded', 'false');
        expect(
            within(nestedGroup).queryByTestId(
                `filter-query-group-body-${nestedGroupId}`
            )
        ).not.toBeInTheDocument();

        await user.click(foldToggle);
        expect(onChange).not.toHaveBeenCalled();
        expect(nestedGroup).toHaveAttribute('data-expanded', 'true');
    });

    it('does not render a foldout toggle on the root group', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        expect(screen.getAllByTestId(/^filter-query-fold-toggle-/).length).toBe(
            1
        );
        const rootGroup = getQueryGroupContainers()[0];
        const rootGroupId = rootGroup
            .getAttribute('data-testid')
            ?.replace('filter-query-group-', '');
        expect(
            screen.queryByTestId(`filter-query-fold-toggle-${rootGroupId}`)
        ).not.toBeInTheDocument();
    });

    it('does not show condition counts on nested group headers', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        const nestedGroup = getQueryGroupContainers().at(-1) as HTMLElement;
        const nestedGroupId = nestedGroup
            .getAttribute('data-testid')
            ?.replace('filter-query-group-', '');

        expect(
            within(nestedGroup).queryByTestId(
                `filter-query-group-condition-count-${nestedGroupId}`
            )
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/condition_count/)).not.toBeInTheDocument();
    });

    it('shows the group aggregate incomplete warning only when nested group is collapsed', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_group',
            })
        );

        const nestedGroup = getQueryGroupContainers().at(-1) as HTMLElement;
        const nestedGroupId = nestedGroup
            .getAttribute('data-testid')
            ?.replace('filter-query-group-', '');

        expect(
            within(nestedGroup).queryByTestId(
                `filter-query-group-incomplete-${nestedGroupId}`
            )
        ).not.toBeInTheDocument();

        const foldToggle = within(nestedGroup).getByTestId(
            `filter-query-fold-toggle-${nestedGroupId}`
        );
        await user.click(foldToggle);
        expect(
            within(nestedGroup).getByTestId(
                `filter-query-group-incomplete-${nestedGroupId}`
            )
        ).toHaveAttribute(
            'aria-label',
            'side_panel.filters_section.query.group_incomplete_warning'
        );

        await user.click(foldToggle);
        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.value.tags',
            })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        await user.click(foldToggle);
        expect(
            within(nestedGroup).queryByTestId(
                `filter-query-group-incomplete-${nestedGroupId}`
            )
        ).not.toBeInTheDocument();
    });

    it('never shows aggregate incomplete warning on the root group', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        const rootGroup = getQueryGroupContainers()[0];
        const rootGroupId = rootGroup
            .getAttribute('data-testid')
            ?.replace('filter-query-group-', '');

        expect(
            within(rootGroup).queryByTestId(
                `filter-query-group-incomplete-${rootGroupId}`
            )
        ).not.toBeInTheDocument();
    });

    it('uses compact multi-value trigger labels for tag, area, and schema', async () => {
        const user = userEvent.setup();
        renderWithUi(<Harness />);

        await openAddMenu(user);
        await user.click(
            screen.getByRole('menuitem', {
                name: 'side_panel.filters_section.query.add_condition',
            })
        );

        const valueButton = screen.getByTestId(
            /^filter-query-value-[a-z0-9]+$/
        );
        expect(valueButton).toHaveTextContent(
            'side_panel.filters_section.query.value.select'
        );

        await user.click(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.value.tags',
            })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));
        expect(valueButton).toHaveTextContent('Backend');

        await user.click(screen.getByRole('checkbox', { name: 'Frontend' }));
        await user.click(screen.getByRole('checkbox', { name: 'API' }));
        expect(valueButton).toHaveTextContent('Backend +2');

        expect(
            screen.queryByText(/query\.value\.selected/)
        ).not.toBeInTheDocument();
    });
});
