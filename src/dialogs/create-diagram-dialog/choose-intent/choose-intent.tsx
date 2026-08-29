import React from 'react';
import { CirclePlus, FileInput } from 'lucide-react';
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

export interface ChooseIntentProps {
    databaseType: DatabaseType;
    onBack: () => void;
    onCreateEmpty: () => void;
    onImport: () => void;
}

export const ChooseIntent: React.FC<ChooseIntentProps> = ({
    databaseType,
    onBack,
    onCreateEmpty,
    onImport,
}) => {
    const { t } = useTranslation();
    const databaseLabel = databaseTypeToLabelMap[databaseType];

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {t('new_diagram_dialog.choose_intent.title')}
                </DialogTitle>
                <DialogDescription>
                    {t('new_diagram_dialog.choose_intent.description', {
                        database: databaseLabel,
                    })}
                </DialogDescription>
            </DialogHeader>
            <WizardChoiceGrid>
                <WizardChoiceCard
                    icon={<CirclePlus className="size-7" />}
                    title={t('new_diagram_dialog.choose_intent.create_empty')}
                    description={t(
                        'new_diagram_dialog.choose_intent.create_empty_description'
                    )}
                    onClick={onCreateEmpty}
                />
                <WizardChoiceCard
                    icon={<FileInput className="size-7" />}
                    title={t('new_diagram_dialog.choose_intent.import')}
                    description={t(
                        'new_diagram_dialog.choose_intent.import_description'
                    )}
                    onClick={onImport}
                />
            </WizardChoiceGrid>
            <DialogFooter className="mt-4 flex !justify-start gap-2">
                <Button type="button" variant="secondary" onClick={onBack}>
                    {t('new_diagram_dialog.choose_intent.back')}
                </Button>
            </DialogFooter>
        </>
    );
};
