import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import {
    EMPTY_DISCUSSION_INDICATOR,
    type DiscussionIndicator,
} from '@/lib/comments/discussion-indicators';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { TableField } from '../table-field';

const {
    chartDBState,
    commentsState,
    discussionIndicatorState,
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
    openTargetDiscussion,
    showSidePanel,
    selectSidebarSection,
    updateField,
    removeField,
    handleNullableToggle,
    handlePrimaryKeyToggle,
    handleNameChange,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
    },
    commentsState: {
        isActive: true,
    },
    discussionIndicatorState: {
        indicator: {
            commentCount: 0,
            hasDiscussion: false,
        } as DiscussionIndicator,
    },
    useTableDiscussionIndicator: vi.fn(),
    useFieldDiscussionIndicator: vi.fn(
        (): DiscussionIndicator => discussionIndicatorState.indicator
    ),
    useRelationshipDiscussionIndicator: vi.fn(),
    openTargetDiscussion: vi.fn(),
    showSidePanel: vi.fn(),
    selectSidebarSection: vi.fn(),
    updateField: vi.fn(),
    removeField: vi.fn(),
    handleNullableToggle: vi.fn(),
    handlePrimaryKeyToggle: vi.fn(),
    handleNameChange: vi.fn(),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        readonly: chartDBState.readonly,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        openTargetDiscussion,
        showSidePanel,
        selectSidebarSection,
    }),
}));

vi.mock('@/hooks/use-comments-availability', () => ({
    useCommentsAvailability: () => commentsState.isActive,
}));

vi.mock('@/hooks/use-discussion-indicators', () => ({
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
}));

vi.mock('@/hooks/use-editing-broadcast', () => ({
    useEditingBroadcast: () => ({
        startEditing: vi.fn(),
        stopEditing: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-update-table-field', () => ({
    useUpdateTableField: (_table: DBTable, field: DBField) => ({
        dataFieldOptions: [{ value: field.type.id, label: field.type.name }],
        handleDataTypeChange: vi.fn(),
        handlePrimaryKeyToggle,
        handleNullableToggle,
        handleNameChange,
        generateFieldSuffix: () => '',
        fieldName: field.name,
        nullable: field.nullable,
        primaryKey: field.primaryKey,
    }),
}));

vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: undefined,
    }),
}));

vi.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Translate: {
            toString: () => undefined,
        },
    },
}));

