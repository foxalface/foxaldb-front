import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import { en } from '@/i18n/locales/en';
import { TableFieldPopover } from '../table-field-modal';

const {
    chartDBState,
    conversationMenuState,
    useTargetConversationMenuAction,
    updateField,
    removeField,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
    },
    conversationMenuState: {
        showConversationAction: true,
        conversationLabel: 'Open conversation',
        isConversationPending: false,
        openConversationAction: vi.fn(),
    },
    useTargetConversationMenuAction: vi.fn(() => conversationMenuState),
    updateField: vi.fn(),
    removeField: vi.fn(),
}));

vi.mock('@/components/tag-selector/tag-selector', () => ({
    TagSelector: ({
        targetType,
        targetId,
        disabled,
    }: {
        targetType: string;
        targetId: string;
        disabled?: boolean;
    }) => (
        <div
            data-testid="tag-selector"
            data-target-type={targetType}
            data-target-id={targetId}
            data-disabled={disabled ? 'true' : 'false'}
        />
    ),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        readonly: chartDBState.readonly,
    }),
}));

vi.mock('@/hooks/use-target-conversation-menu-action', () => ({
    useTargetConversationMenuAction,
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

const field: DBField = {
    id: 'field-1',
    name: 'email',
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
};

const table: DBTable = {
    id: 'table-1',
    name: 'Clients',
    x: 0,
    y: 0,
    fields: [field],
    indexes: [],
    color: '#ffffff',
    isView: false,
    createdAt: 0,
};

type PopoverHarnessProps = {
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const PopoverHarness: React.FC<PopoverHarnessProps> = ({
    defaultOpen = false,
    onOpenChange,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <TableFieldPopover
            field={field}
            table={table}
            databaseType={DatabaseType.SQLITE}
            updateField={updateField}
            removeField={removeField}
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                onOpenChange?.(nextOpen);
            }}
        />
    );
};

const menuTrigger = () => screen.getByRole('button', { name: 'Field options' });

const renderPopover = (props: PopoverHarnessProps = {}) =>
    render(<PopoverHarness {...props} />);

const openAttributesPanel = async (
    user: ReturnType<typeof userEvent.setup>,
    options: { menuAlreadyOpen?: boolean } = {}
) => {
    if (!options.menuAlreadyOpen) {
        await user.click(menuTrigger());
    }
    const attributesItem = screen.getByRole('menuitem', {
        name: 'Attributes',
    });
    await user.hover(attributesItem);
    await user.keyboard('{ArrowRight}');
};

const openTagsPanel = async (
    user: ReturnType<typeof userEvent.setup>,
    options: { menuAlreadyOpen?: boolean } = {}
) => {
    if (!options.menuAlreadyOpen) {
        await user.click(menuTrigger());
    }
    const tagsItem = screen.getByRole('menuitem', { name: 'Tags' });
    await user.hover(tagsItem);
    await user.keyboard('{ArrowRight}');
};

const openPopover = async (props: PopoverHarnessProps = {}) => {
    const user = userEvent.setup();
    renderPopover(props);
    await openAttributesPanel(user);
    return user;
};

const openOptionsMenu = async (
    user: ReturnType<typeof userEvent.setup>,
    props: PopoverHarnessProps = {}
) => {
    renderPopover(props);
    await user.click(menuTrigger());
};

describe('TableFieldPopover conversation entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationMenuState.showConversationAction = true;
        conversationMenuState.conversationLabel = 'Open conversation';
        conversationMenuState.isConversationPending = false;
        useTargetConversationMenuAction.mockClear();
        conversationMenuState.openConversationAction.mockClear();
        updateField.mockClear();
        removeField.mockClear();
    });

    it('requests conversation menu action for the field target', () => {
        renderPopover();

        expect(useTargetConversationMenuAction).toHaveBeenCalledWith({
            targetType: 'field',
            targetId: 'field-1',
        });
    });

    it('exposes a translated accessible name on the field options trigger', async () => {
        const user = userEvent.setup();
        renderPopover();
        await openAttributesPanel(user);
        expect(
            screen.getByText('Field Attributes', {
                selector: '.text-sm.font-semibold',
            })
        ).toBeInTheDocument();
    });

    it('shows Open conversation when the menu action is available and the field is editable', async () => {
        const user = userEvent.setup();
        renderPopover();
        await user.click(menuTrigger());

        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'Delete' })
        ).toBeInTheDocument();

        await openAttributesPanel(user, { menuAlreadyOpen: true });
        expect(
            screen.queryByRole('button', { name: 'Delete' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Unique')).toBeInTheDocument();
        expect(screen.getByText('Default Value')).toBeInTheDocument();
    });

    it('shows Open conversation for readonly viewers when the menu action is available', async () => {
        chartDBState.readonly = true;
        const user = userEvent.setup();
        await openOptionsMenu(user);

        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
    });

    it('hides Delete and keeps editing controls readonly for viewers', async () => {
        chartDBState.readonly = true;
        const user = userEvent.setup();
        await openOptionsMenu(user);
        expect(
            screen.queryByRole('menuitem', { name: 'Delete' })
        ).not.toBeInTheDocument();

        await openAttributesPanel(user, { menuAlreadyOpen: true });

        const uniqueCheckbox = screen.getByRole('checkbox');
        expect(uniqueCheckbox).toBeDisabled();

        const defaultInput = screen.getByPlaceholderText('No default');
        expect(defaultInput).toHaveAttribute('readonly');
    });

    it('hides Open conversation when the menu action is unavailable', async () => {
        conversationMenuState.showConversationAction = false;
        const user = userEvent.setup();
        await openOptionsMenu(user);

        expect(
            screen.queryByRole('menuitem', { name: 'Open conversation' })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole('menuitem', { name: 'Delete' })
        ).toBeInTheDocument();

        await openAttributesPanel(user, { menuAlreadyOpen: true });
        expect(screen.getByText('Unique')).toBeInTheDocument();
    });

    it('does not leave an empty footer for readonly viewers when the menu action is unavailable', async () => {
        chartDBState.readonly = true;
        conversationMenuState.showConversationAction = false;
        await openPopover();

        expect(
            screen.queryByRole('menuitem', { name: 'Open conversation' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'Delete' })
        ).not.toBeInTheDocument();

        const content = screen.getByText('Field Attributes', {
            selector: '.text-sm.font-semibold',
        });
        const contentRoot = content.closest('.flex.flex-col.gap-2');
        expect(contentRoot).not.toBeNull();
        const separators = contentRoot!.querySelectorAll(
            '[data-orientation="horizontal"]'
        );
        expect(separators).toHaveLength(1);
        expect(
            contentRoot!.querySelector('[data-testid="tag-selector"]')
        ).toBeNull();
    });

    it('calls openConversationAction and closes the menu', async () => {
        const onOpenChange = vi.fn();
        const user = userEvent.setup();
        await openOptionsMenu(user, { onOpenChange });

        await user.click(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        );

        expect(
            conversationMenuState.openConversationAction
        ).toHaveBeenCalledTimes(1);
        expect(updateField).not.toHaveBeenCalled();
        expect(removeField).not.toHaveBeenCalled();
        expect(menuTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes the attributes panel when the pointer leaves it', async () => {
        await openPopover();

        expect(screen.getByText('Field Attributes')).toBeInTheDocument();

        const outside = document.createElement('div');
        document.body.appendChild(outside);
        outside.dispatchEvent(
            new PointerEvent('pointermove', {
                bubbles: true,
                pointerType: 'mouse',
            })
        );

        await waitFor(() => {
            expect(
                screen.queryByText('Field Attributes')
            ).not.toBeInTheDocument();
        });
        expect(
            screen.getByRole('menuitem', { name: 'Attributes' })
        ).toBeInTheDocument();
        outside.remove();
    });

    it('keeps Delete behavior unchanged', async () => {
        const user = userEvent.setup();
        await openOptionsMenu(user);

        await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

        expect(removeField).toHaveBeenCalledTimes(1);
        expect(
            conversationMenuState.openConversationAction
        ).not.toHaveBeenCalled();
    });

    it('does not render a badge or comment count', async () => {
        await openPopover();

        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /\d+/ })
        ).not.toBeInTheDocument();
    });

    it('opens tags from the root menu for a readonly viewer', async () => {
        chartDBState.readonly = true;
        const user = userEvent.setup();
        await openOptionsMenu(user);

        expect(
            screen.queryByRole('menuitem', { name: 'Delete' })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'Tags' })
        ).toBeInTheDocument();

        await openTagsPanel(user, { menuAlreadyOpen: true });
        expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('Open conversation remains keyboard accessible from the options menu', async () => {
        chartDBState.readonly = true;
        const user = userEvent.setup();
        await openOptionsMenu(user);

        const discussion = screen.getByRole('menuitem', {
            name: 'Open conversation',
        });
        discussion.focus();
        expect(discussion).toHaveFocus();
        await user.keyboard('{Enter}');

        expect(
            conversationMenuState.openConversationAction
        ).toHaveBeenCalledTimes(1);
    });

    it('exposes the field tag selector', async () => {
        const user = userEvent.setup();
        await openOptionsMenu(user);
        await openTagsPanel(user, { menuAlreadyOpen: true });

        expect(screen.getByTestId('tag-selector')).toHaveAttribute(
            'data-target-type',
            'field'
        );
        expect(screen.getByTestId('tag-selector')).toHaveAttribute(
            'data-target-id',
            'field-1'
        );
        expect(screen.getByTestId('tag-selector')).toHaveAttribute(
            'data-disabled',
            'false'
        );
    });

    it('shows field tags as disabled for a readonly viewer', async () => {
        chartDBState.readonly = true;
        const user = userEvent.setup();
        await openOptionsMenu(user);
        await openTagsPanel(user, { menuAlreadyOpen: true });

        expect(screen.getByTestId('tag-selector')).toHaveAttribute(
            'data-disabled',
            'true'
        );
    });

    it('reflects the pending conversation label from the menu action hook', async () => {
        conversationMenuState.conversationLabel = 'Starting conversation…';
        conversationMenuState.isConversationPending = true;
        const user = userEvent.setup();
        await openOptionsMenu(user);

        const discussion = screen.getByRole('menuitem', {
            name: 'Starting conversation…',
        });
        expect(discussion).toHaveAttribute('aria-busy', 'true');
        expect(discussion).toHaveAttribute('aria-disabled', 'true');
    });
});
