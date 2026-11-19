import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent, {
    PointerEventsCheckLevel,
} from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    DiagramTag,
    DiagramTagAssignment,
} from '@/lib/domain/diagram-tag';
import { colorOptions } from '@/lib/colors';
import { en } from '@/i18n/locales/en';
import { TagSelector } from '../tag-selector';

const {
    chartDBState,
    ids,
    addTags,
    updateTag,
    removeTags,
    addTagAssignments,
    removeTagAssignments,
} = vi.hoisted(() => ({
    chartDBState: {
        tags: [] as DiagramTag[],
        tagAssignments: [] as DiagramTagAssignment[],
    },
    ids: { n: 0 },
    addTags: vi.fn(),
    updateTag: vi.fn(),
    removeTags: vi.fn(),
    addTagAssignments: vi.fn(),
    removeTagAssignments: vi.fn(),
}));

vi.mock('@/lib/utils', async () => {
    const actual = (await vi.importActual('@/lib/utils')) as Record<
        string,
        unknown
    >;

    return {
        ...actual,
        generateId: () => {
            ids.n += 1;
            return `generated-${ids.n}`;
        },
    };
});

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: { tags: chartDBState.tags },
        tagAssignments: chartDBState.tagAssignments,
        addTags,
        updateTag,
        removeTags,
        addTagAssignments,
        removeTagAssignments,
    }),
}));

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

const backend: DiagramTag = {
    id: 'tag-backend',
    name: 'Backend',
    color: '#8eb7ff',
};

const pii: DiagramTag = {
    id: 'tag-pii',
    name: 'PII',
    color: '#ff6363',
};

const renderSelector = (
    targetType: 'table' | 'field' | 'relationship' = 'table',
    targetId = 'table-1',
    disabled = false
) =>
    render(
        <TagSelector
            targetType={targetType}
            targetId={targetId}
            disabled={disabled}
        />
    );

