import React, { useId, useState } from 'react';
import { Cloud, Laptop } from 'lucide-react';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import type { DiagramCreationDestination } from '@/lib/diagram/diagram-creation-destination';
import { useTranslation } from 'react-i18next';
import { WizardChoiceCard, WizardChoiceGrid } from '../wizard-choice-card';

export interface ChooseCreationDestinationStepProps {
    initialChoice: DiagramCreationDestination;
    onConfirm: (params: {
        destination: DiagramCreationDestination;
        rememberChoice: boolean;
    }) => void | Promise<void>;
    onBack: () => void;
    isSubmitting?: boolean;
}

export const ChooseCreationDestinationStep: React.FC<
    ChooseCreationDestinationStepProps
> = ({ initialChoice, onConfirm, onBack, isSubmitting = false }) => {
    const { t } = useTranslation();
    const rememberId = useId();
    const [choice, setChoice] =
        useState<DiagramCreationDestination>(initialChoice);
    const [rememberChoice, setRememberChoice] = useState(false);

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {t('new_diagram_dialog.choose_creation_destination.title')}
                </DialogTitle>
                <DialogDescription>
                    {t(
                        'new_diagram_dialog.choose_creation_destination.description'
                    )}
                </DialogDescription>
            </DialogHeader>

            <WizardChoiceGrid>
                <WizardChoiceCard
                    icon={<Laptop className="size-7" />}
                    title={t('open_diagram_dialog.tabs.device')}
                    description={t(
                        'new_diagram_dialog.choose_creation_destination.device_description'
                    )}
                    selected={choice === 'device'}
                    onClick={() => setChoice('device')}
                />
                <WizardChoiceCard
                    icon={<Cloud className="size-7" />}
                    title={t('open_diagram_dialog.tabs.online')}
                    description={t(
                        'new_diagram_dialog.choose_creation_destination.online_description'
                    )}
                    selected={choice === 'online'}
                    onClick={() => setChoice('online')}
                />
            </WizardChoiceGrid>

            <div className="flex items-start gap-2 rounded-md border border-border px-3 py-2">
                <Checkbox
                    id={rememberId}
                    checked={rememberChoice}
                    onCheckedChange={(checked) =>
                        setRememberChoice(checked === true)
                    }
                    disabled={isSubmitting}
                />
                <label
                    htmlFor={rememberId}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {t(
                        'new_diagram_dialog.choose_creation_destination.remember_choice'
                    )}
                </label>
            </div>

            <DialogFooter className="mt-4 flex !justify-between gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onBack}
                    disabled={isSubmitting}
                >
                    {t('new_diagram_dialog.choose_creation_destination.back')}
                </Button>
                <Button
                    type="button"
                    onClick={() => {
                        void onConfirm({ destination: choice, rememberChoice });
                    }}
                    disabled={isSubmitting}
                >
                    {t('new_diagram_dialog.choose_creation_destination.create')}
                </Button>
            </DialogFooter>
        </>
    );
};
