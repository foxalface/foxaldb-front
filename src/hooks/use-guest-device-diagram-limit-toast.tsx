import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastAction } from '@/components/toast/toast';
import { useToast } from '@/components/toast/use-toast';
import { useDialog } from '@/hooks/use-dialog';

export const useGuestDeviceDiagramLimitToast = (): {
    notifyGuestDeviceDiagramLimitReached: () => void;
} => {
    const { toast } = useToast();
    const { t } = useTranslation();
    const { closeCreateDiagramDialog, openAuthDialog } = useDialog();

    const notifyGuestDeviceDiagramLimitReached = useCallback(() => {
        toast({
            title: t('new_diagram_dialog.guest_limit.title'),
            description: t('new_diagram_dialog.guest_limit.description'),
            layout: 'column',
            action: (
                <ToastAction
                    altText={t('new_diagram_dialog.guest_limit.sign_in')}
                    onClick={() => {
                        closeCreateDiagramDialog();
                        openAuthDialog();
                    }}
                >
                    {t('new_diagram_dialog.guest_limit.sign_in')}
                </ToastAction>
            ),
        });
    }, [closeCreateDiagramDialog, openAuthDialog, t, toast]);

    return { notifyGuestDeviceDiagramLimitReached };
};