describe('TagSelector', () => {
    beforeEach(() => {
        chartDBState.tags = [backend, pii];
        chartDBState.tagAssignments = [];
        ids.n = 0;
        addTags.mockReset();
        updateTag.mockReset();
        removeTags.mockReset();
        addTagAssignments.mockReset();
        removeTagAssignments.mockReset();
        addTags.mockResolvedValue(undefined);
        addTagAssignments.mockResolvedValue(undefined);
        updateTag.mockResolvedValue(undefined);
        removeTags.mockResolvedValue(undefined);
    });

    it('shows diagram tags without copying them into selector state', () => {
        renderSelector();

        expect(screen.getByText('Backend')).toBeInTheDocument();
        expect(screen.getByText('PII')).toBeInTheDocument();
        expect(screen.queryByText('Any')).not.toBeInTheDocument();
    });

    it('checks only assignments for the current target', () => {
        chartDBState.tagAssignments = [
            {
                id: 'as-table',
                tagId: 'tag-backend',
                targetType: 'table',
                targetId: 'table-1',
            },
            {
                id: 'as-other',
                tagId: 'tag-pii',
                targetType: 'table',
                targetId: 'table-2',
            },
        ];
        renderSelector();

        expect(screen.getByRole('checkbox', { name: 'Backend' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'PII' })).not.toBeChecked();
    });

    it('assigns a tag with a generated id', async () => {
        const user = userEvent.setup();
        renderSelector('field', 'field-1');

        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        expect(addTagAssignments).toHaveBeenCalledWith([
            {
                id: 'generated-1',
                tagId: 'tag-backend',
                targetType: 'field',
                targetId: 'field-1',
            },
        ]);
        expect(removeTagAssignments).not.toHaveBeenCalled();
    });

    it('assigns several tags independently', async () => {
        const user = userEvent.setup();
        renderSelector('relationship', 'rel-1');

        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));
        await user.click(screen.getByRole('checkbox', { name: 'PII' }));

        expect(addTagAssignments).toHaveBeenNthCalledWith(1, [
            expect.objectContaining({
                tagId: 'tag-backend',
                targetType: 'relationship',
                targetId: 'rel-1',
            }),
        ]);
        expect(addTagAssignments).toHaveBeenNthCalledWith(2, [
            expect.objectContaining({
                tagId: 'tag-pii',
                targetType: 'relationship',
                targetId: 'rel-1',
            }),
        ]);
    });

    it('unassigns every matching legacy row and does not add a duplicate', async () => {
        chartDBState.tagAssignments = [
            {
                id: 'as-1',
                tagId: 'tag-backend',
                targetType: 'table',
                targetId: 'view-1',
            },
            {
                id: 'as-2',
                tagId: 'tag-backend',
                targetType: 'table',
                targetId: 'view-1',
            },
        ];
        const user = userEvent.setup();
        renderSelector('table', 'view-1');

        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        expect(removeTagAssignments).toHaveBeenCalledWith(['as-1', 'as-2']);
        expect(addTagAssignments).not.toHaveBeenCalled();
    });

    it('creates a tag and then assigns it to the current target', async () => {
        const user = userEvent.setup();
        const order: string[] = [];
        addTags.mockImplementation(async () => {
            order.push('addTags');
        });
        addTagAssignments.mockImplementation(async () => {
            order.push('addTagAssignments');
        });
        renderSelector();

        await user.type(
            screen.getByRole('textbox', { name: 'Tag name' }),
            'Finance'
        );
        await user.click(screen.getByRole('button', { name: 'Create tag' }));

        expect(order).toEqual(['addTags', 'addTagAssignments']);
        expect(addTags).toHaveBeenCalledWith([
            {
                id: 'generated-1',
                name: 'Finance',
                color: expect.any(String),
            },
        ]);
        const created = addTags.mock.calls[0][0][0] as DiagramTag;
        expect(colorOptions).toContain(created.color);
        expect(addTagAssignments).toHaveBeenCalledWith([
            {
                id: 'generated-2',
                tagId: 'generated-1',
                targetType: 'table',
                targetId: 'table-1',
            },
        ]);
        expect(removeTags).not.toHaveBeenCalled();
    });

    it('renames only when the trimmed name changed', async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            screen.getAllByRole('button', { name: 'Rename tag' })[0]
        );
        const input = screen.getByRole('textbox', { name: 'Rename tag' });
        await user.clear(input);
        await user.type(input, '  Platform  ');
        await user.keyboard('{Enter}');

        expect(updateTag).toHaveBeenCalledWith('tag-backend', {
            name: 'Platform',
        });
    });

    it('cancels a rename on Escape', async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            screen.getAllByRole('button', { name: 'Rename tag' })[0]
        );
        await user.keyboard('{Escape}');

        expect(updateTag).not.toHaveBeenCalled();
        expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('recolors a tag with an existing palette color', async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(screen.getByRole('button', { name: 'Backend Color' }));
        await user.click(screen.getByRole('button', { name: '#42e0c0' }));

        expect(updateTag).toHaveBeenCalledWith('tag-backend', {
            color: '#42e0c0',
        });
    });

    it('deletes through removeTags only', async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

        expect(removeTags).toHaveBeenCalledWith(['tag-backend']);
        expect(removeTagAssignments).not.toHaveBeenCalled();
    });

    it('filters the open list without changing assignments', async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.type(
            screen.getByRole('textbox', { name: 'Search tags' }),
            'pii'
        );

        expect(screen.queryByText('Backend')).not.toBeInTheDocument();
        expect(screen.getByText('PII')).toBeInTheDocument();
        expect(addTagAssignments).not.toHaveBeenCalled();
    });

    it('does not mutate tags when disabled', async () => {
        const user = userEvent.setup({
            pointerEventsCheck: PointerEventsCheckLevel.Never,
        });
        chartDBState.tagAssignments = [
            {
                id: 'as-1',
                tagId: 'tag-backend',
                targetType: 'table',
                targetId: 'table-1',
            },
        ];
        renderSelector('table', 'table-1', true);

        expect(
            screen.queryByRole('button', { name: 'Create tag' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Rename tag' })
        ).not.toBeInTheDocument();
        await user.click(screen.getByRole('checkbox', { name: 'Backend' }));

        expect(addTags).not.toHaveBeenCalled();
        expect(updateTag).not.toHaveBeenCalled();
        expect(removeTags).not.toHaveBeenCalled();
        expect(addTagAssignments).not.toHaveBeenCalled();
        expect(removeTagAssignments).not.toHaveBeenCalled();
    });
});
