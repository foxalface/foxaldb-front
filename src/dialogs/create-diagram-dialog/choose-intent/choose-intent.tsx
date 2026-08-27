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
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface ChooseIntentProps {
    databaseType: DatabaseType;
    onBack: () => void;
    onCreateEmpty: () => void;
    onImportSchema: () => void;
}

interface IntentOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const IntentOption: React.FC<IntentOptionProps> = ({
    icon,
    title,
    description,
    onClick,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            'flex w-full items-start gap-4 rounded-xl border bg-card p-6 text-left shadow',
            'transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
    >
        <span className="mt-0.5 text-muted-foreground" aria-hidden>
            {icon}
        </span>
        <span className="flex flex-col gap-1">
            <span className="font-semibold leading-none tracking-tight">
                {title}
            </span>
            <span className="text-sm text-muted-foreground">{description}</span>
        </span>
    </button>
);

export const ChooseIntent: React.FC<ChooseIntentProps> = ({
    databaseType,
    onBack,
    onCreateEmpty,
    onImportSchema,
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
            <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-3">
                <IntentOption
                    icon={<CirclePlus className="size-6" />}
                    title={t('new_diagram_dialog.choose_intent.create_empty')}
                    description={t(
                        'new_diagram_dialog.choose_intent.create_empty_description'
                    )}
                    onClick={onCreateEmpty}
                />
                <IntentOption
                    icon={<FileInput className="size-6" />}
                    title={t('new_diagram_dialog.choose_intent.import_schema')}
                    description={t(
                        'new_diagram_dialog.choose_intent.import_schema_description'
                    )}
                    onClick={onImportSchema}
                />
            </div>
            <DialogFooter className="mt-4 flex !justify-start gap-2">
                <Button type="button" variant="secondary" onClick={onBack}>
                    {t('new_diagram_dialog.choose_intent.back')}
                </Button>
            </DialogFooter>
        </>
    );
};
