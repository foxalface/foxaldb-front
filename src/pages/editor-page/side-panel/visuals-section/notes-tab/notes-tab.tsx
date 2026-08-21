import React, { useCallback, useMemo } from 'react';
import { SidePanelAddButton } from '@/components/side-panel/side-panel-add-button';
import { Input } from '@/components/input/input';
import type { Note } from '@/lib/domain/note';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLayout } from '@/hooks/use-layout';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import { useTranslation } from 'react-i18next';
import { useViewport } from '@xyflow/react';
import { NotesList } from './notes-list/notes-list';

export interface NotesTabProps {}

export const NotesTab: React.FC<NotesTabProps> = () => {
    const { createNote, notes, readonly } = useChartDB();
    const viewport = useViewport();
    const { t } = useTranslation();
    const { openNoteFromSidebar } = useLayout();
    const [filterText, setFilterText] = React.useState('');
    const filterInputRef = React.useRef<HTMLInputElement>(null);

    const filteredNotes = useMemo(() => {
        const filterNoteContent: (note: Note) => boolean = (note) =>
            !filterText?.trim?.() ||
            note.content.toLowerCase().includes(filterText.toLowerCase());

        return notes.filter(filterNoteContent);
    }, [notes, filterText]);

    const createNoteWithLocation = useCallback(async () => {
        const padding = 80;
        const centerX = -viewport.x / viewport.zoom + padding / viewport.zoom;
        const centerY = -viewport.y / viewport.zoom + padding / viewport.zoom;
        const note = await createNote({
            x: centerX,
            y: centerY,
        });
        if (openNoteFromSidebar) {
            openNoteFromSidebar(note.id);
        }
    }, [
        createNote,
        openNoteFromSidebar,
        viewport.x,
        viewport.y,
        viewport.zoom,
    ]);

    const handleCreateNote = useCallback(async () => {
        setFilterText('');
        createNoteWithLocation();
    }, [createNoteWithLocation, setFilterText]);

    const handleClearFilter = useCallback(() => {
        setFilterText('');
    }, []);

    return (
        <div className="flex flex-1 flex-col overflow-hidden px-2">
            <div className="flex items-center gap-2 pb-1">
                <div className="flex-1">
                    <Input
                        ref={filterInputRef}
                        type="text"
                        placeholder={t('side_panel.notes_section.filter')}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                {!readonly ? (
                    <SidePanelAddButton
                        label={t('side_panel.notes_section.add_note')}
                        onClick={handleCreateNote}
                    />
                ) : null}
            </div>
            <SidePanelEmptyStateViewport>
                {notes.length === 0 ? (
                    <SidePanelEmptyState
                        icon={sidePanelEmptyStateIcon}
                        title={t('side_panel.notes_section.empty_state.title')}
                        description={t(
                            'side_panel.notes_section.empty_state.description'
                        )}
                        secondaryAction={
                            !readonly
                                ? {
                                      label: t(
                                          'side_panel.notes_section.add_note'
                                      ),
                                      onClick: handleCreateNote,
                                  }
                                : undefined
                        }
                    />
                ) : filterText && filteredNotes.length === 0 ? (
                    <SidePanelFilterEmptyState
                        title={t('side_panel.notes_section.no_results')}
                        clearLabel={t('side_panel.notes_section.clear')}
                        onClearFilter={handleClearFilter}
                    />
                ) : (
                    <NotesList notes={filteredNotes} />
                )}
            </SidePanelEmptyStateViewport>
        </div>
    );
};
