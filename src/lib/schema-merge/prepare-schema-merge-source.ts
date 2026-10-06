import { analyzeImportContent } from '@/dialogs/common/import-schema/analyze-import-content';
import { isImportSchemaFileNameAllowed } from '@/dialogs/common/import-schema/constants';
import type { DatabaseType } from '@/lib/domain/database-type';
import { DatabaseType as DatabaseTypeValue } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import {
    getDiagramJsonDatabaseType,
    detectImportFormat,
} from '@/lib/import/detect-format';
import { importDiagramFromJson } from '@/lib/import/import-diagram-from-json';
import { importSchema } from '@/lib/import/import-schema';
import { areDialectsCompatibleForMatch } from '@/lib/import/import-schema-resolution';
import type { ImportFormat } from '@/lib/import/types';
import { ArchiveReader } from '@/lib/project-import/archive/archive-reader';
import {
    ArchiveEntryTooLargeError,
    ArchiveError,
    ArchiveExtractionTooLargeError,
    ArchiveTooLargeError,
    ArchiveTooManyFilesError,
} from '@/lib/project-import/archive/archive-errors';
import { analyzeProjectArchive } from '@/lib/project-import/analyze-project-archive';
import { detectDatabaseGroups } from '@/lib/project-import/detection/database-groups/detect-database-groups';
import { getSelectableCandidates } from '@/lib/project-import/detection/detect-project';
import { getProjectCandidateKey } from '@/lib/project-import/framework-labels';
import { importProject } from '@/lib/project-import/import-project';
import { isZipArchiveFile } from '@/lib/project-import/is-zip-archive-file';
import { getParserLocation } from '@/lib/project-import/parser-location';
import {
    ProjectImportError,
    ProjectImportValidationRejectedError,
} from '@/lib/project-import/project-import-errors';
import type {
    ProjectDatabaseGroup,
    ProjectDetectionCandidate,
    ProjectFramework,
} from '@/lib/project-import/project-types';
import { resolveUploadCapabilities } from '@/lib/upload-capabilities';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import type {
    PrepareSchemaMergeSourceContext,
    SchemaMergeDatabaseTypeMismatch,
    SchemaMergeFileTooLarge,
    SchemaMergeInvalidSource,
    SchemaMergeNeedsDialectResolution,
    SchemaMergeProjectParseFailure,
    SchemaMergeSourceInput,
    SchemaMergeSourcePreparationResult,
    SchemaMergeSourceResolution,
    SchemaMergeUnsupportedSource,
} from './source-adapter-types';
import {
    schemaMergeSourceKindForImportFormat,
    schemaMergeSourceKindForProjectFramework,
    type SchemaMergeSourceKind,
} from './source-kinds';

const textByteLength = (content: string): number =>
    new TextEncoder().encode(content).length;

const looksLikeJson = (content: string): boolean => {
    const trimmed = content.trim();

    return (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    );
};

const loadCapabilities = async (
    context: PrepareSchemaMergeSourceContext
): Promise<UploadCapabilities> => {
    if (context.uploadCapabilities) {
        return context.uploadCapabilities;
    }

    return resolveUploadCapabilities();
};

const unsupported = (
    code: SchemaMergeUnsupportedSource['code']
): SchemaMergeUnsupportedSource => ({
    status: 'unsupported',
    code,
});

const invalid = (
    code: SchemaMergeInvalidSource['code'],
    archiveCode?: string
): SchemaMergeInvalidSource => ({
    status: 'invalid',
    code,
    ...(archiveCode ? { archiveCode } : {}),
});

const fileTooLarge = (
    limit: SchemaMergeFileTooLarge['limit'],
    sizeBytes: number,
    maxBytes: number
): SchemaMergeFileTooLarge => ({
    status: 'file_too_large',
    limit,
    sizeBytes,
    maxBytes,
});

const databaseTypeMismatch = (
    sourceKind: SchemaMergeSourceKind,
    currentDatabaseType: DatabaseType,
    detectedDatabaseType: DatabaseType
): SchemaMergeDatabaseTypeMismatch => ({
    status: 'database_type_mismatch',
    sourceKind,
    currentDatabaseType,
    detectedDatabaseType,
});

