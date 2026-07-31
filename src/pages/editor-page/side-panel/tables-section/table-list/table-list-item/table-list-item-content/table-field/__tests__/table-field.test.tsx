import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { TableField } from '../table-field';

const {
    conversationsState,
    updateField,
    removeField,
    handleNullableToggle,
    handlePrimaryKeyToggle,
    handleNameChange,
} = vi.hoisted(() => ({
    conversationsState: {
        isAvailable: true,
    },
    updateField: vi.fn(),
    removeField: vi.fn(),
    handleNullableToggle: vi.fn(),
    handlePrimaryKeyToggle: vi.fn(),
    handleNameChange: vi.fn(),
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => conversationsState.isAvailable,
}));

vi.mock('@/components/conversation-indicator/conversation-indicator', () => ({
    ConversationIndicator: ({
        target,
        targetName,
    }: {
        target: { targetType: string; targetId: string };
        targetName: string;
    }) => (
        <span
            data-testid="conversation-indicator"
            data-target-type={target.targetType}
            data-target-id={target.targetId}
            data-target-name={targetName}
        />
    ),
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

describe('TableField conversations', () => {
    beforeEach(() => {
        conversationsState.isAvailable = true;
        updateField.mockClear();
        removeField.mockClear();
        handleNullableToggle.mockClear();
        handlePrimaryKeyToggle.mockClear();
        handleNameChange.mockClear();
    });

    it('renders ConversationIndicator when conversations are available', () => {
        renderField();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
    });

    it('hides ConversationIndicator when conversations are unavailable', () => {
        conversationsState.isAvailable = false;
        renderField();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
    });

    it('passes the field target and name to ConversationIndicator', () => {
        renderField({
            field: { ...baseField, id: 'field-42', name: 'username' },
        });

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute('data-target-type', 'field');
        expect(indicator).toHaveAttribute('data-target-id', 'field-42');
        expect(indicator).toHaveAttribute('data-target-name', 'username');
    });

    it('keeps ConversationIndicator visible in readonly mode when conversations are available', () => {
        renderField({ readonly: true });

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(fieldAttributesTrigger()).toBeInTheDocument();
    });

    it('places ConversationIndicator in the controls column', () => {
        const { container } = renderField();

        const controlsColumn = container.querySelector(
            '.flex.shrink-0.items-center.justify-end.gap-1'
        );

        expect(controlsColumn).not.toBeNull();
        expect(controlsColumn).toContainElement(
            screen.getByTestId('conversation-indicator')
        );
    });
});

describe('TableField field rendering', () => {
    beforeEach(() => {
        conversationsState.isAvailable = true;
    });

    it('renders the field name and type controls', () => {
        renderField();

        expect(screen.getByDisplayValue('email')).toBeInTheDocument();
        expect(screen.getByTestId('field-type-select')).toHaveTextContent(
            'text'
        );
    });

    it('shows the schema comment marker when the field has comments', () => {
        const { container } = renderField({
            field: { ...baseField, comments: 'schema note' },
        });

        expect(schemaCommentMarker(container)).not.toBeNull();
    });

    it('hides the schema comment marker when the field has no comments', () => {
        const { container } = renderField();

        expect(schemaCommentMarker(container)).toBeNull();
    });

    it('coexists with the schema comment affordance and conversation indicator', () => {
        const { container } = renderField({
            field: { ...baseField, comments: 'schema note' },
        });

        expect(schemaCommentMarker(container)).not.toBeNull();
        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
    });

    it('keeps the Field Attributes trigger present and accessible', () => {
        renderField();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(fieldAttributesTrigger()).toBeInTheDocument();
    });
});

describe('TableField controls', () => {
    beforeEach(() => {
        conversationsState.isAvailable = true;
        handleNullableToggle.mockClear();
        handlePrimaryKeyToggle.mockClear();
    });

    it('keeps nullable and primary-key controls functional with the indicator visible', async () => {
        const user = userEvent.setup();
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
        const { container } = renderField({ readonly: true });

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(container.querySelector('.cursor-move')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'N' })).toBeDisabled();
        expect(screen.getByDisplayValue('email')).toHaveAttribute('readonly');
    });

    it('preserves truncation on the identity column and shrink-0 on controls', () => {
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
            screen.getByTestId('conversation-indicator')
        );
    });

    it('does not render EntityEditingBadge on the side-panel field row', () => {
        renderField();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('entity-editing-badge')
        ).not.toBeInTheDocument();
    });
});
