export type { ArchiveEntry } from './archive/archive-entry';
export { ArchiveReader } from './archive/archive-reader';
export {
    ArchiveClosedError,
    ArchiveCorruptedError,
    ArchiveDepthExceededError,
    ArchiveDirectoryReadError,
    ArchiveDuplicatePathError,
    ArchiveEntryNotFoundError,
    ArchiveEntryTooLargeError,
    ArchiveError,
    ArchiveExtractionTooLargeError,
    ArchiveInvalidPathError,
    ArchiveInvalidUtf8ContentError,
    ArchiveInvalidUtf8PathError,
    ArchivePathTooLongError,
    ArchivePathTraversalError,
    ArchiveTooLargeError,
    ArchiveTooManyFilesError,
    ArchiveUnsupportedFormatError,
} from './archive/archive-errors';
export {
    MAX_ARCHIVE_COMPRESSED_BYTES,
    MAX_ARCHIVE_DIRECTORY_DEPTH,
    MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES,
    MAX_ARCHIVE_FILE_COUNT,
    MAX_ARCHIVE_PATH_LENGTH,
    MAX_ARCHIVE_UNCOMPRESSED_BYTES,
} from './archive/archive-limits';
export { isZipArchiveBytes } from './archive/archive-utils';
export { analyzeProjectArchive } from './analyze-project-archive';
export { collectFileBundle } from './bundle/collect-file-bundle';
export {
    FRAMEWORK_FILE_SPECS,
    isAllowedFrameworkRelativePath,
    isExcludedBundlePath,
} from './bundle/framework-file-specs';
export {
    detectProjectCandidates,
    getSelectableCandidates,
} from './detection/detect-project';
export { discoverProjectRootCandidates } from './detection/project-root-discovery';
export {
    PROJECT_FRAMEWORK_LABEL_KEYS,
    getProjectCandidateKey,
} from './framework-labels';
export { isZipArchiveFile, readFileHeaderBytes } from './is-zip-archive-file';
export { getParserLocation, isRemoteParserFramework } from './parser-location';
export { PROJECT_IMPORT_PARSER_ENABLED } from './project-import-capability';
export { getProjectSummaryMetrics } from './project-summary-metrics';
export type {
    ParserLocation,
    ProjectArchiveAnalysis,
    ProjectArchiveAnalysisStatus,
    ProjectDetectionCandidate,
    ProjectDetectionConfidence,
    ProjectEvidence,
    ProjectEvidenceCode,
    ProjectFileBundle,
    ProjectFileBundleEntry,
    ProjectFramework,
} from './project-types';