const isKnownDatabaseType = (value: string): value is DatabaseType =>
    (Object.values(DatabaseTypeValue) as string[]).includes(value);

/**
 * Parsers already return a Diagram. Missing list fields are filled so the
 * shape matches the Compare incoming-diagram contract. Entity ids are left
 * as the parser produced them.
 */
const toIncomingDiagram = (diagram: Diagram): Diagram => {
    if (diagram.tables && diagram.relationships) {
        return diagram;
    }

    return {
        ...diagram,
        tables: diagram.tables ?? [],
        relationships: diagram.relationships ?? [],
    };
};

const finishReady = ({
    diagram,
    sourceKind,
    detectedFormat,
    detectedFramework,
    currentDatabaseType,
}: {
    diagram: Diagram;
    sourceKind: SchemaMergeSourceKind;
    detectedFormat: ImportFormat | null;
    detectedFramework: ProjectFramework | null;
    currentDatabaseType: DatabaseType;
}): SchemaMergeSourcePreparationResult => {
    if (!isKnownDatabaseType(diagram.databaseType)) {
        return invalid('malformed_source');
    }

    if (
        sourceKind === 'postgres_dump' &&
        diagram.databaseType !== DatabaseTypeValue.POSTGRESQL
    ) {
        return databaseTypeMismatch(
            sourceKind,
            currentDatabaseType,
            diagram.databaseType
        );
    }

    if (
        !areDialectsCompatibleForMatch(
            currentDatabaseType,
            diagram.databaseType
        )
    ) {
        return databaseTypeMismatch(
            sourceKind,
            currentDatabaseType,
            diagram.databaseType
        );
    }

    return {
        status: 'ready',
        incomingDiagram: toIncomingDiagram(diagram),
        source: { kind: sourceKind },
        detectedFormat,
        detectedFramework,
        detectedDatabaseType: diagram.databaseType,
    };
};

const mapArchiveError = (
    error: ArchiveError
): SchemaMergeSourcePreparationResult => {
    if (error instanceof ArchiveTooLargeError) {
        return fileTooLarge(
            'archive_compressed',
            error.sizeBytes,
            error.maxBytes
        );
    }

    if (error instanceof ArchiveExtractionTooLargeError) {
        return fileTooLarge(
            'archive_uncompressed',
            error.sizeBytes,
            error.maxBytes
        );
    }

    if (error instanceof ArchiveEntryTooLargeError) {
        return fileTooLarge('archive_entry', error.sizeBytes, error.maxBytes);
    }

    if (error instanceof ArchiveTooManyFilesError) {
        return fileTooLarge(
            'archive_entry_count',
            error.fileCount,
            error.maxFiles
        );
    }

    return invalid('malformed_archive', error.code);
};

const mapProjectError = (
    error: unknown,
    framework: ProjectFramework
): SchemaMergeSourcePreparationResult => {
    if (error instanceof ArchiveError) {
        return mapArchiveError(error);
    }

    if (error instanceof ProjectImportError) {
        const failure: SchemaMergeProjectParseFailure = {
            status: 'project_parse_failure',
            code: error.code,
            parserLocation: getParserLocation(framework),
        };

        if (
            error instanceof ProjectImportValidationRejectedError &&
            error.path
        ) {
            failure.path = error.path;
        }

        return failure;
    }

    return invalid('malformed_source');
};

const prepareDiagramJson = (
    content: string,
    context: PrepareSchemaMergeSourceContext
): SchemaMergeSourcePreparationResult => {
    const detectedDatabaseType = getDiagramJsonDatabaseType(content);

    if (!detectedDatabaseType) {
        return invalid('malformed_source');
    }

    const sourceKind = schemaMergeSourceKindForImportFormat('diagram_json');

    if (
        !areDialectsCompatibleForMatch(
            context.currentDiagram.databaseType,
            detectedDatabaseType
        )
    ) {
        return databaseTypeMismatch(
            sourceKind,
            context.currentDiagram.databaseType,
            detectedDatabaseType
        );
    }

    try {
        const diagram = importDiagramFromJson(content, detectedDatabaseType);

        return finishReady({
            diagram,
            sourceKind,
            detectedFormat: 'diagram_json',
            detectedFramework: null,
            currentDatabaseType: context.currentDiagram.databaseType,
        });
    } catch {
        return invalid('malformed_source');
    }
};

