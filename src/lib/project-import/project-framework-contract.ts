import type { ProjectFramework } from './project-types';
import {
    LOCAL_PROJECT_FRAMEWORKS,
    REMOTE_PROJECT_FRAMEWORKS,
    type LocalProjectFramework,
    type RemoteProjectFramework,
} from './project-execution-types';

/**
 * Canonical project framework identifiers (M11.1C contract).
 *
 * Local parsers run in the browser. Remote parsers use POST /api/project-import/parse.
 * Do not send local framework names to the remote API.
 */
export const CANONICAL_LOCAL_PROJECT_FRAMEWORKS: readonly LocalProjectFramework[] =
    LOCAL_PROJECT_FRAMEWORKS;

export const CANONICAL_REMOTE_PROJECT_FRAMEWORKS: readonly RemoteProjectFramework[] =
    REMOTE_PROJECT_FRAMEWORKS;

export const CANONICAL_PROJECT_FRAMEWORKS: readonly ProjectFramework[] = [
    ...CANONICAL_LOCAL_PROJECT_FRAMEWORKS,
    ...CANONICAL_REMOTE_PROJECT_FRAMEWORKS,
];

export const isCanonicalLocalProjectFramework = (
    framework: string
): framework is LocalProjectFramework =>
    (CANONICAL_LOCAL_PROJECT_FRAMEWORKS as readonly string[]).includes(
        framework
    );

export const isCanonicalRemoteProjectFramework = (
    framework: string
): framework is RemoteProjectFramework =>
    (CANONICAL_REMOTE_PROJECT_FRAMEWORKS as readonly string[]).includes(
        framework
    );

export const isCanonicalProjectFramework = (
    framework: string
): framework is ProjectFramework =>
    (CANONICAL_PROJECT_FRAMEWORKS as readonly string[]).includes(framework);