vi.mock('@/components/select-box/select-box', () => ({
    SelectBox: ({ value, readonly }: { value: string; readonly?: boolean }) => (
        <div data-testid="field-type-select" data-readonly={String(!!readonly)}>
            {value}
        </div>
    ),
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

const baseField: DBField = {
    id: 'field-1',
    name: 'email',
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
};

const baseTable: DBTable = {
    id: 'table-1',
    name: 'Clients',
    x: 0,
    y: 0,
    fields: [baseField],
    indexes: [],
    color: '#ffffff',
    isView: false,
    createdAt: 0,
};

const withDiscussion = (commentCount: number): DiscussionIndicator => ({
    commentCount,
    hasDiscussion: commentCount > 0,
});

type RenderOptions = {
    field?: DBField;
    table?: DBTable;
    readonly?: boolean;
};

const renderField = ({
    field = baseField,
    table = { ...baseTable, fields: [field] },
    readonly = false,
}: RenderOptions = {}) =>
    render(
        <TooltipProvider>
            <TableField
                table={table}
                field={field}
                updateField={updateField}
                removeField={removeField}
                databaseType={DatabaseType.SQLITE}
                readonly={readonly}
            />
        </TooltipProvider>
    );

const fieldAttributesTrigger = () =>
    screen.getByRole('button', { name: 'Field Attributes' });

const schemaCommentMarker = (container: HTMLElement) =>
    container.querySelector('.border-t-pink-500');

describe('TableField discussion indicator', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        commentsState.isActive = true;
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        useTableDiscussionIndicator.mockClear();
        useFieldDiscussionIndicator.mockClear();
        useRelationshipDiscussionIndicator.mockClear();
        openTargetDiscussion.mockClear();
        showSidePanel.mockClear();
        selectSidebarSection.mockClear();
        updateField.mockClear();
        removeField.mockClear();
        handleNullableToggle.mockClear();
        handlePrimaryKeyToggle.mockClear();
        handleNameChange.mockClear();
    });

    it('calls useFieldDiscussionIndicator with the exact field id', () => {
        renderField();

        expect(useFieldDiscussionIndicator).toHaveBeenCalledWith('field-1');
    });

    it('uses only the field specialized hook', () => {
        renderField();

        expect(useFieldDiscussionIndicator).toHaveBeenCalled();
        expect(useTableDiscussionIndicator).not.toHaveBeenCalled();
        expect(useRelationshipDiscussionIndicator).not.toHaveBeenCalled();
    });

    it('hides the indicator when the field hook returns the empty indicator', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderField();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('shows the indicator when hasDiscussion is true', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides the indicator when hasDiscussion is false even if count is positive', () => {
        discussionIndicatorState.indicator = {
            commentCount: 5,
            hasDiscussion: false,
        };
        renderField();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('does not render a numeric count even when commentCount is greater than one', () => {
        discussionIndicatorState.indicator = withDiscussion(4);
        renderField();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.queryByText('4')).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId('discussion-indicator')).queryByText(
                /\d+/
            )
        ).not.toBeInTheDocument();
    });

    it('shows the indicator for readonly viewers', () => {
        discussionIndicatorState.indicator = withDiscussion(2);
        renderField({ readonly: true });

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(fieldAttributesTrigger()).toBeInTheDocument();
    });

    it('keeps the indicator visible regardless of write permissions when the hook reports presence', () => {
        // Visibility is owned by the specialized hook / private index.
        // The field row does not gate on readonly or comments availability.
        commentsState.isActive = false;
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField({ readonly: true });

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
    });

    it('does not show a field indicator when the hook stays empty for a table-partition hit', () => {
        // Partition isolation is owned by useFieldDiscussionIndicator /
        // getDiscussionIndicator. A table comment with the same ID must not
        // populate the field hook result.
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderField({ field: { ...baseField, id: 'shared-id' } });

        expect(useFieldDiscussionIndicator).toHaveBeenCalledWith('shared-id');
        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('does not show a field indicator when the hook stays empty for a relationship-partition hit', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderField({ field: { ...baseField, id: 'shared-rel-id' } });

        expect(useFieldDiscussionIndicator).toHaveBeenCalledWith(
            'shared-rel-id'
        );
        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('coexists with the schema/database comment affordance', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderField({
            field: { ...baseField, comments: 'schema note' },
        });

        expect(schemaCommentMarker(container)).not.toBeNull();
        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
    });

    it('keeps the Field Attributes trigger present and accessible', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(fieldAttributesTrigger()).toBeInTheDocument();
    });

    it('does not open a discussion when the decorative indicator is clicked', async () => {
        const user = userEvent.setup();
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        await user.click(screen.getByTestId('discussion-indicator'));

        expect(openTargetDiscussion).not.toHaveBeenCalled();
    });

    it('keeps Open discussion functional while the indicator is visible', async () => {
        const user = userEvent.setup();
        discussionIndicatorState.indicator = withDiscussion(3);
        renderField();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        await user.click(fieldAttributesTrigger());
        await user.click(
            screen.getByRole('button', { name: 'Open discussion' })
        );

        expect(openTargetDiscussion).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).toHaveBeenCalledWith({
            targetType: 'field',
            targetId: 'field-1',
        });
    });

    it('does not render raw field ids or badge count text', () => {
        discussionIndicatorState.indicator = withDiscussion(2);
        renderField();

        expect(screen.queryByText('field-1')).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId('discussion-indicator')).queryByText('2')
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('marks the indicator decorative for assistive technology', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
        expect(indicator).not.toHaveAttribute('tabindex');
        expect(indicator.tagName).toBe('SPAN');
        expect(indicator).toHaveClass('pointer-events-none', 'shrink-0');
    });

    it('is not a button or link and does not become a tab stop', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator.tagName).toBe('SPAN');
        expect(indicator).not.toHaveAttribute('role');
        expect(indicator).not.toHaveAttribute('href');
        expect(indicator).not.toHaveAttribute('tabindex');
    });

    it('preserves truncation on the identity column and shrink-0 on controls', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderField();

        const identityColumn = container.querySelector(
            '.flex.flex-1.items-center.justify-start.gap-1.overflow-hidden'
        );
        const controlsColumn = container.querySelector(
            '.flex.shrink-0.items-center.justify-end.gap-1'
        );

        expect(identityColumn).not.toBeNull();
        expect(controlsColumn).not.toBeNull();
        expect(controlsColumn).toContainElement(
            screen.getByTestId('discussion-indicator')
        );
        expect(screen.getByTestId('discussion-indicator')).toHaveClass(
            'shrink-0'
        );
    });

    it('keeps nullable and primary-key controls functional with the indicator visible', async () => {
        const user = userEvent.setup();
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        await user.click(screen.getByRole('button', { name: 'N' }));
        expect(handleNullableToggle).toHaveBeenCalled();

        const pkToggle = screen
            .getAllByRole('button')
            .find((button) => button.querySelector('svg.lucide-key-round'));
        expect(pkToggle).toBeDefined();
        await user.click(pkToggle!);
        expect(handlePrimaryKeyToggle).toHaveBeenCalled();
    });

    it('hides the drag handle and disables toggles in readonly mode while keeping the indicator', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderField({ readonly: true });

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(container.querySelector('.cursor-move')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'N' })).toBeDisabled();
        expect(screen.getByDisplayValue('email')).toHaveAttribute('readonly');
    });

    it('documents that EntityEditingBadge is not rendered on the side-panel field row', () => {
        // Editing awareness is broadcast via onFocus/onBlur only.
        // Canvas field nodes own EntityEditingBadge; this row does not.
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(
            screen.queryByTestId('entity-editing-badge')
        ).not.toBeInTheDocument();
    });
});
