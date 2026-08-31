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

/** Hardcoded M10 capability matrix — not derived from implementation under test. */
const EXPECTED_CAPABILITY_MATRIX: Record<
    ProjectFramework,
    { location: 'local' | 'remote'; executionAvailable: boolean }
> = {
    laravel: { location: 'remote', executionAvailable: true },
    prisma: { location: 'local', executionAvailable: true },
    entity_framework_core: { location: 'remote', executionAvailable: true },
    rails: { location: 'local', executionAvailable: true },
    django: { location: 'remote', executionAvailable: true },
    drizzle: { location: 'local', executionAvailable: true },
};

describe('project import capabilities', () => {
    it('matches the hardcoded six-framework capability matrix', () => {
        ALL_FRAMEWORKS.forEach((framework) => {
            const expected = EXPECTED_CAPABILITY_MATRIX[framework];
            const capability = getProjectParserCapability(framework);

            expect(capability).toEqual({
                framework,
                location: expected.location,
                executionAvailable: expected.executionAvailable,
            });
        });
    });
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
