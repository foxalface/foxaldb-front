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

const RAILS_GEMFILE_PATTERN = /\brails\b/i;

export const detectRailsProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const schemaPath = joinArchivePath(rootPath, 'db/schema.rb');
    if (archive.has(schemaPath)) {
        evidence.push(evidenceFromCode('rails_schema_rb', schemaPath));
        relevantFiles.push(schemaPath);
    }

    const gemfilePath = joinArchivePath(rootPath, 'Gemfile');
    const gemfileContent = await readTextIfExists(archive, gemfilePath);
    if (
        gemfileContent &&
        containsDependency(gemfileContent, [RAILS_GEMFILE_PATTERN])
    ) {
        evidence.push(evidenceFromCode('rails_gemfile', gemfilePath));
    }

    const applicationPath = joinArchivePath(rootPath, 'config/application.rb');
    if (archive.has(applicationPath)) {
        evidence.push(
            evidenceFromCode('rails_application_rb', applicationPath)
        );
    }

    const migrationPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/db/migrate/') && filePath.endsWith('.rb')
    );
    if (migrationPaths.length > 0) {
        evidence.push(evidenceFromCode('rails_migrations', migrationPaths[0]));
        relevantFiles.push(...migrationPaths);
    }

    const databasePath = joinArchivePath(rootPath, 'config/database.yml');
    if (archive.has(databasePath)) {
        relevantFiles.push(databasePath);
    }

    const candidate = createCandidate(
        'rails',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};