/**
 * A dump is PostgreSQL. It is not offered as a dialect choice, and its
 * diagram type stays PostgreSQL even when the current diagram is CockroachDB.
 */
const preparePostgresDump = async (
    content: string,
    context: PrepareSchemaMergeSourceContext
): Promise<SchemaMergeSourcePreparationResult> => {
    const sourceKind = schemaMergeSourceKindForImportFormat('postgres_dump');
    const requestedDialect = context.resolution?.sourceDialect;

    if (requestedDialect && requestedDialect !== DatabaseTypeValue.POSTGRESQL) {
        return invalid('invalid_dialect_resolution');
    }

    if (
        !areDialectsCompatibleForMatch(
            context.currentDiagram.databaseType,
            DatabaseTypeValue.POSTGRESQL
        )
    ) {
        return databaseTypeMismatch(
            sourceKind,
            context.currentDiagram.databaseType,
            DatabaseTypeValue.POSTGRESQL
        );
    }

    return importResolvedSql(
        content,
        'postgres_dump',
        DatabaseTypeValue.POSTGRESQL,
        context
    );
};

const prepareSql = async (
    content: string,
    format: 'sql' | 'postgres_dump',
    context: PrepareSchemaMergeSourceContext
): Promise<SchemaMergeSourcePreparationResult> => {
    if (format === 'postgres_dump') {
        return preparePostgresDump(content, context);
    }

    const sourceKind = schemaMergeSourceKindForImportFormat(format);
    const analysis = analyzeImportContent(
        content,
        context.currentDiagram.databaseType
    );

    if (
        analysis.displayKind === 'clickhouse_unsupported' ||
        analysis.displayKind === 'unsupported'
    ) {
        return unsupported('unsupported_source');
    }

    if (
        analysis.resolutionState === 'mismatch' &&
        analysis.detectedDatabaseType
    ) {
        return databaseTypeMismatch(
            sourceKind,
            context.currentDiagram.databaseType,
            analysis.detectedDatabaseType
        );
    }

    if (analysis.resolutionState === 'ambiguous') {
        return resolveAmbiguousSql(content, format, analysis, context);
    }

    const detectedDialect = analysis.resolvedSourceDialect;

    if (!detectedDialect) {
        return unsupported('unsupported_source');
    }

    if (
        context.resolution?.sourceDialect &&
        context.resolution.sourceDialect !== detectedDialect
    ) {
        return invalid('invalid_dialect_resolution');
    }

    return importResolvedSql(content, format, detectedDialect, context);
};

const resolveAmbiguousSql = async (
    content: string,
    format: 'sql' | 'postgres_dump',
    analysis: SchemaMergeNeedsDialectResolution['analysis'],
    context: PrepareSchemaMergeSourceContext
): Promise<SchemaMergeSourcePreparationResult> => {
    const sourceDialect = context.resolution?.sourceDialect;

    if (!sourceDialect) {
        return {
            status: 'needs_dialect_resolution',
            analysis,
        };
    }

    if (!analysis.dialectCandidates.includes(sourceDialect)) {
        return invalid('invalid_dialect_resolution');
    }

    if (
        !areDialectsCompatibleForMatch(
            context.currentDiagram.databaseType,
            sourceDialect
        )
    ) {
        return databaseTypeMismatch(
            schemaMergeSourceKindForImportFormat(format),
            context.currentDiagram.databaseType,
            sourceDialect
        );
    }

    return importResolvedSql(content, format, sourceDialect, context);
};

