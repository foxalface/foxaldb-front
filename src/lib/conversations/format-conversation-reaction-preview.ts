import type { TFunction } from 'i18next';
import type { ConversationReactionAggregate } from './conversation-types';

const formatPreviewName = (
    t: TFunction,
    user: ConversationReactionAggregate['previewUsers'][number]
): string => {
    if (user === null) {
        return t('side_panel.conversations_section.deleted_user');
    }

    const fullName = user.fullName?.trim();

    if (fullName) {
        return fullName;
    }

    return t('side_panel.conversations_section.deleted_user');
};

export const formatConversationReactionPreview = (
    reaction: ConversationReactionAggregate,
    t: TFunction
): string => {
    const names = reaction.previewUsers.map((user) =>
        formatPreviewName(t, user)
    );

    if (!reaction.previewTruncated) {
        return names.join(', ');
    }

    const visibleCount = names.length;
    const hiddenCount = Math.max(reaction.count - visibleCount, 0);

    if (hiddenCount <= 0) {
        return names.join(', ');
    }

    const othersLabel = t(
        'side_panel.conversations_section.detail.message.reactions.preview_and_others',
        { count: hiddenCount }
    );

    if (names.length === 0) {
        return othersLabel;
    }

    return `${names.join(', ')} ${othersLabel}`;
};
