import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Input } from '@/components/input/input';
import { useTranslation } from 'react-i18next';
import { SelectDatabaseContent } from './select-database-content';
import { useDialog } from '@/hooks/use-dialog';
import type { DatabaseType } from '@/lib/domain/database-type';

export interface SelectDatabaseProps {
    onDatabaseSelected: () => void;
    databaseType: DatabaseType;
    setDatabaseType: React.Dispatch<React.SetStateAction<DatabaseType>>;
    hasExistingDiagram: boolean;
}

export const SelectDatabase: React.FC<SelectDatabaseProps> = ({
    onDatabaseSelected,
    databaseType,
    setDatabaseType,
    hasExistingDiagram,
}) => {
    const { t } = useTranslation();
    const { openImportDiagramDialog } = useDialog();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            <div className="mx-auto flex w-full max-w-[26rem] flex-col items-stretch gap-4 overflow-visible">
                <DialogHeader>
                    <DialogTitle>
                        {t('new_diagram_dialog.database_selection.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('new_diagram_dialog.database_selection.description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full shrink-0">
                    <Search
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        placeholder={t(
                            'new_diagram_dialog.database_selection.search_placeholder'
                        )}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="px-9 focus-visible:ring-0"
                    />
                    {searchTerm ? (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={t(
                                'new_diagram_dialog.database_selection.clear_search'
                            )}
                        >
                            <X className="size-4" />
                        </button>
                    ) : null}
                </div>
                <SelectDatabaseContent
                    databaseType={databaseType}
                    searchTerm={searchTerm}
                    onDatabaseSelected={onDatabaseSelected}
                    setDatabaseType={setDatabaseType}
                />
            </div>
            {!hasExistingDiagram ? (
                <DialogFooter className="mt-4 flex !justify-start gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={openImportDiagramDialog}
                    >
                        {t('new_diagram_dialog.import_from_file')}
                    </Button>
                </DialogFooter>
            ) : null}
        </>
    );
};
