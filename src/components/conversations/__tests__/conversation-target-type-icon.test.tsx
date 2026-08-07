import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConversationTargetTypeIcon } from '@/components/conversations/conversation-target-type-icon';

describe('ConversationTargetTypeIcon', () => {
    it('renders diagram, table, field, and relationship icons', () => {
        const { rerender } = render(
            <ConversationTargetTypeIcon targetType="diagram" />
        );
        expect(
            screen.getByTestId('conversation-target-type-icon-diagram')
        ).toBeInTheDocument();

        rerender(<ConversationTargetTypeIcon targetType="table" />);
        expect(
            screen.getByTestId('conversation-target-type-icon-table')
        ).toBeInTheDocument();

        rerender(<ConversationTargetTypeIcon targetType="field" />);
        expect(
            screen.getByTestId('conversation-target-type-icon-field')
        ).toBeInTheDocument();

        rerender(<ConversationTargetTypeIcon targetType="relationship" />);
        expect(
            screen.getByTestId('conversation-target-type-icon-relationship')
        ).toBeInTheDocument();
    });
});
