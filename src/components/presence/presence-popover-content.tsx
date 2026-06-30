import React from 'react';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import { cn } from '@/lib/utils';
import type { PresenceMember } from '@/pages/editor-page/use-diagram-presence';

export interface PresencePopoverContentProps {
    members: PresenceMember[];
}

export const PresencePopoverContent: React.FC<PresencePopoverContentProps> = ({
    members,
}) => {
    return (
        <ul className="space-y-2">
            {members.map((member) => (
                <li key={member.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="size-7">
                        <AvatarFallback
                            className={cn(
                                'text-[10px] font-medium text-white',
                                member.colorClass
                            )}
                        >
                            {member.initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                        {member.isSelf ? 'You' : member.name}
                    </span>
                </li>
            ))}
        </ul>
    );
};
