import React from 'react';
import { Check, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/table/table';
import { MAX_ARCHIVE_COMPRESSED_BYTES } from '@/lib/project-import/archive/archive-limits';
import { PROJECT_FRAMEWORK_LABEL_KEYS } from '@/lib/project-import/framework-labels';
import { ProjectFrameworkIcon } from '@/lib/project-import/project-framework-icon';
import { MAX_IMPORT_FILE_SIZE_BYTES } from './constants';
import { IMPORT_PRIVACY_INFO_FRAMEWORK_ROWS } from './import-privacy-info-framework-rows';

const bytesToMegabytes = (bytes: number): number =>
    Math.round(bytes / (1024 * 1024));

const PRIVACY_HIGHLIGHT_KEYS = [
    'new_diagram_dialog.import_schema.privacy_info.highlights.no_execution',
    'new_diagram_dialog.import_schema.privacy_info.highlights.no_full_upload',
    'new_diagram_dialog.import_schema.privacy_info.highlights.filtered_files',
] as const;

interface ImportPrivacyInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ImportPrivacyInfoLink: React.FC<{
    onClick: () => void;
}> = ({ onClick }) => {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
            <Info className="size-3.5 shrink-0" aria-hidden />
            <span className="underline-offset-2 hover:underline">
                {t('new_diagram_dialog.import_schema.privacy_info.link_label')}
            </span>
        </button>
    );
};

export const ImportPrivacyInfoDialog: React.FC<
    ImportPrivacyInfoDialogProps
> = ({ open, onOpenChange }) => {
    const { t } = useTranslation();
    const simpleFileSizeMb = bytesToMegabytes(MAX_IMPORT_FILE_SIZE_BYTES);
    const archiveSizeMb = bytesToMegabytes(MAX_ARCHIVE_COMPRESSED_BYTES);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                forceOverlay
                className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
                onInteractOutside={(event) => event.preventDefault()}
            >
                <div className="overflow-y-auto p-6 pb-4">
                    <DialogHeader>
                        <DialogTitle>
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.title'
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.intro'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <ul className="mt-4 space-y-2">
                        {PRIVACY_HIGHLIGHT_KEYS.map((key) => (
                            <li
                                key={key}
                                className="flex items-start gap-2 text-sm"
                            >
                                <Check
                                    className="mt-0.5 size-4 shrink-0 text-green-600"
                                    aria-hidden
                                />
                                <span>{t(key)}</span>
                            </li>
                        ))}
                    </ul>

                    <section className="mt-6">
                        <h3 className="text-sm font-medium">
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.simple_formats_title'
                            )}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.simple_formats_description',
                                { sizeMb: simpleFileSizeMb }
                            )}
                        </p>
                    </section>

                    <section className="mt-6">
                        <h3 className="text-sm font-medium">
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.project_archives_title'
                            )}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.project_archives_description',
                                { sizeMb: archiveSizeMb }
                            )}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.privacy_info.excluded_paths'
                            )}
                        </p>

                        <div className="mt-3 overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">
                                            {t(
                                                'new_diagram_dialog.import_schema.privacy_info.table.framework'
                                            )}
                                        </TableHead>
                                        <TableHead>
                                            {t(
                                                'new_diagram_dialog.import_schema.privacy_info.table.files'
                                            )}
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            {t(
                                                'new_diagram_dialog.import_schema.privacy_info.table.processing'
                                            )}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {IMPORT_PRIVACY_INFO_FRAMEWORK_ROWS.map(
                                        (row) => (
                                            <TableRow key={row.framework}>
                                                <TableCell className="whitespace-nowrap font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <ProjectFrameworkIcon
                                                            framework={
                                                                row.framework
                                                            }
                                                        />
                                                        {t(
                                                            PROJECT_FRAMEWORK_LABEL_KEYS[
                                                                row.framework
                                                            ]
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {t(row.filesKey)}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {t(
                                                        row.processing ===
                                                            'local'
                                                            ? 'new_diagram_dialog.import_schema.privacy_info.table.processing_local'
                                                            : 'new_diagram_dialog.import_schema.privacy_info.table.processing_remote'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </div>

                <DialogFooter className="border-t px-6 py-4 sm:justify-start">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        {t(
                            'new_diagram_dialog.import_schema.privacy_info.back'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