const importResolvedSql = async (
    content: string,
    format: 'sql' | 'postgres_dump',
    sourceDialect: DatabaseType,
    context: PrepareSchemaMergeSourceContext
): Promise<SchemaMergeSourcePreparationResult> => {
    const importDialect =
        format === 'postgres_dump'
            ? DatabaseTypeValue.POSTGRESQL
            : sourceDialect;

    if (
        format === 'postgres_dump' &&
        sourceDialect !== DatabaseTypeValue.POSTGRESQL
    ) {
        return invalid('invalid_dialect_resolution');
    }

    try {
        const result = await importSchema({
            content,
            selectedDatabaseType: importDialect,
            resolvedSourceDialect: importDialect,
        });

        return finishReady({
            diagram: result.diagram,
            sourceKind: schemaMergeSourceKindForImportFormat(format),
            detectedFormat: format,
            detectedFramework: null,
            currentDatabaseType: context.currentDiagram.databaseType,
        });
    } catch {
        return invalid('malformed_source');
    }
};

const prepareDbmlOrMetadata = async (
    content: string,
    format: 'dbml' | 'metadata_json',
    context: PrepareSchemaMergeSourceContext
): Promise<SchemaMergeSourcePreparationResult> => {
    try {
        const result = await importSchema({
            content,
            selectedDatabaseType: context.currentDiagram.databaseType,
            databaseEdition: context.currentDiagram.databaseEdition,
        });

        return finishReady({
            diagram: result.diagram,
            sourceKind: schemaMergeSourceKindForImportFormat(format),
            detectedFormat: format,
            detectedFramework: null,
            currentDatabaseType: context.currentDiagram.databaseType,
        });
    } catch {
        return invalid('malformed_source');
    }
};

const prepareTextContent = async (
    content: string,
    context: PrepareSchemaMergeSourceContext,
    capabilities: UploadCapabilities
): Promise<SchemaMergeSourcePreparationResult> => {
    const sizeBytes = textByteLength(content);

    if (sizeBytes > capabilities.schema.textMaxBytes) {
        return fileTooLarge(
            'text',
            sizeBytes,
            capabilities.schema.textMaxBytes
        );
    }

    if (content.trim().length === 0) {
        return invalid('empty_content');
    }

    const format = detectImportFormat(content);

    if (format.format === 'diagram_json') {
        return prepareDiagramJson(content, context);
    }

    if (format.format === 'dbml' || format.format === 'metadata_json') {
        return prepareDbmlOrMetadata(content, format.format, context);
    }

    if (format.format === 'sql' || format.format === 'postgres_dump') {
        return prepareSql(content, format.format, context);
    }

    if (looksLikeJson(content)) {
        return invalid('malformed_source');
    }

    return unsupported('unable_to_detect');
};

const prepareTextFile = async (
    file: File,
    context: PrepareSchemaMergeSourceContext,
    capabilities: UploadCapabilities
): Promise<SchemaMergeSourcePreparationResult> => {
    if (await isZipArchiveFile(file)) {
        return invalid('archive_input_required');
    }

    if (!isImportSchemaFileNameAllowed(file.name)) {
        return unsupported('unsupported_file_extension');
    }

    if (file.size > capabilities.schema.textMaxBytes) {
        return fileTooLarge(
            'text',
            file.size,
            capabilities.schema.textMaxBytes
        );
    }

    let content: string;

    try {
        content = await file.text();
    } catch {
        return invalid('unreadable_file');
    }

    return prepareTextContent(content, context, capabilities);
};

const selectProjectCandidate = (
    candidates: ProjectDetectionCandidate[],
    resolution: SchemaMergeSourceResolution | undefined,
    ambiguous: boolean
):
    | { candidate: ProjectDetectionCandidate }
    | { result: SchemaMergeSourcePreparationResult } => {
    const selectable = getSelectableCandidates(candidates);

    if (resolution?.projectCandidateKey) {
        const matches = selectable.filter(
            (candidate) =>
                getProjectCandidateKey(candidate) ===
                resolution.projectCandidateKey
        );

        const match = matches[0];

        if (matches.length !== 1 || !match) {
            return { result: invalid('unknown_project_candidate') };
        }

        return { candidate: match };
    }

    if (ambiguous || selectable.length !== 1) {
        return {
            result: {
                status: 'needs_project_resolution',
                analysis: {
                    candidates,
                    recommendedCandidate: selectable[0] ?? null,
                    status: 'ambiguous',
                },
                candidates: selectable,
            },
        };
    }

    const onlyCandidate = selectable[0];

    if (!onlyCandidate) {
        return { result: unsupported('unable_to_detect') };
    }

    return { candidate: onlyCandidate };
};

