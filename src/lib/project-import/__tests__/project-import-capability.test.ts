import { describe, expect, it } from 'vitest';
import {
    canExecuteProjectImport,
    getProjectParserCapability,
    isProjectImportParserAvailable,
} from '../project-import-capability';
import type { ProjectFramework } from '../project-types';

const ALL_FRAMEWORKS: ProjectFramework[] = [
    'laravel',
    'prisma',
    'drizzle',
    'rails',
    'entity_framework_core',
    'django',
];

describe('project import capabilities', () => {
    it.each([
        ['laravel', true, 'remote'],
        ['prisma', true, 'local'],
        ['drizzle', false, 'local'],
        ['rails', false, 'local'],
        ['entity_framework_core', false, 'remote'],
        ['django', false, 'remote'],
    ] as const)(
        'reports execution availability and location for %s',
        (framework, executionAvailable, location) => {
            expect(isProjectImportParserAvailable(framework)).toBe(
                executionAvailable
            );
            expect(getProjectParserCapability(framework)).toMatchObject({
                location,
                executionAvailable,
            });
        }
    );

    it('requires authentication only for remote executable frameworks', () => {
        expect(canExecuteProjectImport('laravel', false)).toBe(false);
        expect(canExecuteProjectImport('laravel', true)).toBe(true);
        expect(canExecuteProjectImport('prisma', false)).toBe(true);
        expect(canExecuteProjectImport('prisma', true)).toBe(true);
    });

    it('keeps non-executable frameworks disabled for all users', () => {
        ALL_FRAMEWORKS.filter(
            (framework) => !['laravel', 'prisma'].includes(framework)
        ).forEach((framework) => {
            expect(canExecuteProjectImport(framework, true)).toBe(false);
            expect(canExecuteProjectImport(framework, false)).toBe(false);
        });
    });
});
