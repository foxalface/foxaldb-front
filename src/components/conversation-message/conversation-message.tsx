import React from 'react';
import { cn } from '@/lib/utils';

const isEmptyReactionSlot = (child: React.ReactNode): boolean => {
    if (!React.isValidElement(child)) {
        return child === null || child === undefined || child === false;
    }

    const type = child.type as { displayName?: string };
    if (
        type.displayName === 'ConversationMessageReactions' ||
        type.displayName === 'ConversationMessageReactionTrigger'
    ) {
        return !hasVisibleChildren(child.props.children);
    }

    return false;
};

const hasVisibleChildren = (children: React.ReactNode): boolean =>
    React.Children.toArray(children).some(
        (child) => !isEmptyReactionSlot(child)
    );

export interface ConversationMessageProps extends React.HTMLAttributes<HTMLElement> {
    isCurrentUser?: boolean;
}

export const CONVERSATION_MESSAGE_GUTTER_CLASS = 'min-w-10 flex-1 shrink';

export const CONVERSATION_MESSAGE_CLUSTER_CLASS =
    'flex min-w-0 w-fit max-w-[min(75%,28rem)]';

export const CONVERSATION_MESSAGE_BUBBLE_ANCHOR_HEIGHT_CLASS = 'h-[2.3125rem]';

export const CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS = `flex shrink-0 items-center self-start ${CONVERSATION_MESSAGE_BUBBLE_ANCHOR_HEIGHT_CLASS}`;

export const CONVERSATION_MESSAGE_META_TEXT_CLASS =
    'shrink-0 text-[10px] leading-none text-muted-foreground';

/** @deprecated Use CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS */
export const CONVERSATION_MESSAGE_AVATAR_ANCHOR_CLASS =
    CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS;

const ConversationMessage = React.forwardRef<
    HTMLElement,
    ConversationMessageProps
>(({ className, isCurrentUser = false, children, ...props }, ref) => (
    <article
        ref={ref}
        data-current-user={isCurrentUser ? 'true' : 'false'}
        className={cn('flex flex-col gap-1 px-1 py-3', className)}
        {...props}
    >
        {children}
    </article>
));
ConversationMessage.displayName = 'ConversationMessage';

const ConversationMessageRow = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isCurrentUser?: boolean;
    }
>(({ className, isCurrentUser = false, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex w-full min-w-0', className)} {...props}>
        {isCurrentUser ? (
            <div
                className={CONVERSATION_MESSAGE_GUTTER_CLASS}
                aria-hidden="true"
                data-testid="conversation-message-gutter-start"
            />
        ) : null}
        <div
            className={CONVERSATION_MESSAGE_CLUSTER_CLASS}
            data-testid="conversation-message-cluster"
        >
            {children}
        </div>
        {!isCurrentUser ? (
            <div
                className={CONVERSATION_MESSAGE_GUTTER_CLASS}
                aria-hidden="true"
                data-testid="conversation-message-gutter-end"
            />
        ) : null}
    </div>
));
ConversationMessageRow.displayName = 'ConversationMessageRow';

const ConversationMessageLayout = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex w-full min-w-0 flex-row flex-nowrap items-start gap-2',
            className
        )}
        {...props}
    />
));
ConversationMessageLayout.displayName = 'ConversationMessageLayout';

const ConversationMessageBodyRow = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex w-full min-w-0 flex-row flex-nowrap items-start gap-2',
            className
        )}
        data-testid="conversation-message-body-row"
        {...props}
    />
));
ConversationMessageBodyRow.displayName = 'ConversationMessageBodyRow';

export interface ConversationMessageBodyColumnProps extends React.HTMLAttributes<HTMLDivElement> {
    isCurrentUser?: boolean;
}

const ConversationMessageBodyColumn = React.forwardRef<
    HTMLDivElement,
    ConversationMessageBodyColumnProps
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex min-w-0 flex-col',
            isCurrentUser ? 'w-auto' : 'w-fit max-w-full',
            className
        )}
        data-testid="conversation-message-body-column"
        {...props}
    />
));
ConversationMessageBodyColumn.displayName = 'ConversationMessageBodyColumn';

const ConversationMessageAvatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS, className)}
        {...props}
    />
));
ConversationMessageAvatar.displayName = 'ConversationMessageAvatar';

const ConversationMessageTimestamp = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS, className)}
        data-testid="conversation-message-timestamp"
        {...props}
    />
));
ConversationMessageTimestamp.displayName = 'ConversationMessageTimestamp';

