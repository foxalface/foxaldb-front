import type { DatabaseType } from '@/lib/domain/database-type';
import { isEfCoreExportSupported } from '@/lib/export/ef-core-export-capability';
import { isPrismaExportSupported } from '@/lib/export/prisma-export-capability';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { ExportTargetId } from './export-target-id';

export type ExportAvailabilityStatus = 'available' | 'disabled' | 'hidden';

export interface ExportAvailabilityContext {
    isAuthenticated: boolean;
    diagramId: unknown;
    databaseType: DatabaseType;
}

export interface ExportTargetAvailability {
    status: ExportAvailabilityStatus;
    reasonKey?: string;
}

const isLaravelExportAvailable = (ctx: ExportAvailabilityContext): boolean =>
    Boolean(
        ctx.isAuthenticated &&
        ctx.diagramId &&
        isValidBackendDiagramId(ctx.diagramId)
    );

export const getExportTargetAvailability = (
    targetId: ExportTargetId,
    ctx: ExportAvailabilityContext
): ExportTargetAvailability => {
    switch (targetId) {
        case 'sql':
        case 'dbml':
        case 'diagram_json':
        case 'png':
        case 'jpg':
        case 'svg':
            return { status: 'available' };

        case 'laravel':
            return isLaravelExportAvailable(ctx)
                ? { status: 'available' }
                : { status: 'hidden' };

        case 'prisma':
            if (!ctx.isAuthenticated) {
                return { status: 'hidden' };
            }

            return isPrismaExportSupported(ctx.databaseType)
                ? { status: 'available' }
                : {
                      status: 'disabled',
                      reasonKey: 'export_wizard.prisma.unsupported_database',
                  };

        case 'ef_core':
            if (!ctx.isAuthenticated) {
                return { status: 'hidden' };
            }

            return isEfCoreExportSupported(ctx.databaseType)
                ? { status: 'available' }
                : {
                      status: 'disabled',
                      reasonKey: 'export_wizard.ef_core.unsupported_database',
                  };

        case 'rails':
        case 'django':
        case 'drizzle':
            return {
                status: 'disabled',
                reasonKey: 'export_wizard.targets.framework.coming_soon',
            };

        default:
            return { status: 'hidden' };
    }
};
