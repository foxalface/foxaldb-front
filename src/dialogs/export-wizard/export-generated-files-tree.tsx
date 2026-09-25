import React, { useEffect, useMemo, useState } from 'react';
import type { ExpandedState } from '@/components/tree-view/use-tree';
import { TreeView } from '@/components/tree-view/tree-view';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';
import { buildExportFilePathTree } from './build-export-file-path-tree';

interface ExportGeneratedFilesTreeProps {
    paths: string[];
    testId?: string;
    className?: string;
}

const buildExpandedState = (folderIds: string[]): ExpandedState =>
    Object.fromEntries(folderIds.map((folderId) => [folderId, true]));

export const ExportGeneratedFilesTree: React.FC<
    ExportGeneratedFilesTreeProps
> = ({ paths, testId, className }) => {
    const { treeData, folderIds } = useMemo(
        () => buildExportFilePathTree(paths),
        [paths]
    );
    const [expanded, setExpanded] = useState<ExpandedState>(() =>
        buildExpandedState(folderIds)
    );

    useEffect(() => {
        setExpanded(buildExpandedState(folderIds));
    }, [folderIds]);

    if (treeData.length === 0) {
        return null;
    }

    return (
        <TooltipProvider>
            <div
                className={cn(
                    'mt-2 max-h-48 overflow-y-auto rounded-md border bg-muted/20 px-1',
                    className
                )}
                data-testid={testId}
            >
                <TreeView
                    data={treeData}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    disableCache={true}
                    className="py-1 text-sm text-muted-foreground"
                />
            </div>
        </TooltipProvider>
    );
};
