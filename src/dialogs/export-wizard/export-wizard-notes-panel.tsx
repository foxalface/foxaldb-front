import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ExportWizardNotesPanelProps {
    heading: string;
    testId: string;
    listTestId: string;
    children: React.ReactNode;
}

export const ExportWizardNotesPanel: React.FC<ExportWizardNotesPanelProps> = ({
    heading,
    testId,
    listTestId,
    children,
}) => (
    <div
        role="status"
        className="scrollbar-app flex max-h-36 shrink-0 items-start gap-3 overflow-y-auto rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 text-sm dark:border-amber-500/70 dark:bg-amber-500/15"
        data-testid={testId}
    >
        <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
            aria-hidden
        />
        <div className="min-w-0 flex-1">
            <p className="font-medium">{heading}</p>
            <ul
                className="mt-1 list-disc space-y-1 pl-4"
                data-testid={listTestId}
            >
                {children}
            </ul>
        </div>
    </div>
);
