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

const LARAVEL_COMPOSER_PATTERN = /"laravel\/framework"/i;

export const detectLaravelProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const artisanPath = joinArchivePath(rootPath, 'artisan');
    if (archive.has(artisanPath)) {
        evidence.push(evidenceFromCode('laravel_artisan', artisanPath));
    }

    const composerPath = joinArchivePath(rootPath, 'composer.json');
    const composerContent = await readTextIfExists(archive, composerPath);
    if (
        composerContent &&
        containsDependency(composerContent, [LARAVEL_COMPOSER_PATTERN])
    ) {
        evidence.push(evidenceFromCode('laravel_composer', composerPath));
        relevantFiles.push(composerPath);
    }

    const migrationPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.endsWith('.php') &&
            (filePath.includes('/database/migrations/') ||
                filePath.startsWith('database/migrations/'))
    );
    if (migrationPaths.length > 0) {
        evidence.push(
            evidenceFromCode('laravel_migrations', migrationPaths[0])
        );
        relevantFiles.push(...migrationPaths);
    }

    const bootstrapPath = joinArchivePath(rootPath, 'bootstrap/app.php');
    if (archive.has(bootstrapPath)) {
        evidence.push(evidenceFromCode('laravel_bootstrap', bootstrapPath));
    }

    const providerPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/app/Providers/') && filePath.endsWith('.php')
    );
    if (providerPaths.length > 0) {
        evidence.push(evidenceFromCode('laravel_providers', providerPaths[0]));
    }

    const candidate = createCandidate(
        'laravel',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};
