import { describe, expect, it } from 'vitest';
import { buildExportFilePathTree } from '../build-export-file-path-tree';

describe('buildExportFilePathTree', () => {
    it('builds a nested folder structure from flat file paths', () => {
        const { treeData, folderIds } = buildExportFilePathTree([
            'README.md',
            'app/models/user.rb',
            'db/migrate/20240101120001_create_users.rb',
            'db/schema.rb',
        ]);

        expect(treeData.map((node) => node.name)).toEqual([
            'app',
            'db',
            'README.md',
        ]);
        expect(folderIds).toEqual(['app', 'app/models', 'db', 'db/migrate']);

        const appNode = treeData.find((node) => node.name === 'app');
        expect(appNode?.children?.map((node) => node.name)).toEqual(['models']);
        expect(appNode?.children?.[0]?.children?.[0]).toMatchObject({
            name: 'user.rb',
            type: 'file',
            context: { path: 'app/models/user.rb' },
        });

        const dbNode = treeData.find((node) => node.name === 'db');
        expect(dbNode?.children?.map((node) => node.name)).toEqual([
            'migrate',
            'schema.rb',
        ]);
    });

    it('normalizes leading slashes and backslashes', () => {
        const { treeData } = buildExportFilePathTree([
            './README.md',
            'app\\models\\user.rb',
        ]);

        expect(treeData.map((node) => node.name)).toEqual(['app', 'README.md']);
        expect(treeData[0]?.children?.[0]?.children?.[0]?.context).toEqual({
            path: 'app/models/user.rb',
        });
    });

    it('ignores empty paths', () => {
        const { treeData, folderIds } = buildExportFilePathTree([
            '',
            '   ',
            'README.md',
        ]);

        expect(treeData).toHaveLength(1);
        expect(treeData[0]?.name).toBe('README.md');
        expect(folderIds).toEqual([]);
    });
});
