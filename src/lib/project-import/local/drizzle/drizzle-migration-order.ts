export interface DrizzleJournalEntry {
    idx: number;
    version: string;
    when: number;
    tag: string;
    breakpoints: boolean;
}

export interface DrizzleJournal {
    version: string;
    dialect: string;
    entries: DrizzleJournalEntry[];
}

const JOURNAL_PATH_SUFFIX = 'drizzle/meta/_journal.json';

export const isDrizzleJournalPath = (relativePath: string): boolean =>
    relativePath === JOURNAL_PATH_SUFFIX ||
    relativePath.endsWith(`/${JOURNAL_PATH_SUFFIX}`);

export const isDrizzleMigrationSqlPath = (relativePath: string): boolean => {
    const normalized = relativePath.replace(/\\/g, '/');

    return (
        (normalized.startsWith('drizzle/') ||
            normalized.includes('/drizzle/')) &&
        normalized.endsWith('.sql')
    );
};

const parseJournal = (content: string): DrizzleJournal | null => {
    try {
        const parsed = JSON.parse(content) as Partial<DrizzleJournal>;

        if (!parsed || !Array.isArray(parsed.entries)) {
            return null;
        }

        return {
            version: parsed.version ?? '',
            dialect: parsed.dialect ?? '',
            entries: parsed.entries
                .filter(
                    (entry): entry is DrizzleJournalEntry =>
                        typeof entry === 'object' &&
                        entry !== null &&
                        typeof entry.tag === 'string'
                )
                .map((entry, index) => ({
                    idx: typeof entry.idx === 'number' ? entry.idx : index,
                    version: entry.version ?? '',
                    when: typeof entry.when === 'number' ? entry.when : 0,
                    tag: entry.tag,
                    breakpoints: Boolean(entry.breakpoints),
                })),
        };
    } catch {
        return null;
    }
};

const resolveSqlPathForTag = (rootPath: string, tag: string): string => {
    const fileName = `${tag}.sql`;

    if (rootPath.length === 0) {
        return `drizzle/${fileName}`;
    }

    return `${rootPath}/drizzle/${fileName}`;
};

const compareLexicalSqlPaths = (left: string, right: string): number =>
    left.localeCompare(right, undefined, {
        numeric: true,
        sensitivity: 'base',
    });

export const orderDrizzleMigrationSqlFiles = (
    files: Array<{ relativePath: string; content: string }>,
    rootPath: string
): {
    orderedFiles: Array<{ relativePath: string; content: string }>;
    journalDialect: string | null;
    diagnostics: Array<{
        severity: 'warning';
        code: string;
        message: string;
        path?: string;
    }>;
} => {
    const diagnostics: Array<{
        severity: 'warning';
        code: string;
        message: string;
        path?: string;
    }> = [];

    const sqlFiles = files.filter((file) =>
        isDrizzleMigrationSqlPath(file.relativePath)
    );

    if (sqlFiles.length === 0) {
        return { orderedFiles: [], journalDialect: null, diagnostics };
    }

    const journalFile = files.find((file) =>
        isDrizzleJournalPath(file.relativePath)
    );

    if (!journalFile) {
        const orderedFiles = [...sqlFiles].sort((left, right) =>
            compareLexicalSqlPaths(left.relativePath, right.relativePath)
        );

        diagnostics.push({
            severity: 'warning',
            code: 'drizzle_parse_warning',
            message:
                'Drizzle journal was not found; migration SQL files were ordered lexically.',
            path: 'drizzle/meta/_journal.json',
        });

        return { orderedFiles, journalDialect: null, diagnostics };
    }

    const journal = parseJournal(journalFile.content);

    if (!journal) {
        const orderedFiles = [...sqlFiles].sort((left, right) =>
            compareLexicalSqlPaths(left.relativePath, right.relativePath)
        );

        diagnostics.push({
            severity: 'warning',
            code: 'drizzle_parse_warning',
            message:
                'Drizzle journal could not be parsed; migration SQL files were ordered lexically.',
            path: journalFile.relativePath,
        });

        return { orderedFiles, journalDialect: null, diagnostics };
    }

    const filesByPath = new Map(
        sqlFiles.map((file) => [file.relativePath, file] as const)
    );

    const orderedFiles: Array<{ relativePath: string; content: string }> = [];
    const usedPaths = new Set<string>();

    for (const entry of journal.entries) {
        const expectedPath = resolveSqlPathForTag(rootPath, entry.tag);
        const matched =
            filesByPath.get(expectedPath) ??
            sqlFiles.find((file) =>
                file.relativePath.endsWith(`/${entry.tag}.sql`)
            );

        if (!matched) {
            diagnostics.push({
                severity: 'warning',
                code: 'drizzle_parse_warning',
                message: `Drizzle journal references migration "${entry.tag}" but no matching SQL file was found in the bundle.`,
                path: journalFile.relativePath,
            });
            continue;
        }

        if (!usedPaths.has(matched.relativePath)) {
            orderedFiles.push(matched);
            usedPaths.add(matched.relativePath);
        }
    }

    const remaining = sqlFiles
        .filter((file) => !usedPaths.has(file.relativePath))
        .sort((left, right) =>
            compareLexicalSqlPaths(left.relativePath, right.relativePath)
        );

    if (remaining.length > 0) {
        diagnostics.push({
            severity: 'warning',
            code: 'drizzle_parse_warning',
            message:
                'Some Drizzle migration SQL files were not listed in the journal and were appended in lexical order.',
        });
    }

    orderedFiles.push(...remaining);

    return {
        orderedFiles,
        journalDialect: journal.dialect || null,
        diagnostics,
    };
};

export const detectDrizzleSourceDialect = (
    journalDialect: string | null,
    configContent: string | null
): string | null => {
    if (journalDialect) {
        return journalDialect;
    }

    if (!configContent) {
        return null;
    }

    if (/dialect\s*:\s*['"]postgresql['"]/i.test(configContent)) {
        return 'postgresql';
    }

    if (/dialect\s*:\s*['"]mysql['"]/i.test(configContent)) {
        return 'mysql';
    }

    if (/dialect\s*:\s*['"]sqlite['"]/i.test(configContent)) {
        return 'sqlite';
    }

    return null;
};
