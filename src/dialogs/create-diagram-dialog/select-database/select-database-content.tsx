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
    const openSourceSectionRef = useRef<HTMLElement>(null);
    const [viewportHeight, setViewportHeight] = useState<number>();
    const { openSource, enterprise, specialized } = useMemo(
        () => getDatabaseTypeGroups(),
        []
    );

    const filteredOpenSourceTypes = useMemo(
        () => filterDatabaseTypesBySearch(openSource, searchTerm),
        [openSource, searchTerm]
    );

    const filteredEnterpriseTypes = useMemo(
        () => filterDatabaseTypesBySearch(enterprise, searchTerm),
        [enterprise, searchTerm]
    );

    const filteredSpecializedTypes = useMemo(
        () => filterDatabaseTypesBySearch(specialized, searchTerm),
        [specialized, searchTerm]
    );

    const hasVisibleDatabaseTypes =
        filteredOpenSourceTypes.length > 0 ||
        filteredEnterpriseTypes.length > 0 ||
        filteredSpecializedTypes.length > 0;

    useLayoutEffect(() => {
        if (searchTerm.trim().length > 0 || viewportHeight !== undefined) {
            return;
        }

        const height = openSourceSectionRef.current?.offsetHeight;
        if (height && height > 0) {
            setViewportHeight(height);
        }
    }, [searchTerm, viewportHeight, filteredOpenSourceTypes.length]);

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
                    className="flex w-full flex-col items-stretch gap-4"
                >
                    {filteredOpenSourceTypes.length > 0 ? (
                        <section
                            ref={openSourceSectionRef}
                            className="flex w-full flex-col gap-2"
                        >
                            <ConversationMessageDaySeparator
                                label={t(
                                    'new_diagram_dialog.database_selection.open_source_group'
                                )}
                            />
                            <div className={DATABASE_GRID_CLASS}>
                                {filteredOpenSourceTypes.map((type) => (
                                    <DatabaseOption key={type} type={type} />
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {filteredEnterpriseTypes.length > 0 ? (
                        <section className="flex w-full flex-col gap-2">
                            <ConversationMessageDaySeparator
                                label={t(
                                    'new_diagram_dialog.database_selection.enterprise_group'
                                )}
                            />
                            <div className={DATABASE_GRID_CLASS}>
                                {filteredEnterpriseTypes.map((type) => (
                                    <DatabaseOption key={type} type={type} />
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {filteredSpecializedTypes.length > 0 ? (
                        <section className="flex w-full flex-col gap-2">
                            <ConversationMessageDaySeparator
                                label={t(
                                    'new_diagram_dialog.database_selection.specialized_group'
                                )}
                            />
                            <div className={DATABASE_GRID_CLASS}>
                                {filteredSpecializedTypes.map((type) => (
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
