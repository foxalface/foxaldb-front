import React, { useMemo } from 'react';
import { EmojiPicker } from 'frimousse';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface ConversationEmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

const mapI18nLanguageToFrimousseLocale = (
    language: string
): React.ComponentProps<typeof EmojiPicker.Root>['locale'] => {
    const normalized = language.replace('_', '-').toLowerCase();

    if (normalized.startsWith('fr')) {
        return 'fr';
    }

    if (normalized.startsWith('de')) {
        return 'de';
    }

    if (normalized.startsWith('es')) {
        return 'es';
    }

    if (normalized.startsWith('ja')) {
        return 'ja';
    }

    if (normalized.startsWith('ko')) {
        return 'ko';
    }

    if (normalized.startsWith('pt')) {
        return 'pt';
    }

    if (normalized.startsWith('ru')) {
        return 'ru';
    }

    if (normalized.startsWith('uk')) {
        return 'uk';
    }

    if (normalized.startsWith('vi')) {
        return 'vi';
    }

    if (normalized.startsWith('zh-tw') || normalized === 'zh-hant') {
        return 'zh-hant';
    }

    if (normalized.startsWith('zh')) {
        return 'zh';
    }

    return 'en';
};

export const ConversationEmojiPicker: React.FC<
    ConversationEmojiPickerProps
> = ({ onEmojiSelect }) => {
    const { t, i18n } = useTranslation();
    const locale = useMemo(
        () => mapI18nLanguageToFrimousseLocale(i18n.language),
        [i18n.language]
    );

    return (
        <EmojiPicker.Root
            locale={locale}
            className="flex h-72 w-full flex-col"
            onEmojiSelect={(emoji) => {
                onEmojiSelect(emoji.emoji);
            }}
        >
            <div className="border-b p-2">
                <EmojiPicker.Search
                    placeholder={t(
                        'side_panel.conversations_section.detail.message.reactions.picker_search_placeholder'
                    )}
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label={t(
                        'side_panel.conversations_section.detail.message.reactions.picker_aria_label'
                    )}
                />
            </div>
            <EmojiPicker.Viewport className="min-h-0 flex-1">
                <EmojiPicker.Loading className="p-3 text-sm text-muted-foreground">
                    {t(
                        'side_panel.conversations_section.detail.message.reactions.picker_loading'
                    )}
                </EmojiPicker.Loading>
                <EmojiPicker.Empty className="p-3 text-sm text-muted-foreground">
                    {t(
                        'side_panel.conversations_section.detail.message.reactions.picker_empty'
                    )}
                </EmojiPicker.Empty>
                <EmojiPicker.List
                    className="p-1"
                    components={{
                        CategoryHeader: ({ category, ...props }) => (
                            <div
                                {...props}
                                className="sticky top-0 z-10 bg-popover px-2 py-1 text-xs font-medium text-muted-foreground"
                            >
                                {category.label}
                            </div>
                        ),
                        Row: ({ children, ...props }) => (
                            <div
                                {...props}
                                className="grid grid-cols-8 gap-0.5"
                            >
                                {children}
                            </div>
                        ),
                        Emoji: ({ emoji, ...props }) => (
                            <button
                                {...props}
                                type="button"
                                className={cn(
                                    'flex size-8 items-center justify-center rounded-md text-lg hover:bg-accent',
                                    emoji.isActive ? 'bg-accent' : undefined
                                )}
                            >
                                {emoji.emoji}
                            </button>
                        ),
                    }}
                />
            </EmojiPicker.Viewport>
        </EmojiPicker.Root>
    );
};
