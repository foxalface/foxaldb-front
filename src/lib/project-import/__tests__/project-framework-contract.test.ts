import { describe, expect, it } from 'vitest';
import {
    CANONICAL_LOCAL_PROJECT_FRAMEWORKS,
    CANONICAL_PROJECT_FRAMEWORKS,
    CANONICAL_REMOTE_PROJECT_FRAMEWORKS,
    isCanonicalLocalProjectFramework,
    isCanonicalRemoteProjectFramework,
} from '../project-framework-contract';
import {
    LOCAL_PROJECT_FRAMEWORKS,
    REMOTE_PROJECT_FRAMEWORKS,
} from '../project-execution-types';

// Backend enum values mirrored in test (see backend ProjectImportFramework.php)
const BACKEND_REMOTE_FRAMEWORKS = [
    'laravel',
    'entity_framework_core',
    'django',
];
const BACKEND_LOCAL_ONLY = ['prisma', 'drizzle', 'rails'];

describe('project framework contract (M11.1C)', () => {
    it('locks canonical local and remote framework identifiers', () => {
        expect([...CANONICAL_LOCAL_PROJECT_FRAMEWORKS]).toEqual([
            'prisma',
            'drizzle',
            'rails',
        ]);
        expect([...CANONICAL_REMOTE_PROJECT_FRAMEWORKS]).toEqual([
            'laravel',
            'entity_framework_core',
            'django',
        ]);
        expect([...CANONICAL_PROJECT_FRAMEWORKS]).toEqual([
            ...CANONICAL_LOCAL_PROJECT_FRAMEWORKS,
            ...CANONICAL_REMOTE_PROJECT_FRAMEWORKS,
        ]);
    });

    it('matches project-execution-types exports', () => {
        expect(CANONICAL_LOCAL_PROJECT_FRAMEWORKS).toEqual(
            LOCAL_PROJECT_FRAMEWORKS
        );
        expect(CANONICAL_REMOTE_PROJECT_FRAMEWORKS).toEqual(
            REMOTE_PROJECT_FRAMEWORKS
        );
    });

    it('matches backend remote framework allowlist', () => {
        expect([...CANONICAL_REMOTE_PROJECT_FRAMEWORKS]).toEqual(
            BACKEND_REMOTE_FRAMEWORKS
        );
        expect([...CANONICAL_LOCAL_PROJECT_FRAMEWORKS]).toEqual(
            BACKEND_LOCAL_ONLY
        );
    });

    it('rejects alias framework names', () => {
        expect(isCanonicalRemoteProjectFramework('ef_core')).toBe(false);
        expect(isCanonicalRemoteProjectFramework('entityframework')).toBe(
            false
        );
        expect(isCanonicalLocalProjectFramework('laravel_migrations')).toBe(
            false
        );
    });
});