const selectDatabaseGroup = (
    groups: ProjectDatabaseGroup[],
    multiple: boolean,
    resolution: SchemaMergeSourceResolution | undefined
):
    | { group: ProjectDatabaseGroup }
    | { result: SchemaMergeInvalidSource }
    | { needsResolution: true } => {
    if (resolution?.databaseGroupId) {
        const group = groups.find(
            (candidate) => candidate.id === resolution.databaseGroupId
        );

        if (!group) {
            return { result: invalid('unknown_database_group') };
        }

        return { group };
    }

    if (!multiple && groups.length === 1) {
        const onlyGroup = groups[0];

        if (onlyGroup) {
            return { group: onlyGroup };
        }
    }

    return { needsResolution: true };
};

const prepareArchive = async (
    file: File,
    context: PrepareSchemaMergeSourceContext,
    capabilities: UploadCapabilities
): Promise<SchemaMergeSourcePreparationResult> => {
    if (file.size > capabilities.archive.compressedMaxBytes) {
        return fileTooLarge(
            'archive_compressed',
            file.size,
            capabilities.archive.compressedMaxBytes
        );
    }

    let archive: ArchiveReader;

    try {
        archive = await ArchiveReader.open(file, capabilities.archive);
    } catch (error: unknown) {
        if (error instanceof ArchiveError) {
            return mapArchiveError(error);
        }

        return invalid('malformed_archive');
    }

    try {
        const analysis = await analyzeProjectArchive(archive);

        if (analysis.status === 'unsupported') {
            return unsupported('unable_to_detect');
        }

        const selected = selectProjectCandidate(
            analysis.candidates,
            context.resolution,
            analysis.status === 'ambiguous'
        );

        if ('result' in selected) {
            if (selected.result.status === 'needs_project_resolution') {
                return {
                    ...selected.result,
                    analysis,
                };
            }

            return selected.result;
        }

        const candidate = selected.candidate;
        const groupAnalysis = await detectDatabaseGroups(archive, candidate);
        const sourceKind = schemaMergeSourceKindForProjectFramework(
            candidate.framework
        );
        const selectedGroup = selectDatabaseGroup(
            groupAnalysis.groups,
            groupAnalysis.status === 'multiple',
            context.resolution
        );

        if ('needsResolution' in selectedGroup) {
            if (groupAnalysis.groups.length === 0) {
                return unsupported('unsupported_source');
            }

            return {
                status: 'needs_database_group_resolution',
                sourceKind,
                framework: candidate.framework,
                candidate,
                analysis: groupAnalysis,
            };
        }

        if ('result' in selectedGroup) {
            return selectedGroup.result;
        }

        try {
            const imported = await importProject({
                archive,
                candidate,
                targetDatabaseType: context.currentDiagram.databaseType,
                archiveFileName: file.name,
                databaseGroup: selectedGroup.group,
            });

            return finishReady({
                diagram: imported.diagram,
                sourceKind,
                detectedFormat: null,
                detectedFramework: candidate.framework,
                currentDatabaseType: context.currentDiagram.databaseType,
            });
        } catch (error: unknown) {
            return mapProjectError(error, candidate.framework);
        }
    } catch (error: unknown) {
        if (error instanceof ArchiveError) {
            return mapArchiveError(error);
        }

        return invalid('malformed_archive');
    } finally {
        archive.close();
    }
};

/**
 * Prepares one Schema Merge source into a normalized Diagram plus `source.kind`.
 *
 * Does not call Compare, does not mutate `currentDiagram`, and does not
 * convert the current diagram database type.
 */
export const prepareSchemaMergeSource = async (
    input: SchemaMergeSourceInput,
    context: PrepareSchemaMergeSourceContext
): Promise<SchemaMergeSourcePreparationResult> => {
    const capabilities = await loadCapabilities(context);

    switch (input.type) {
        case 'text':
            return prepareTextContent(input.content, context, capabilities);
        case 'text_file':
            return prepareTextFile(input.file, context, capabilities);
        case 'archive':
            return prepareArchive(input.file, context, capabilities);
        default: {
            const unreachable: never = input;
            return unreachable;
        }
    }
};
