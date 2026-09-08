export type ExportTargetId =
    | 'sql'
    | 'laravel'
    | 'prisma'
    | 'ef_core'
    | 'rails'
    | 'django'
    | 'drizzle'
    | 'dbml'
    | 'diagram_json'
    | 'png'
    | 'jpg'
    | 'svg';

export type ExportTargetSection =
    | 'database'
    | 'framework'
    | 'portable'
    | 'visual';
