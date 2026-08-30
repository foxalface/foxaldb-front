import type { ProjectDetectionCandidate } from '../../project-types';
import { joinArchivePath } from '../archive-paths';
import {
    createCandidate,
    evidenceFromCode,
    listPathsMatching,
    readTextIfExists,
    containsDependency,
    type ProjectDetector,
} from '../detector-utils';

const DRIZZLE_PACKAGE_PATTERNS = [/"drizzle-orm"/i, /"drizzle-kit"/i];

export const detectDrizzleProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const configPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            basenameMatchesDrizzleConfig(filePath) &&
            isDirectChildOfRoot(filePath, rootPath)
    );
    if (configPaths.length > 0) {
        evidence.push(evidenceFromCode('drizzle_config', configPaths[0]));
        relevantFiles.push(...configPaths);
    }

    const journalPath = joinArchivePath(rootPath, 'drizzle/meta/_journal.json');
    if (archive.has(journalPath)) {
        evidence.push(evidenceFromCode('drizzle_journal', journalPath));
        relevantFiles.push(journalPath);
    }

    const sqlPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/drizzle/') && filePath.endsWith('.sql')
    );
    if (sqlPaths.length > 0) {
        evidence.push(evidenceFromCode('drizzle_sql', sqlPaths[0]));
        relevantFiles.push(...sqlPaths);
    }

    const packagePath = joinArchivePath(rootPath, 'package.json');
    const packageContent = await readTextIfExists(archive, packagePath);
    if (
        packageContent &&
        containsDependency(packageContent, DRIZZLE_PACKAGE_PATTERNS)
    ) {
        evidence.push(evidenceFromCode('drizzle_package_json', packagePath));
        relevantFiles.push(packagePath);
    }

    const candidate = createCandidate(
        'drizzle',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};

const basenameMatchesDrizzleConfig = (filePath: string): boolean => {
    const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
    return /^drizzle\.config\.(ts|js|mjs|cjs)$/.test(fileName);
};

const isDirectChildOfRoot = (filePath: string, rootPath: string): boolean => {
    const relative =
        rootPath.length === 0 ? filePath : filePath.slice(rootPath.length + 1);
    return !relative.includes('/');
};
