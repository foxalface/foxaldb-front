import React, { useCallback } from 'react';
import { GripVertical, Trash2, CircleDotDashed } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Note } from '@/lib/domain/note';
import { useChartDB } from '@/hooks/use-chartdb';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@/components/color-picker/color-picker';
import { ListItemHeaderButton } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
import { useFocusOn } from '@/hooks/use-focus-on';
import { mergeRefs } from '@/lib/utils';

export interface NoteListItemProps {
    note: Note;
}

export const NoteListItem = React.forwardRef<HTMLDivElement, NoteListItemProps>(
    ({ note }, forwardedRef) => {
        const { updateNote, removeNote, readonly } = useChartDB();
        const { t } = useTranslation();
        const { focusOnNote } = useFocusOn();

        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({
                id: note.id,
            });

        const combinedRef = mergeRefs<HTMLDivElement>(forwardedRef, setNodeRef);

        const style = {
            transform: CSS.Translate.toString(transform),
            transition,
        };

        const handleDelete = useCallback(
            (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                event.stopPropagation();
                removeNote(note.id);
            },
            [note.id, removeNote]
        );

        const handleColorChange = useCallback(
            (color: string) => {
                updateNote(note.id, { color });
            },
            [note.id, updateNote]
        );

        const handleFocusOnNote = useCallback(
            (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                event.stopPropagation();
                focusOnNote(note.id);
            },
            [focusOnNote, note.id]
        );

        return (
            <div
                className="w-full rounded-md border border-border hover:bg-accent"
                ref={combinedRef}
                style={{
                    ...style,
                    borderLeftWidth: '6px',
                    borderLeftColor: note.color,
                }}
                {...attributes}
            >
                <div className="group flex min-h-11 items-center justify-between gap-1 overflow-hidden p-2">
                    {!readonly ? (
                        <div
                            className="flex cursor-move items-center justify-center"
                            {...listeners}
                        >
                            <GripVertical className="size-4 text-muted-foreground" />
                        </div>
                    ) : null}

                    <div className="flex min-w-0 flex-1">
                        <div className="truncate px-2 py-0.5 text-sm">
                            {note.content || (
                                <span className="italic text-muted-foreground">
                                    {t(
                                        'side_panel.notes_section.note.empty_note'
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-row-reverse items-center">
                        {!readonly ? (
                            <ListItemHeaderButton
                                onClick={handleDelete}
                                aria-label={t('delete')}
                                role="button"
                                className="!text-red-700 hover:!text-red-700 dark:!text-red-700 dark:hover:!text-red-700"
                            >
                                <Trash2 />
                            </ListItemHeaderButton>
                        ) : null}
                        {!readonly ? (
                            <ColorPicker
                                appearance="list-item-header"
                                color={note.color}
                                onChange={handleColorChange}
                            />
                        ) : null}
                        <div className="flex items-center md:hidden md:group-focus-within:flex md:group-hover:flex">
                            <ListItemHeaderButton onClick={handleFocusOnNote}>
                                <CircleDotDashed />
                            </ListItemHeaderButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

NoteListItem.displayName = 'NoteListItem';
