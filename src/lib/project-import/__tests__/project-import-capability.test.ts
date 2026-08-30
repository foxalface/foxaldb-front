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

const EXECUTION_AVAILABLE_FRAMEWORKS: ProjectFramework[] = ['laravel'];

describe('project import capabilities', () => {
    it.each(ALL_FRAMEWORKS)(
        'reports execution availability for %s in M5',
        (framework) => {
            const executionAvailable =
                EXECUTION_AVAILABLE_FRAMEWORKS.includes(framework);

            expect(isProjectImportParserAvailable(framework)).toBe(
                executionAvailable
            );
            expect(canExecuteProjectImport(framework, true)).toBe(
                executionAvailable
            );
            expect(canExecuteProjectImport(framework, false)).toBe(false);
        }
    );

    it('preserves parser locations for all frameworks', () => {
        expect(getProjectParserCapability('prisma')).toMatchObject({
            location: 'local',
            executionAvailable: false,
        });
        expect(getProjectParserCapability('drizzle')).toMatchObject({
            location: 'local',
            executionAvailable: false,
        });
        expect(getProjectParserCapability('rails')).toMatchObject({
            location: 'local',
            executionAvailable: false,
        });
        expect(getProjectParserCapability('laravel')).toMatchObject({
            location: 'remote',
            executionAvailable: true,
        });
        expect(
            getProjectParserCapability('entity_framework_core')
        ).toMatchObject({
            location: 'remote',
            executionAvailable: false,
        });
        expect(getProjectParserCapability('django')).toMatchObject({
            location: 'remote',
            executionAvailable: false,
        });
    });

    it('requires authentication for remote frameworks once execution is enabled', () => {
        expect(canExecuteProjectImport('laravel', false)).toBe(false);
        expect(canExecuteProjectImport('laravel', true)).toBe(true);
    });
});
