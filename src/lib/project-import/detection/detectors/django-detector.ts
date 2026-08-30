import type { ProjectDetectionCandidate } from '../../project-types';
import { joinArchivePath } from '../archive-paths';
import {
    createCandidate,
    evidenceFromCode,
    isMigrationFileName,
    listPathsMatching,
    readTextIfExists,
    containsDependency,
    type ProjectDetector,
} from '../detector-utils';

const DJANGO_DEPENDENCY_PATTERNS = [/\bDjango\b/i, /\bdjango\b/i];

export const detectDjangoProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const managePath = joinArchivePath(rootPath, 'manage.py');
    if (archive.has(managePath)) {
        evidence.push(evidenceFromCode('django_manage_py', managePath));
    }

    const migrationPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/migrations/') &&
            filePath.endsWith('.py') &&
            isMigrationFileName(filePath)
    );
    if (migrationPaths.length > 0) {
        evidence.push(evidenceFromCode('django_migrations', migrationPaths[0]));
        relevantFiles.push(...migrationPaths);
    }

    const dependencyPaths = [
        joinArchivePath(rootPath, 'pyproject.toml'),
        joinArchivePath(rootPath, 'requirements.txt'),
    ];
    for (const dependencyPath of dependencyPaths) {
        const content = await readTextIfExists(archive, dependencyPath);
        if (
            content &&
            containsDependency(content, DJANGO_DEPENDENCY_PATTERNS)
        ) {
            evidence.push(
                evidenceFromCode('django_dependencies', dependencyPath)
            );
            relevantFiles.push(dependencyPath);
            break;
        }
    }

    const settingsPaths = listPathsMatching(index, rootPath, (filePath) =>
        filePath.endsWith('settings.py')
    );
    if (settingsPaths.length > 0) {
        evidence.push(evidenceFromCode('django_settings', settingsPaths[0]));
        relevantFiles.push(settingsPaths[0]);
    }

    const candidate = createCandidate(
        'django',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};
