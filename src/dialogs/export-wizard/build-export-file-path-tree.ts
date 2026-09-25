import type { TreeNode } from '@/components/tree-view/tree';

export type ExportFileTreeNodeType = 'folder' | 'file';

export interface ExportFileTreeContext {
    folder: {
        path: string;
    };
    file: {
        path: string;
    };
}

export type ExportFileTreeNode = TreeNode<
    ExportFileTreeNodeType,
    ExportFileTreeContext
>;

interface MutableTreeNode {
    name: string;
    path: string;
    isFolder: boolean;
    children: Map<string, MutableTreeNode>;
}

export const normalizeExportFilePath = (filePath: string): string =>
    filePath
        .trim()
        .replace(/^\.?\//, '')
        .replace(/\\/g, '/');

const compareTreeNodes = (left: MutableTreeNode, right: MutableTreeNode) => {
    if (left.isFolder !== right.isFolder) {
        return left.isFolder ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
};

const toTreeNodes = (
    nodes: Map<string, MutableTreeNode>
): ExportFileTreeNode[] =>
    Array.from(nodes.values())
        .sort(compareTreeNodes)
        .map((node) => {
            if (node.isFolder) {
                return {
                    id: node.path,
                    name: node.name,
                    isFolder: true,
                    type: 'folder',
                    context: { path: node.path },
                    children: toTreeNodes(node.children),
                };
            }

            return {
                id: node.path,
                name: node.name,
                isFolder: false,
                type: 'file',
                context: { path: node.path },
                tooltip: node.path,
            };
        });

const collectFolderIds = (
    nodes: ExportFileTreeNode[],
    folderIds: string[] = []
): string[] => {
    for (const node of nodes) {
        if (node.isFolder) {
            folderIds.push(node.id);
            if (node.children) {
                collectFolderIds(node.children, folderIds);
            }
        }
    }

    return folderIds;
};

export const buildExportFilePathTree = (
    filePaths: string[]
): { treeData: ExportFileTreeNode[]; folderIds: string[] } => {
    const root = new Map<string, MutableTreeNode>();

    for (const rawPath of filePaths) {
        const normalizedPath = normalizeExportFilePath(rawPath);
        if (normalizedPath.length === 0) {
            continue;
        }

        const segments = normalizedPath.split('/').filter(Boolean);
        let currentLevel = root;
        let accumulatedPath = '';

        for (let index = 0; index < segments.length; index += 1) {
            const segment = segments[index];
            const isLast = index === segments.length - 1;
            accumulatedPath = accumulatedPath
                ? `${accumulatedPath}/${segment}`
                : segment;

            const existingNode = currentLevel.get(segment);
            if (!existingNode) {
                currentLevel.set(segment, {
                    name: segment,
                    path: accumulatedPath,
                    isFolder: !isLast,
                    children: new Map(),
                });
            } else if (!isLast) {
                existingNode.isFolder = true;
            }

            const node = currentLevel.get(segment);
            if (!node) {
                continue;
            }

            currentLevel = node.children;
        }
    }

    const treeData = toTreeNodes(root);
    const folderIds = collectFolderIds(treeData);

    return { treeData, folderIds };
};
