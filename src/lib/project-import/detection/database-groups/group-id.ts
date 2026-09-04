import type { ProjectFramework } from '../../project-types';
import { normalizeRootPath } from '../archive-paths';

export const buildDatabaseGroupId = (
    framework: ProjectFramework,
    rootPath: string,
    groupKey: string
): string => {
    const normalizedRoot = normalizeRootPath(rootPath);
    const normalizedKey = groupKey.trim().toLowerCase().replace(/\s+/g, '-');

    return `${framework}:${normalizedRoot}:${normalizedKey}`;
};

export const getDatabaseGroupKey = (group: { id: string }): string => group.id;