const ConversationMessageActions = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS, className)}
        data-testid="conversation-message-actions"
        {...props}
    />
));
ConversationMessageActions.displayName = 'ConversationMessageActions';

export interface ConversationMessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
    isCurrentUser?: boolean;
}

const ConversationMessageContent = React.forwardRef<
    HTMLDivElement,
    ConversationMessageContentProps
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'min-w-0',
            isCurrentUser ? 'w-auto' : 'w-full',
            className
        )}
        {...props}
    />
));
ConversationMessageContent.displayName = 'ConversationMessageContent';

const ConversationMessageHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isCurrentUser?: boolean;
    }
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex min-w-0 items-start gap-2',
            isCurrentUser ? 'justify-end' : 'justify-between',
            className
        )}
        {...props}
    />
));
ConversationMessageHeader.displayName = 'ConversationMessageHeader';

const ConversationMessageHeaderMeta = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('min-w-0 flex-1', className)} {...props} />
));
ConversationMessageHeaderMeta.displayName = 'ConversationMessageHeaderMeta';

const ConversationMessageHeaderTitleRow = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isCurrentUser?: boolean;
    }
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5',
            isCurrentUser ? 'justify-end' : undefined,
            className
        )}
        {...props}
    />
));
ConversationMessageHeaderTitleRow.displayName =
    'ConversationMessageHeaderTitleRow';

const ConversationMessageAuthor = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn(
            'truncate text-sm font-medium text-foreground',
            className
        )}
        {...props}
    />
));
ConversationMessageAuthor.displayName = 'ConversationMessageAuthor';

export interface ConversationMessageBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    isCurrentUser?: boolean;
    withTopSpacing?: boolean;
}

const ConversationMessageBody = React.forwardRef<
    HTMLDivElement,
    ConversationMessageBodyProps
>(
    (
        { className, isCurrentUser = false, withTopSpacing = false, ...props },
        ref
    ) => (
        <div
            ref={ref}
            className={cn(
                withTopSpacing ? 'mt-1' : undefined,
                'select-text rounded-md border px-2.5 py-1.5 text-start text-sm leading-relaxed text-foreground',
                isCurrentUser
                    ? 'border-border/60 bg-muted/40'
                    : 'border-border/40 bg-muted/20',
                className
            )}
            {...props}
        />
    )
);
ConversationMessageBody.displayName = 'ConversationMessageBody';

const ConversationMessageBodyText = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            'select-text whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
            className
        )}
        {...props}
    />
));
ConversationMessageBodyText.displayName = 'ConversationMessageBodyText';

const ConversationMessageFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isCurrentUser?: boolean;
    }
>(({ className, children, isCurrentUser = false, ...props }, ref) => {
    if (!hasVisibleChildren(children)) {
        return null;
    }

    return (
        <div
            ref={ref}
            className={cn(
                'mt-1 flex min-w-0 flex-col gap-1',
                isCurrentUser ? 'items-end' : 'items-start',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
ConversationMessageFooter.displayName = 'ConversationMessageFooter';

const ConversationMessageReactions = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    if (!hasVisibleChildren(children)) {
        return null;
    }

    return (
        <div
            ref={ref}
            data-slot="conversation-message-reactions"
            className={cn(
                'flex min-w-0 flex-wrap items-center gap-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
ConversationMessageReactions.displayName = 'ConversationMessageReactions';

const ConversationMessageReactionTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    if (!hasVisibleChildren(children)) {
        return null;
    }

    return (
        <div
            ref={ref}
            data-slot="conversation-message-reaction-trigger"
            className={cn('shrink-0', className)}
            {...props}
        >
            {children}
        </div>
    );
});
ConversationMessageReactionTrigger.displayName =
    'ConversationMessageReactionTrigger';

export {
    ConversationMessage,
    ConversationMessageRow,
    ConversationMessageLayout,
    ConversationMessageBodyRow,
    ConversationMessageBodyColumn,
    ConversationMessageAvatar,
    ConversationMessageTimestamp,
    ConversationMessageActions,
    ConversationMessageContent,
    ConversationMessageHeader,
    ConversationMessageHeaderMeta,
    ConversationMessageHeaderTitleRow,
    ConversationMessageAuthor,
    ConversationMessageBody,
    ConversationMessageBodyText,
    ConversationMessageFooter,
    ConversationMessageReactions,
    ConversationMessageReactionTrigger,
};
