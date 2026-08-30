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
    it.each(ALL_FRAMEWORKS)(
        'keeps %s execution unavailable in M4',
        (framework) => {
            expect(isProjectImportParserAvailable(framework)).toBe(false);
            expect(canExecuteProjectImport(framework, true)).toBe(false);
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
            executionAvailable: false,
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
        const remoteFrameworks: ProjectFramework[] = [
            'laravel',
            'entity_framework_core',
            'django',
        ];

        for (const framework of remoteFrameworks) {
            expect(canExecuteProjectImport(framework, false)).toBe(false);
        }
    });
});
