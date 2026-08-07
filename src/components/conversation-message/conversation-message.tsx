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
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex w-full min-w-0',
            isCurrentUser ? 'justify-end' : 'justify-start',
            className
        )}
        {...props}
    />
));
ConversationMessageRow.displayName = 'ConversationMessageRow';

const ConversationMessageLayout = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isCurrentUser?: boolean;
    }
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex min-w-0 max-w-full items-start gap-2',
            isCurrentUser ? 'flex-row-reverse' : undefined,
            className
        )}
        {...props}
    />
));
ConversationMessageLayout.displayName = 'ConversationMessageLayout';

const ConversationMessageAvatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('shrink-0 self-start', className)}
        {...props}
    />
));
ConversationMessageAvatar.displayName = 'ConversationMessageAvatar';

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
            'min-w-0 max-w-[min(100%,28rem)]',
            isCurrentUser ? 'text-right' : undefined,
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
            isCurrentUser ? 'flex-row-reverse' : 'justify-between',
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
}

const ConversationMessageBody = React.forwardRef<
    HTMLDivElement,
    ConversationMessageBodyProps
>(({ className, isCurrentUser = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'mt-1 rounded-md border px-2.5 py-1.5 text-sm leading-relaxed text-foreground',
            isCurrentUser
                ? 'border-border/60 bg-muted/40'
                : 'border-border/40 bg-muted/20',
            className
        )}
        {...props}
    />
));
ConversationMessageBody.displayName = 'ConversationMessageBody';

const ConversationMessageBodyText = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            'whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
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
                'mt-1 flex min-w-0 flex-wrap items-center gap-1',
                isCurrentUser ? 'justify-end' : undefined,
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
    ConversationMessageAvatar,
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
