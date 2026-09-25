import React from 'react';
import { Wrench } from 'lucide-react';

interface ExportWizardAdaptationsPanelProps {
    heading: string;
    testId: string;
    listTestId: string;
    children: React.ReactNode;
}

export const ExportWizardAdaptationsPanel: React.FC<
    ExportWizardAdaptationsPanelProps
> = ({ heading, testId, listTestId, children }) => (
    <div
        role="note"
        className="flex max-h-36 shrink-0 items-start gap-3 overflow-y-auto rounded-lg border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-sm dark:border-sky-400/40 dark:bg-sky-500/10"
        data-testid={testId}
    >
        <Wrench
            className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400"
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
