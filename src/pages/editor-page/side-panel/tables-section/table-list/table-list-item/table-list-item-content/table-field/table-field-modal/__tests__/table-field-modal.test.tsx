import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import { en } from '@/i18n/locales/en';
import { TableFieldPopover } from '../table-field-modal';

const {
    chartDBState,
    commentsState,
    openTargetDiscussion,
    showSidePanel,
    selectSidebarSection,
    updateField,
    removeField,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
    },
    commentsState: {
        isActive: true,
    },
    openTargetDiscussion: vi.fn(),
    showSidePanel: vi.fn(),
    selectSidebarSection: vi.fn(),
    updateField: vi.fn(),
    removeField: vi.fn(),
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

const popoverTrigger = () =>
    screen.getByRole('button', { name: 'Field Attributes' });

const renderPopover = (props: PopoverHarnessProps = {}) =>
    render(<PopoverHarness {...props} />);

const openPopover = async (props: PopoverHarnessProps = {}) => {
    const user = userEvent.setup();
    renderPopover(props);
    await user.click(popoverTrigger());
    return user;
};

describe('TableFieldPopover discussion entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        commentsState.isActive = true;
        openTargetDiscussion.mockClear();
        showSidePanel.mockClear();
        selectSidebarSection.mockClear();
        updateField.mockClear();
        removeField.mockClear();
    });

    it('exposes a translated accessible name on the popover trigger', async () => {
        const user = userEvent.setup();
        renderPopover();
        const trigger = popoverTrigger();
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('button', { name: 'Open discussion' })
        ).toBeInTheDocument();
    });

    it('shows Open discussion when comments are active and the field is editable', async () => {
        await openPopover();

        expect(
            screen.getByRole('button', { name: 'Open discussion' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Delete Field' })
        ).toBeInTheDocument();
        expect(screen.getByText('Unique')).toBeInTheDocument();
        expect(screen.getByText('Default Value')).toBeInTheDocument();
    });

    it('shows Open discussion for readonly viewers when comments are active', async () => {
        chartDBState.readonly = true;
        await openPopover();

        expect(
            screen.getByRole('button', { name: 'Open discussion' })
        ).toBeInTheDocument();
    });

    it('hides Delete and keeps editing controls readonly for viewers', async () => {
        chartDBState.readonly = true;
        await openPopover();

        expect(
            screen.queryByRole('button', { name: 'Delete Field' })
        ).not.toBeInTheDocument();

        const uniqueCheckbox = screen.getByRole('checkbox');
        expect(uniqueCheckbox).toBeDisabled();

        const defaultInput = screen.getByPlaceholderText('No default');
        expect(defaultInput).toHaveAttribute('readonly');
    });

    it('hides Open discussion when comments are inactive', async () => {
        commentsState.isActive = false;
        await openPopover();

        expect(
            screen.queryByRole('button', { name: 'Open discussion' })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Delete Field' })
        ).toBeInTheDocument();
        expect(screen.getByText('Unique')).toBeInTheDocument();
    });

    it('does not leave an empty footer for readonly viewers when comments are inactive', async () => {
        chartDBState.readonly = true;
        commentsState.isActive = false;
        await openPopover();

        expect(
            screen.queryByRole('button', { name: 'Open discussion' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Delete Field' })
        ).not.toBeInTheDocument();

        const content = screen.getByText('Field Attributes', {
            selector: '.text-sm.font-semibold',
        });
        const contentRoot = content.closest('.flex.flex-col.gap-2');
        expect(contentRoot).not.toBeNull();
        const separators = contentRoot!.querySelectorAll(
            '[data-orientation="horizontal"]'
        );
        // Title separator only — no orphan footer separator
        expect(separators).toHaveLength(1);
        const children = Array.from(contentRoot!.children);
        expect(
            children[children.length - 1].getAttribute('data-orientation')
        ).not.toBe('horizontal');
    });

    it('calls openTargetDiscussion once with the field target payload and closes the popover', async () => {
        const onOpenChange = vi.fn();
        const user = userEvent.setup();
        renderPopover({ defaultOpen: true, onOpenChange });

        await user.click(
            screen.getByRole('button', { name: 'Open discussion' })
        );

        expect(openTargetDiscussion).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).toHaveBeenCalledWith({
            targetType: 'field',
            targetId: 'field-1',
        });
        expect(showSidePanel).not.toHaveBeenCalled();
        expect(selectSidebarSection).not.toHaveBeenCalled();
        expect(updateField).not.toHaveBeenCalled();
        expect(removeField).not.toHaveBeenCalled();
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(popoverTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps Delete Field behavior unchanged', async () => {
        const user = await openPopover();

        await user.click(screen.getByRole('button', { name: 'Delete Field' }));

        expect(removeField).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).not.toHaveBeenCalled();
    });

    it('does not render a badge or comment count', async () => {
        await openPopover();

        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /\d+/ })
        ).not.toBeInTheDocument();
    });

    it('viewer footer contains only Open discussion without orphan separators', async () => {
        chartDBState.readonly = true;
        await openPopover();

        const discussion = screen.getByRole('button', {
            name: 'Open discussion',
        });
        expect(
            screen.queryByRole('button', { name: 'Delete Field' })
        ).not.toBeInTheDocument();

        const contentRoot = discussion.closest('.flex.flex-col.gap-2');
        expect(contentRoot).not.toBeNull();
        const separators = contentRoot!.querySelectorAll(
            '[data-orientation="horizontal"]'
        );
        expect(separators).toHaveLength(1);

        const children = Array.from(contentRoot!.children);
        expect(children[0].getAttribute('data-orientation')).not.toBe(
            'horizontal'
        );
        expect(
            children[children.length - 1].getAttribute('data-orientation')
        ).not.toBe('horizontal');
        expect(children[children.length - 1]).toContainElement(discussion);
    });

    it('editable footer separates discussion from Delete without adjacent separators', async () => {
        await openPopover();

        const discussion = screen.getByRole('button', {
            name: 'Open discussion',
        });
        const deleteButton = screen.getByRole('button', {
            name: 'Delete Field',
        });
        const contentRoot = discussion.closest('.flex.flex-col.gap-2');
        expect(contentRoot).not.toBeNull();

        const children = Array.from(contentRoot!.children);
        const orientations = children.map((child) =>
            child.getAttribute('data-orientation')
        );
        expect(orientations[0]).not.toBe('horizontal');
        expect(orientations[orientations.length - 1]).not.toBe('horizontal');

        for (let i = 0; i < orientations.length - 1; i += 1) {
            if (orientations[i] === 'horizontal') {
                expect(orientations[i + 1]).not.toBe('horizontal');
            }
        }

        const discussionIndex = children.findIndex((child) =>
            child.contains(discussion)
        );
        const deleteIndex = children.findIndex((child) =>
            child.contains(deleteButton)
        );
        expect(discussionIndex).toBeGreaterThanOrEqual(0);
        expect(deleteIndex).toBeGreaterThan(discussionIndex);
        expect(orientations[discussionIndex + 1]).toBe('horizontal');
    });

    it('Open discussion remains keyboard accessible for viewers', async () => {
        chartDBState.readonly = true;
        const onOpenChange = vi.fn();
        const user = userEvent.setup();
        renderPopover({ defaultOpen: true, onOpenChange });

        const discussion = screen.getByRole('button', {
            name: 'Open discussion',
        });
        discussion.focus();
        expect(discussion).toHaveFocus();
        await user.keyboard('{Enter}');

        expect(openTargetDiscussion).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).toHaveBeenCalledWith({
            targetType: 'field',
            targetId: 'field-1',
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
