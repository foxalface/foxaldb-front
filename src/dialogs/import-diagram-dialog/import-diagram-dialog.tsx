import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useTranslation } from 'react-i18next';
import { FileUploader } from '@/components/file-uploader/file-uploader';
import { useStorage } from '@/hooks/use-storage';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/alert/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { useCreateDiagramRestoreDestination } from '@/dialogs/create-diagram-dialog/create-diagram-session-destination-context';
import { openPersistedNewDiagram } from '@/lib/diagram/persist-new-diagram';
import {
    RestoreDiagramJsonParseError,
    persistRestoredDiagramFromJson,
} from '@/lib/diagram-restore/restore-diagram-from-json-backup';
import { GuestDeviceDiagramLimitError } from '@/lib/diagram/guest-device-diagram-limit';
import { useGuestDeviceDiagramLimitToast } from '@/hooks/use-guest-device-diagram-limit-toast';

export interface ImportDiagramDialogProps extends BaseDialogProps {}

export const ImportDiagramDialog: React.FC<ImportDiagramDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const { addDiagram, listDiagrams } = useStorage();
    const { loadDiagramFromData } = useChartDB();
    const { setDiagramLocation } = useDiagramLocation();
    const { clearDiagramAccess } = useDiagramAccess();
    const { isAuthenticated } = useAuth();
    const { updateConfig } = useConfig();
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const destination = useCreateDiagramRestoreDestination(
        dialog.open === true
    );
    const restoreSessionActiveRef = useRef(dialog.open === true);

    const onFileChange = useCallback((files: File[]) => {
        if (files.length === 0) {
            setFile(null);
            return;
        }

        setFile(files[0]);
    }, []);

    useEffect(() => {
        restoreSessionActiveRef.current = dialog.open === true;

        if (!dialog.open) return;
        setError(false);
        setFile(null);
        setIsRestoring(false);
    }, [dialog.open]);

    const { closeImportDiagramDialog, closeCreateDiagramDialog } = useDialog();
    const { notifyGuestDeviceDiagramLimitReached } =
        useGuestDeviceDiagramLimitToast();

    const handleRestore = useCallback(() => {
        if (!file || isRestoring) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            if (!restoreSessionActiveRef.current) {
                return;
            }

            const json = e.target?.result;
            if (typeof json !== 'string') return;

            setIsRestoring(true);
            setError(false);

            try {
                const persisted = await persistRestoredDiagramFromJson(json, {
                    destination,
                    isAuthenticated,
                    addDiagram,
                    listDiagrams,
                });

                if (!restoreSessionActiveRef.current) {
                    return;
                }

                closeImportDiagramDialog();
                closeCreateDiagramDialog();

                await openPersistedNewDiagram(persisted, {
                    setDiagramLocation,
                    clearDiagramAccess,
                    loadDiagramFromData,
                    navigate: (path) => {
                        navigate(path);
                    },
                    updateDefaultDiagramId: isAuthenticated
                        ? async (diagramId) => {
                              await updateConfig({
                                  config: { defaultDiagramId: diagramId },
                              });
                          }
                        : undefined,
                    navigateAfterDeviceOpen: true,
                });
            } catch (caught: unknown) {
                if (caught instanceof RestoreDiagramJsonParseError) {
                    setError(true);
                    return;
                }

                if (caught instanceof GuestDeviceDiagramLimitError) {
                    notifyGuestDeviceDiagramLimitReached();
                    return;
                }

                setError(true);
            } finally {
                setIsRestoring(false);
            }
        };
        reader.onerror = () => {
            setError(true);
            setIsRestoring(false);
        };
        reader.readAsText(file);
    }, [
        file,
        isRestoring,
        isAuthenticated,
        destination,
        addDiagram,
        listDiagrams,
        notifyGuestDeviceDiagramLimitReached,
        setDiagramLocation,
        clearDiagramAccess,
        loadDiagramFromData,
        navigate,
        closeImportDiagramDialog,
        closeCreateDiagramDialog,
        updateConfig,
    ]);

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeImportDiagramDialog();
                }
            }}
        >
            <DialogContent className="flex max-h-screen flex-col" showClose>
                <DialogHeader>
                    <DialogTitle>
                        {t('import_diagram_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('import_diagram_dialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogInternalContent>
                    <div className="flex flex-col p-1">
                        <FileUploader
                            supportedExtensions={['.json']}
                            onFilesChange={onFileChange}
                        />
                        {error ? (
                            <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="size-4" />
                                <AlertTitle>
                                    {t('import_diagram_dialog.error.title')}
                                </AlertTitle>
                                <AlertDescription>
                                    {t(
                                        'import_diagram_dialog.error.description'
                                    )}
                                </AlertDescription>
                            </Alert>
                        ) : null}
                    </div>
                </DialogInternalContent>
                <DialogFooter className="flex gap-1 md:justify-between">
                    <DialogClose asChild>
                        <Button variant="secondary" disabled={isRestoring}>
                            {t('import_diagram_dialog.cancel')}
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleRestore}
                        disabled={file === null || isRestoring}
                    >
                        {t('import_diagram_dialog.import')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
