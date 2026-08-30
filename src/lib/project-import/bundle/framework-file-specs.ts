import type { ProjectFramework } from '../project-types';

export interface FrameworkFileSpec {
    include: (relativePath: string) => boolean;
    optional?: boolean;
}

const EXCLUDED_PATH_SEGMENTS = [
    '/.env',
    '/vendor/',
    '/node_modules/',
    '/tests/',
    '/test/',
    '/__tests__/',
];

export const isExcludedBundlePath = (relativePath: string): boolean => {
    const normalized = relativePath.replace(/^\/+/, '');

    if (normalized === '.env' || normalized.endsWith('/.env')) {
        return true;
    }

    if (normalized.startsWith('vendor/') || normalized.includes('/vendor/')) {
        return true;
    }

    if (
        normalized.startsWith('node_modules/') ||
        normalized.includes('/node_modules/')
    ) {
        return true;
    }

    if (normalized.startsWith('tests/') || normalized.includes('/tests/')) {
        return true;
    }

    if (normalized.startsWith('test/') || normalized.includes('/test/')) {
        return true;
    }

    for (const segment of EXCLUDED_PATH_SEGMENTS) {
        if (relativePath.includes(segment)) {
            return true;
        }
    }

    return false;
};

const laravelSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath.startsWith('database/migrations/') &&
        relativePath.endsWith('.php'),
};

const laravelOptionalSpec: FrameworkFileSpec = {
    include: (relativePath) => relativePath === 'composer.json',
    optional: true,
};

const prismaSchemaSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath.startsWith('prisma/') && relativePath.endsWith('.prisma'),
};

const prismaMigrationSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath.includes('prisma/migrations/') &&
        relativePath.endsWith('/migration.sql'),
};

const prismaOptionalSpec: FrameworkFileSpec = {
    include: (relativePath) => relativePath === 'package.json',
    optional: true,
};

const drizzleSqlSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath.startsWith('drizzle/') && relativePath.endsWith('.sql'),
};

const drizzleJournalSpec: FrameworkFileSpec = {
    include: (relativePath) => relativePath === 'drizzle/meta/_journal.json',
};

const drizzleConfigSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        /^drizzle\.config\.(ts|js|mjs|cjs)$/.test(relativePath),
};

const railsSchemaSpec: FrameworkFileSpec = {
    include: (relativePath) => relativePath === 'db/schema.rb',
};

const railsOptionalSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath === 'config/database.yml' ||
        relativePath === 'db/structure.sql',
    optional: true,
};

const efSnapshotSpec: FrameworkFileSpec = {
    include: (relativePath) => relativePath.endsWith('ModelSnapshot.cs'),
};

const efMigrationSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        (relativePath.includes('Migrations/') ||
            relativePath.startsWith('Migrations/')) &&
        relativePath.endsWith('Migration.cs'),
};

const efCsprojSpec: FrameworkFileSpec = {
    include: (relativePath) => relativePath.endsWith('.csproj'),
};

const djangoMigrationSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath.includes('/migrations/') &&
        relativePath.endsWith('.py') &&
        !relativePath.endsWith('/__init__.py'),
};

const djangoOptionalSpec: FrameworkFileSpec = {
    include: (relativePath) =>
        relativePath === 'pyproject.toml' ||
        relativePath === 'requirements.txt' ||
        relativePath.endsWith('settings.py'),
    optional: true,
};

export const FRAMEWORK_FILE_SPECS: Record<
    ProjectFramework,
    FrameworkFileSpec[]
> = {
    laravel: [laravelSpec, laravelOptionalSpec],
    prisma: [prismaSchemaSpec, prismaMigrationSpec, prismaOptionalSpec],
    drizzle: [drizzleSqlSpec, drizzleJournalSpec, drizzleConfigSpec],
    rails: [railsSchemaSpec, railsOptionalSpec],
    entity_framework_core: [efSnapshotSpec, efMigrationSpec, efCsprojSpec],
    django: [djangoMigrationSpec, djangoOptionalSpec],
};

export const isAllowedFrameworkRelativePath = (
    framework: ProjectFramework,
    relativePath: string
): boolean => {
    if (isExcludedBundlePath(relativePath)) {
        return false;
    }

    return FRAMEWORK_FILE_SPECS[framework].some((spec) =>
        spec.include(relativePath)
    );
};
