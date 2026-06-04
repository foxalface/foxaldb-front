import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Spinner } from '@/components/spinner/spinner';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { listDiagramMembers } from '@/lib/api/diagram-members';
import type { DiagramMemberResource } from '@/lib/api/diagram-members';
import { useTranslation } from 'react-i18next';
import { ShareMemberList } from './share-member-list';
import { ShareAddMemberForm } from './share-add-member-form';

export interface ShareDiagramDialogProps extends BaseDialogProps {
    diagramId: string;
}

export const ShareDiagramDialog: React.FC<ShareDiagramDialogProps> = ({
    dialog,
    diagramId,
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { closeShareDiagramDialog } = useDialog();
    const [members, setMembers] = useState<DiagramMemberResource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
            const data = await listDiagramMembers(diagramId);
            setMembers(data);
        } catch {
            setLoadError(t('share_diagram_dialog.errors.load_failed'));
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    }, [diagramId, t]);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        void fetchMembers();
    }, [dialog.open, fetchMembers]);

    const handleMemberAdded = useCallback((member: DiagramMemberResource) => {
        setMembers((current) => [...current, member]);
    }, []);

    if (!user) {
        return null;
    }

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeShareDiagramDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-[85vh] max-w-lg flex-col overflow-y-auto"
                showClose
            >
                <DialogHeader>
                    <DialogTitle>{t('share_diagram_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('share_diagram_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                {loadError ? (
                    <p className="text-sm text-destructive">{loadError}</p>
                ) : null}

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner size="medium" />
                    </div>
                ) : (
                    <>
                        <ShareMemberList
                            diagramId={diagramId}
                            owner={user}
                            members={members}
                            onMembersChange={setMembers}
                        />
                        <ShareAddMemberForm
                            diagramId={diagramId}
                            onMemberAdded={handleMemberAdded}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
