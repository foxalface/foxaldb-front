import React, {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ToggleGroup } from '@/components/toggle/toggle-group';
import { ConversationMessageDaySeparator } from '@/components/conversation-message/conversation-message-day-separator';
import { DialogInternalContent } from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    filterDatabaseTypesBySearch,
    getDatabaseTypeGroups,
} from '@/lib/databases';
import { cn } from '@/lib/utils';
import { DatabaseOption } from './database-option';
import { useTranslation } from 'react-i18next';

export interface SelectDatabaseContentProps {
    databaseType: DatabaseType;
    searchTerm: string;
    setDatabaseType: React.Dispatch<React.SetStateAction<DatabaseType>>;
    onDatabaseSelected: (selectedDatabaseType: DatabaseType) => void;
}

const DATABASE_GRID_CLASS =
    'grid grid-flow-row grid-cols-3 content-start gap-4';

export const SelectDatabaseContent: React.FC<SelectDatabaseContentProps> = ({
    databaseType,
    searchTerm,
    setDatabaseType,
    onDatabaseSelected,
}) => {
    const { t } = useTranslation();
    const primarySectionRef = useRef<HTMLElement>(null);
    const [viewportHeight, setViewportHeight] = useState<number>();
    const { primary, other } = useMemo(() => getDatabaseTypeGroups(), []);

    const filteredPrimaryTypes = useMemo(
        () => filterDatabaseTypesBySearch(primary, searchTerm),
        [primary, searchTerm]
    );

    const filteredOtherTypes = useMemo(
        () => filterDatabaseTypesBySearch(other, searchTerm),
        [other, searchTerm]
    );

    const hasVisibleDatabaseTypes =
        filteredPrimaryTypes.length > 0 || filteredOtherTypes.length > 0;

    useLayoutEffect(() => {
        if (searchTerm.trim().length > 0 || viewportHeight !== undefined) {
            return;
        }

        const height = primarySectionRef.current?.offsetHeight;
        if (height && height > 0) {
            setViewportHeight(height);
        }
    }, [searchTerm, viewportHeight, filteredPrimaryTypes.length]);

    const handleDatabaseChange = useCallback(
        (value: DatabaseType) => {
            if (!value) {
                setDatabaseType(DatabaseType.GENERIC);
            } else {
                setDatabaseType(value);
                onDatabaseSelected(value);
            }
        },
        [onDatabaseSelected, setDatabaseType]
    );

    return (
        <DialogInternalContent
            className={cn(
                'w-full !flex-none max-h-none',
                viewportHeight === undefined && 'h-[12.5rem] md:h-[18.5rem]'
            )}
            style={
                viewportHeight !== undefined
                    ? { height: viewportHeight }
                    : undefined
            }
        >
            {hasVisibleDatabaseTypes ? (
                <ToggleGroup
                    value={databaseType}
                    onValueChange={handleDatabaseChange}
                    type="single"
                    className="flex w-full flex-col items-stretch gap-6"
                >
                    {filteredPrimaryTypes.length > 0 ? (
                        <section
                            ref={primarySectionRef}
                            className="flex w-full flex-col gap-2"
                        >
                            <ConversationMessageDaySeparator
                                label={t(
                                    'new_diagram_dialog.database_selection.primary_group'
                                )}
                            />
                            <div className={DATABASE_GRID_CLASS}>
                                {filteredPrimaryTypes.map((type) => (
                                    <DatabaseOption key={type} type={type} />
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {filteredOtherTypes.length > 0 ? (
                        <section className="flex w-full flex-col gap-2">
                            <ConversationMessageDaySeparator
                                label={t(
                                    'new_diagram_dialog.database_selection.other_group'
                                )}
                            />
                            <div className={DATABASE_GRID_CLASS}>
                                {filteredOtherTypes.map((type) => (
                                    <DatabaseOption key={type} type={type} />
                                ))}
                            </div>
                        </section>
                    ) : null}
                </ToggleGroup>
            ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    {t(
                        'new_diagram_dialog.database_selection.search_no_results'
                    )}
                </p>
            )}
        </DialogInternalContent>
    );
};
