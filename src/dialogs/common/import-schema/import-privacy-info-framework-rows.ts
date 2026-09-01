import type { ProjectFramework } from '@/lib/project-import/project-types';
import { getParserLocation } from '@/lib/project-import/parser-location';

export interface ImportPrivacyInfoFrameworkRow {
    framework: ProjectFramework;
    filesKey: string;
    processing: 'local' | 'remote';
}

export const IMPORT_PRIVACY_INFO_FRAMEWORK_ROWS: ImportPrivacyInfoFrameworkRow[] =
    (
        [
            'laravel',
            'prisma',
            'rails',
            'drizzle',
            'entity_framework_core',
            'django',
        ] as const
    ).map((framework) => ({
        framework,
        filesKey: `new_diagram_dialog.import_schema.privacy_info.frameworks.${framework}.files`,
        processing: getParserLocation(framework),
    }));
