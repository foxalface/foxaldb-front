import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/toggle/toggle-group';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/avatar/avatar';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import {
    databaseEditionToImageMap,
    databaseEditionToLabelMap,
    databaseTypeToEditionMap,
} from '@/lib/domain/database-edition';
import { databaseSecondaryLogoMap } from '@/lib/databases';
import { useTranslation } from 'react-i18next';

export interface DatabaseEditionPickerProps {
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    setDatabaseEdition: React.Dispatch<
        React.SetStateAction<DatabaseEdition | undefined>
    >;
}

export const DatabaseEditionPicker: React.FC<DatabaseEditionPickerProps> = ({
    databaseType,
    databaseEdition,
    setDatabaseEdition,
}) => {
    const { t } = useTranslation();
    const editions = databaseTypeToEditionMap[databaseType];

    if (editions.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
                {t('new_diagram_dialog.import_from_database.database_edition')}
            </p>
            <ToggleGroup
                type="single"
                className="flex-wrap justify-start gap-2"
                value={!databaseEdition ? 'regular' : databaseEdition}
                onValueChange={(value) => {
                    setDatabaseEdition(
                        value === 'regular'
                            ? undefined
                            : (value as DatabaseEdition)
                    );
                }}
                aria-label={t(
                    'new_diagram_dialog.import_from_database.database_edition'
                )}
            >
                <ToggleGroupItem
                    value="regular"
                    variant="outline"
                    className="h-8 gap-1 px-2 shadow-none data-[state=on]:bg-slate-200 dark:data-[state=on]:bg-slate-700"
                >
                    <Avatar className="size-4 rounded-none">
                        <AvatarImage
                            src={databaseSecondaryLogoMap[databaseType]}
                            alt=""
                        />
                        <AvatarFallback>
                            {t(
                                'new_diagram_dialog.import_from_database.edition_regular'
                            )}
                        </AvatarFallback>
                    </Avatar>
                    {t(
                        'new_diagram_dialog.import_from_database.edition_regular'
                    )}
                </ToggleGroupItem>
                {editions.map((edition) => (
                    <ToggleGroupItem
                        value={edition}
                        key={edition}
                        variant="outline"
                        className="h-8 gap-1 px-2 shadow-none data-[state=on]:bg-slate-200 dark:data-[state=on]:bg-slate-700"
                    >
                        <Avatar className="size-4">
                            <AvatarImage
                                src={databaseEditionToImageMap[edition]}
                                alt={databaseEditionToLabelMap[edition]}
                            />
                            <AvatarFallback>
                                {databaseEditionToLabelMap[edition]}
                            </AvatarFallback>
                        </Avatar>
                        {databaseEditionToLabelMap[edition]}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
};
