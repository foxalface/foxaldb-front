import React from 'react';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/accordion/accordion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DBCustomType } from '@/lib/domain/db-custom-type';
import { CustomTypeListItemHeader } from './custom-type-list-item-header/custom-type-list-item-header';
import { CustomTypeListItemContent } from './custom-type-list-item-content/custom-type-list-item-content';

export interface CustomTypeListItemProps {
    customType: DBCustomType;
}

export const CustomTypeListItem = React.forwardRef<
    React.ElementRef<typeof AccordionItem>,
    CustomTypeListItemProps
>(({ customType }, ref) => {
    const { attributes, setNodeRef, transform, transition } = useSortable({
        id: customType.id,
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <AccordionItem value={customType.id} className="border-none" ref={ref}>
            <div
                className="w-full rounded-md border border-border"
                ref={setNodeRef}
                style={style}
                {...attributes}
            >
                <AccordionTrigger
                    className="w-full rounded-md px-2 py-0 hover:bg-accent hover:no-underline data-[state=open]:rounded-b-none"
                    asChild
                >
                    <CustomTypeListItemHeader customType={customType} />
                </AccordionTrigger>
                <AccordionContent className="p-1 pb-0">
                    <CustomTypeListItemContent customType={customType} />
                </AccordionContent>
            </div>
        </AccordionItem>
    );
});

CustomTypeListItem.displayName = 'CustomTypeListItem';
