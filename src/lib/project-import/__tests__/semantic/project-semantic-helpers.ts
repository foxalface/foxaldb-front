import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';
import type {
    ProjectImportInput,
    ProjectImportResult,
} from '../../project-execution-types';
import {
    projectDiagramSemantics,
    type SemanticDiagram,
} from '@/lib/import/test-support/diagram-semantic-projection';
import {
    findSemanticField,
    findSemanticTable,
    postsToUsersFk,
} from '@/lib/import/__tests__/semantic/semantic-golden-helpers';

export { findSemanticField, findSemanticTable, postsToUsersFk };

export const semanticFromDiagram = (diagram: Diagram): SemanticDiagram =>
    projectDiagramSemantics(diagram);

export const semanticFromProjectResult = (
    result: ProjectImportResult
): SemanticDiagram => projectDiagramSemantics(result.diagram);

export const minimalLocalCandidate = (
    framework: ProjectImportInput['candidate']['framework'],
    relevantFiles: string[]
): ProjectImportInput['candidate'] => ({
    framework,
    rootPath: '',
    relevantFiles,
    score: 20,
    confidence: 'high',
    evidence: [],
    parserLocation: 'local',
});

export const minimalLocalBundle = (
    framework: ProjectImportInput['bundle']['framework'],
    files: ProjectImportInput['bundle']['files']
): ProjectImportInput['bundle'] => ({
    framework,
    rootPath: '',
    files,
});

export const projectInput = (
    framework: 'prisma' | 'rails' | 'drizzle',
    files: ProjectImportInput['bundle']['files'],
    targetDatabaseType: DatabaseType
): ProjectImportInput => ({
    candidate: minimalLocalCandidate(
        framework,
        files.map((file) => file.relativePath)
    ),
    bundle: minimalLocalBundle(framework, files),
    targetDatabaseType,
});
