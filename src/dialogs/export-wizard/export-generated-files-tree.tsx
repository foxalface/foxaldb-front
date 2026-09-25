import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExpandedState } from '@/components/tree-view/use-tree';
import { TreeView } from '@/components/tree-view/tree-view';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';
import {
    buildExportFilePathTree,
    normalizeExportFilePath,
    type ExportFileTreeNode,
} from './build-export-file-path-tree';
import type { ExportGeneratedFile } from './export-generated-file';
import { ExportGeneratedFilePreview } from './export-generated-file-preview';

interface ExportGeneratedFilesTreeProps {
    files: ExportGeneratedFile[];
    testId?: string;
    previewTestId?: string;
    className?: string;
}

const SELECTED_FILE_CLASS_NAME =
    'bg-sky-500 border border-sky-600 dark:bg-sky-600 dark:border-sky-700';

const buildExpandedState = (folderIds: string[]): ExpandedState =>
    Object.fromEntries(folderIds.map((folderId) => [folderId, true]));

const applySelectedFileStyles = (
    nodes: ExportFileTreeNode[],
    selectedPath?: string
): ExportFileTreeNode[] =>
    nodes.map((node) => ({
        ...node,
        className:
            !node.isFolder && node.id === selectedPath
                ? cn(SELECTED_FILE_CLASS_NAME, node.className)
                : node.className,
        children: node.children
            ? applySelectedFileStyles(node.children, selectedPath)
            : undefined,
    }));

export const ExportGeneratedFilesTree: React.FC<
    ExportGeneratedFilesTreeProps
> = ({ files, testId, previewTestId, className }) => {
    const paths = useMemo(() => files.map((file) => file.path), [files]);
    const filesByPath = useMemo(() => {
        const map = new Map<string, ExportGeneratedFile>();

        for (const file of files) {
            map.set(normalizeExportFilePath(file.path), file);
        }

        return map;
    }, [files]);
    const pathsKey = useMemo(() => paths.join('\0'), [paths]);
    const { treeData, folderIds } = useMemo(
        () => buildExportFilePathTree(paths),
        [paths]
    );
    const [expanded, setExpanded] = useState<ExpandedState>(() =>
        buildExpandedState(folderIds)
    );
    const [selectedPath, setSelectedPath] = useState<string | undefined>();

    useEffect(() => {
        setExpanded(buildExpandedState(folderIds));
    }, [folderIds]);

    useEffect(() => {
        setSelectedPath(undefined);
    }, [pathsKey]);

    const treeDataWithSelection = useMemo(
        () => applySelectedFileStyles(treeData, selectedPath),
        [selectedPath, treeData]
    );

    const handleNodeClick = useCallback((node: ExportFileTreeNode) => {
        if (node.type === 'folder') {
            setExpanded((current) => ({
                ...current,
                [node.id]: !current[node.id],
            }));
            return;
        }

        setSelectedPath((current) =>
            current === node.id ? undefined : node.id
        );
    }, []);

    const selectedFile = selectedPath
        ? filesByPath.get(selectedPath)
        : undefined;

    if (treeData.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 flex flex-col gap-2">
            <TooltipProvider>
                <div
                    className={cn(
                        'scrollbar-app max-h-48 overflow-y-auto rounded-md border bg-muted/20 px-1',
                        className
                    )}
                    data-testid={testId}
                >
                    <TreeView
                        data={treeDataWithSelection}
                        expanded={expanded}
                        setExpanded={setExpanded}
                        disableCache={true}
                        className="py-1 text-sm text-muted-foreground"
                        onNodeClick={handleNodeClick}
                    />
                </div>
            </TooltipProvider>

            {selectedFile ? (
                <TooltipProvider>
                    <ExportGeneratedFilePreview
                        file={selectedFile}
                        testId={previewTestId}
                        onClose={() => setSelectedPath(undefined)}
                    />
                </TooltipProvider>
            ) : null}
        </div>
    );
};
