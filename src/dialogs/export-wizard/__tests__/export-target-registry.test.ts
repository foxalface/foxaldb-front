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

    it('hides Prisma for guests', () => {
        expect(getExportTargetAvailability('prisma', guestContext)).toEqual({
            status: 'hidden',
        });
    });

    it('marks Prisma as available for authenticated users on supported database types', () => {
        expect(
            getExportTargetAvailability('prisma', authenticatedBackendContext)
        ).toEqual({
            status: 'available',
        });
    });

    it('disables Prisma for unsupported database types when authenticated', () => {
        expect(
            getExportTargetAvailability('prisma', {
                ...authenticatedBackendContext,
                databaseType: DatabaseType.ORACLE,
            })
        ).toEqual({
            status: 'disabled',
            reasonKey: 'export_wizard.prisma.unsupported_database',
        });
    });

    it('hides Rails for guests', () => {
        expect(getExportTargetAvailability('rails', guestContext)).toEqual({
            status: 'hidden',
        });
    });

    it('marks Rails as available for authenticated users on supported databases', () => {
        expect(
            getExportTargetAvailability('rails', authenticatedBackendContext)
        ).toEqual({
            status: 'available',
        });
    });

    it('disables Rails for unsupported database types when authenticated', () => {
        expect(
            getExportTargetAvailability('rails', {
                ...authenticatedBackendContext,
                databaseType: DatabaseType.SQL_SERVER,
            })
        ).toEqual({
            status: 'disabled',
            reasonKey: 'export_wizard.rails.unsupported_database',
        });
    });

    it('does not require a paid plan for Rails availability', () => {
        expect(
            getExportTargetAvailability('rails', {
                isAuthenticated: true,
                diagramId: 'guest-diagram-1',
                databaseType: DatabaseType.POSTGRESQL,
            })
        ).toEqual({
            status: 'available',
        });
    });

    it('marks remaining planned framework targets as disabled', () => {
        for (const targetId of ['django', 'drizzle'] as const) {
            expect(getExportTargetAvailability(targetId, guestContext)).toEqual(
                {
                    status: 'disabled',
                    reasonKey: 'export_wizard.targets.framework.coming_soon',
                }
            );
        }
    });

    it('hides EF Core for guests', () => {
        expect(getExportTargetAvailability('ef_core', guestContext)).toEqual({
            status: 'hidden',
        });
    });

    it('marks EF Core as available for authenticated users on supported databases', () => {
        expect(
            getExportTargetAvailability('ef_core', authenticatedBackendContext)
        ).toEqual({
            status: 'available',
        });
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

describe('Rails export target availability', () => {
    const guestContextFor = (databaseType: DatabaseType) => ({
        isAuthenticated: false,
        diagramId: 'guest-diagram-1',
        databaseType,
    });

    const authenticatedContextFor = (
        databaseType: DatabaseType,
        diagramId: unknown = '42'
    ) => ({
        isAuthenticated: true,
        diagramId,
        databaseType,
    });

    const supportedTypes = [
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
    ] as const;

    const unsupportedTypes = [
        DatabaseType.SQL_SERVER,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ] as const;

    it('hides Rails for guests even on supported databases', () => {
        for (const databaseType of supportedTypes) {
            expect(
                getExportTargetAvailability(
                    'rails',
                    guestContextFor(databaseType)
                )
            ).toEqual({ status: 'hidden' });
        }
    });

    for (const databaseType of supportedTypes) {
        it(`marks Rails as available for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'rails',
                    authenticatedContextFor(databaseType)
                )
            ).toEqual({ status: 'available' });
        });
    }

    for (const databaseType of unsupportedTypes) {
        it(`disables Rails for authenticated users on ${databaseType}`, () => {
            expect(
                getExportTargetAvailability(
                    'rails',
                    authenticatedContextFor(databaseType)
                )
            ).toEqual({
                status: 'disabled',
                reasonKey: 'export_wizard.rails.unsupported_database',
            });
        });
    }

    it('does not show Rails as coming soon once enabled', () => {
        expect(
            getExportTargetAvailability(
                'rails',
                authenticatedContextFor(DatabaseType.POSTGRESQL)
            ).reasonKey
        ).not.toBe('export_wizard.targets.framework.coming_soon');
    });

    it('does not require a paid plan or backend diagram ID', () => {
        expect(
            getExportTargetAvailability(
                'rails',
                authenticatedContextFor(
                    DatabaseType.POSTGRESQL,
                    'guest-diagram-1'
                )
            )
        ).toEqual({ status: 'available' });
    });

    it('leaves Laravel, Prisma, and EF Core availability unchanged', () => {
        expect(
            getExportTargetAvailability('laravel', authenticatedBackendContext)
        ).toEqual({ status: 'available' });
        expect(
            getExportTargetAvailability('prisma', authenticatedBackendContext)
        ).toEqual({ status: 'available' });
        expect(
            getExportTargetAvailability('ef_core', authenticatedBackendContext)
        ).toEqual({ status: 'available' });
        expect(getExportTargetAvailability('laravel', guestContext)).toEqual({
            status: 'hidden',
        });
        expect(getExportTargetAvailability('prisma', guestContext)).toEqual({
            status: 'hidden',
        });
        expect(getExportTargetAvailability('ef_core', guestContext)).toEqual({
            status: 'hidden',
        });
    });
});
