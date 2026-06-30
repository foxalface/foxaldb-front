import React from 'react';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { cn } from '@/lib/utils';
import { useDiagramPresence } from '@/pages/editor-page/use-diagram-presence';
import { PresencePopoverContent } from './presence-popover-content';

const MAX_VISIBLE_AVATARS = 3;

export const PresenceAvatarStack: React.FC = () => {
    const { members, isPresenceVisible } = useDiagramPresence();

    if (!isPresenceVisible || members.length === 0) {
        return null;
    }

    const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = members.length - visibleMembers.length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex shrink-0 items-center -space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Diagram viewers"
                >
                    {visibleMembers.map((member, index) => (
                        <Avatar
                            key={member.id}
                            className={cn(
                                'size-7 border-2 border-background',
                                index > 0 && 'relative'
                            )}
                            style={{ zIndex: visibleMembers.length - index }}
                        >
                            <AvatarFallback
                                className={cn(
                                    'text-[10px] font-medium text-white',
                                    member.colorClass
                                )}
                            >
                                {member.initials}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {overflowCount > 0 ? (
                        <span
                            className="relative z-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground"
                            aria-hidden
                        >
                            +{overflowCount}
                        </span>
                    ) : null}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-3">
                <PresencePopoverContent members={members} />
            </PopoverContent>
        </Popover>
    );
};
