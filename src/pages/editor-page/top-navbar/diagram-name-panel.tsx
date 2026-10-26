import React from 'react';
import { DiagramName } from '@/pages/editor-page/top-navbar/diagram-name';
import { LocalDiagramStorageIndicator } from '@/pages/editor-page/top-navbar/local-diagram-storage-indicator';

export const DiagramNamePanel: React.FC = () => {
    return (
        <div className="flex w-full justify-center">
            <div className="pointer-events-auto relative w-fit max-w-full">
                <DiagramName />
                <div className="pointer-events-none absolute left-full top-1/2 ml-1.5 -translate-y-1/2">
                    <div className="pointer-events-auto">
                        <LocalDiagramStorageIndicator />
                    </div>
                </div>
            </div>
        </div>
    );
};
