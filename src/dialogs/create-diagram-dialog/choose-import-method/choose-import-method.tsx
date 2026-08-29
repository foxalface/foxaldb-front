import React from 'react';
import { Database, FileInput } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import type { DatabaseType } from '@/lib/domain/database-type';
import { databaseTypeToLabelMap } from '@/lib/databases';
import { useTranslation } from 'react-i18next';
import { WizardChoiceCard, WizardChoiceGrid } from '../wizard-choice-card';

export interface ChooseImportMethodProps {
    databaseType: DatabaseType;
    onBack: () => void;
    onImportFromFile: () => void;
    onImportFromDatabase: () => void;
}

export const ChooseImportMethod: React.FC<ChooseImportMethodProps> = ({
    databaseType,
    onBack,
    onImportFromFile,
    onImportFromDatabase,
}) => {
    const { t } = useTranslation();
    const databaseLabel = databaseTypeToLabelMap[databaseType];

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {t('new_diagram_dialog.choose_import_method.title')}
                </DialogTitle>
                <DialogDescription>
                    {t('new_diagram_dialog.choose_import_method.description', {
                        database: databaseLabel,
                    })}
                </DialogDescription>
            </DialogHeader>
            <div data-testid="choose-import-method">
                <WizardChoiceGrid>
                    <WizardChoiceCard
                        icon={<FileInput className="size-7" />}
                        title={t(
                            'new_diagram_dialog.choose_import_method.from_file'
                        )}
                        description={t(
                            'new_diagram_dialog.choose_import_method.from_file_description'
                        )}
                        onClick={onImportFromFile}
                    />
                    <WizardChoiceCard
                        icon={<Database className="size-7" />}
                        title={t(
                            'new_diagram_dialog.choose_import_method.from_database'
                        )}
                        description={t(
                            'new_diagram_dialog.choose_import_method.from_database_description'
                        )}
                        onClick={onImportFromDatabase}
                    />
                </WizardChoiceGrid>
            </div>
            <DialogFooter className="mt-4 flex !justify-start gap-2">
                <Button type="button" variant="secondary" onClick={onBack}>
                    {t('new_diagram_dialog.choose_import_method.back')}
                </Button>
            </DialogFooter>
        </>
    );
};
