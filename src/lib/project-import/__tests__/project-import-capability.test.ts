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
        ['entity_framework_core', true, 'remote'],
        ['drizzle', true, 'local'],
        ['rails', true, 'local'],
        ['django', true, 'remote'],
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
        expect(canExecuteProjectImport('entity_framework_core', false)).toBe(
            false
        );
        expect(canExecuteProjectImport('entity_framework_core', true)).toBe(
            true
        );
        expect(canExecuteProjectImport('django', false)).toBe(false);
        expect(canExecuteProjectImport('django', true)).toBe(true);
        expect(canExecuteProjectImport('prisma', false)).toBe(true);
        expect(canExecuteProjectImport('prisma', true)).toBe(true);
        expect(canExecuteProjectImport('rails', false)).toBe(true);
        expect(canExecuteProjectImport('rails', true)).toBe(true);
        expect(canExecuteProjectImport('drizzle', false)).toBe(true);
        expect(canExecuteProjectImport('drizzle', true)).toBe(true);
    });

    it('keeps all six frameworks executable', () => {
        ALL_FRAMEWORKS.forEach((framework) => {
            const requiresAuth = [
                'laravel',
                'entity_framework_core',
                'django',
            ].includes(framework);

            expect(canExecuteProjectImport(framework, true)).toBe(true);
            expect(canExecuteProjectImport(framework, false)).toBe(
                !requiresAuth
            );
        });
    });
});
