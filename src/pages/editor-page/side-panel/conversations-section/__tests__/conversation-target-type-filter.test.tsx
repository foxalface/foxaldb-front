import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import type { ConversationTargetType } from '@/lib/conversations/conversation-types';
import { ConversationTargetTypeFilter } from '../conversation-target-type-filter';
import { DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES } from '../filter-conversations';

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

const StatefulConversationTargetTypeFilter: React.FC = () => {
    const [selectedTargetTypes, setSelectedTargetTypes] = useState<
        ConversationTargetType[]
    >(DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES);

    return (
        <ConversationTargetTypeFilter
            selectedTargetTypes={selectedTargetTypes}
            onSelectedTargetTypesChange={setSelectedTargetTypes}
        />
    );
};

describe('ConversationTargetTypeFilter', () => {
    it('toggles selected target types', async () => {
        const user = userEvent.setup();

        render(<StatefulConversationTargetTypeFilter />);

        await user.click(
            screen.getByRole('button', { name: 'Filter by conversation type' })
        );
        await user.click(screen.getByRole('checkbox', { name: 'Diagram' }));
        await user.click(screen.getByRole('checkbox', { name: 'Field' }));
        await user.click(
            screen.getByRole('checkbox', { name: 'Relationship' })
        );

        expect(screen.getByRole('checkbox', { name: 'Table' })).toBeChecked();
        expect(
            screen.getByRole('checkbox', { name: 'Diagram' })
        ).not.toBeChecked();
    });

    it('uses a stable trigger label', () => {
        render(
            <ConversationTargetTypeFilter
                selectedTargetTypes={['table', 'field']}
                onSelectedTargetTypesChange={vi.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Filter by conversation type',
            })
        ).toHaveTextContent('Type');
    });
});
