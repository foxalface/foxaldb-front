import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { getExportTargetAvailability } from '../export-target-availability';
import {
    EXPORT_TARGET_REGISTRY,
    resolveVisibleExportTargetsBySection,
} from '../export-target-registry';

const guestContext = {
    isAuthenticated: false,
    diagramId: 'guest-diagram-1',
    databaseType: DatabaseType.POSTGRESQL,
};

const authenticatedBackendContext = {
    isAuthenticated: true,
    diagramId: '42',
    databaseType: DatabaseType.POSTGRESQL,
};

describe('export target availability', () => {
    it('marks SQL as available for guests', () => {
        expect(getExportTargetAvailability('sql', guestContext)).toEqual({
            status: 'available',
        });
    });

    it('marks DBML as available for guests', () => {
        expect(getExportTargetAvailability('dbml', guestContext)).toEqual({
            status: 'available',
        });
    });

    it('hides Laravel for guests', () => {
        expect(getExportTargetAvailability('laravel', guestContext)).toEqual({
            status: 'hidden',
        });
    });

    it('marks Laravel as available for authenticated backend diagrams', () => {
        expect(
            getExportTargetAvailability('laravel', authenticatedBackendContext)
        ).toEqual({
            status: 'available',
        });
    });

    it('marks Prisma as available for supported database types', () => {
        expect(getExportTargetAvailability('prisma', guestContext)).toEqual({
            status: 'available',
        });
    });

    it('disables Prisma for unsupported database types', () => {
        expect(
            getExportTargetAvailability('prisma', {
                ...guestContext,
                databaseType: DatabaseType.ORACLE,
            })
        ).toEqual({
            status: 'disabled',
            reasonKey: 'export_wizard.prisma.unsupported_database',
        });
    });

    it('marks other planned framework targets as disabled', () => {
        for (const targetId of [
            'ef_core',
            'rails',
            'django',
            'drizzle',
        ] as const) {
            expect(getExportTargetAvailability(targetId, guestContext)).toEqual(
                {
                    status: 'disabled',
                    reasonKey: 'export_wizard.targets.framework.coming_soon',
                }
            );
        }
    });
});

describe('export target registry', () => {
    it('includes all strategic export targets', () => {
        const ids = EXPORT_TARGET_REGISTRY.map((target) => target.id);

        expect(ids).toEqual([
            'sql',
            'laravel',
            'prisma',
            'ef_core',
            'rails',
            'django',
            'drizzle',
            'dbml',
            'diagram_json',
            'png',
            'jpg',
            'svg',
        ]);
    });

    it('renders four visible sections for guests', () => {
        const database = resolveVisibleExportTargetsBySection(
            'database',
            guestContext
        );
        const framework = resolveVisibleExportTargetsBySection(
            'framework',
            guestContext
        );
        const portable = resolveVisibleExportTargetsBySection(
            'portable',
            guestContext
        );
        const visual = resolveVisibleExportTargetsBySection(
            'visual',
            guestContext
        );

        expect(database.map((target) => target.id)).toEqual(['sql']);
        expect(framework.map((target) => target.id)).toEqual([
            'prisma',
            'ef_core',
            'rails',
            'django',
            'drizzle',
        ]);
        expect(portable.map((target) => target.id)).toEqual([
            'dbml',
            'diagram_json',
        ]);
        expect(visual.map((target) => target.id)).toEqual([
            'png',
            'jpg',
            'svg',
        ]);
    });

    it('shows Laravel in the framework section when available', () => {
        const framework = resolveVisibleExportTargetsBySection(
            'framework',
            authenticatedBackendContext
        );

        expect(framework.map((target) => target.id)).toEqual([
            'laravel',
            'prisma',
            'ef_core',
            'rails',
            'django',
            'drizzle',
        ]);
    });
});
