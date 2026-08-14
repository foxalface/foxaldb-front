import React, { useState } from 'react';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/accordion/accordion';
import {
    RelationshipListItemEditingConflict,
    RelationshipListItemHeader,
} from './relationship-list-item-header/relationship-list-item-header';
import { RelationshipListItemContent } from './relationship-list-item-content/relationship-list-item-content';
import type { DBRelationship } from '@/lib/domain/db-relationship';

export interface RelationshipListItemProps {
    relationship: DBRelationship;
}

export const RelationshipListItem = React.forwardRef<
    React.ElementRef<typeof AccordionItem>,
    RelationshipListItemProps
>(({ relationship }, ref) => {
    const [isLocallyEditing, setIsLocallyEditing] = useState(false);

    return (
        <AccordionItem
            value={relationship.id}
            className="border-none"
            ref={ref}
        >
            <div className="w-full rounded-md border border-border">
                <AccordionTrigger
                    asChild
                    className="w-full rounded-md px-2 py-0 hover:bg-accent hover:no-underline data-[state=open]:rounded-b-none"
                >
                    <RelationshipListItemHeader
                        relationship={relationship}
                        onLocalEditingChange={setIsLocallyEditing}
                    />
                </AccordionTrigger>
                <RelationshipListItemEditingConflict
                    relationshipId={relationship.id}
                    isLocallyEditing={isLocallyEditing}
                />
                <AccordionContent className="p-1 pb-0">
                    <RelationshipListItemContent relationship={relationship} />
                </AccordionContent>
            </div>
        </AccordionItem>
    );
});

RelationshipListItem.displayName = 'RelationshipListItem';
