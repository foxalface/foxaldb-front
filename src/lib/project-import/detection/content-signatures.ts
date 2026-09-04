const countPatternMatches = (content: string, patterns: RegExp[]): number =>
    patterns.reduce(
        (count, pattern) => (pattern.test(content) ? count + 1 : count),
        0
    );

export const isLaravelMigrationContent = (content: string): boolean => {
    const patterns = [
        /use\s+Illuminate\\Database\\Migrations\\Migration/,
        /use\s+Illuminate\\Database\\Schema\\Blueprint/,
        /Schema::create\s*\(/,
        /Schema::table\s*\(/,
        /return\s+new\s+class\s+extends\s+Migration/,
        /extends\s+Migration\b/,
    ];

    return countPatternMatches(content, patterns) >= 2;
};

export const isPrismaSchemaContent = (content: string): boolean => {
    const hasDatasource = /datasource\s+\w+\s*\{/.test(content);
    const hasModelOrEnum = /\b(model|enum)\s+\w+\s*\{/.test(content);
    const hasGenerator = /generator\s+\w+\s*\{/.test(content);

    return hasDatasource && hasModelOrEnum && (hasGenerator || hasDatasource);
};

export const isRailsSchemaContent = (content: string): boolean =>
    /ActiveRecord::Schema/.test(content) && /\.define\b/.test(content);

export const isEfModelSnapshotContent = (content: string): boolean => {
    const hasSnapshotClass =
        /class\s+\w+ModelSnapshot\b/.test(content) ||
        /:\s*ModelSnapshot\b/.test(content);
    const hasBuildModel =
        /BuildModel\s*\(\s*ModelBuilder/.test(content) ||
        /modelBuilder\.Entity\s*\(/.test(content);

    return hasSnapshotClass && hasBuildModel;
};

export const isDjangoMigrationContent = (content: string): boolean => {
    const hasImport = /from\s+django\.db\s+import\s+migrations/.test(content);
    const hasClass = /class\s+Migration\s*\(\s*migrations\.Migration\s*\)/.test(
        content
    );
    const hasOperations = /operations\s*=/.test(content);

    return hasImport && hasClass && hasOperations;
};

export interface DrizzleJournalShape {
    version: string;
    dialect: string;
    entries: Array<{ tag: string }>;
}

export const parseDrizzleJournalContent = (
    content: string
): DrizzleJournalShape | null => {
    try {
        const parsed = JSON.parse(content) as Partial<DrizzleJournalShape>;

        if (
            !parsed ||
            typeof parsed.version !== 'string' ||
            typeof parsed.dialect !== 'string' ||
            !Array.isArray(parsed.entries)
        ) {
            return null;
        }

        const entries = parsed.entries.filter(
            (entry): entry is { tag: string } =>
                typeof entry === 'object' &&
                entry !== null &&
                typeof entry.tag === 'string'
        );

        if (entries.length === 0) {
            return null;
        }

        return {
            version: parsed.version,
            dialect: parsed.dialect,
            entries,
        };
    } catch {
        return null;
    }
};

export const isDrizzleConfigBasename = (fileName: string): boolean =>
    /^drizzle\.config\.(ts|js|mjs|cjs)$/.test(fileName);

export const isDjangoMigrationFileName = (fileName: string): boolean => {
    if (fileName === '__init__.py' || fileName.startsWith('.')) {
        return false;
    }

    return /^\d{4}_.+\.py$/.test(fileName);
};
