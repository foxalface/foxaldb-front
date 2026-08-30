import { describe, expect, it } from 'vitest';
import {
    FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE,
    createValidProjectImportApiResponse,
} from './fixtures/project-import-api-response';
import {
    InconsistentProjectImportFrameworkError,
    MalformedProjectImportPayloadError,
    UnsupportedProjectImportApiVersionError,
} from '../project-import-errors';
import { normalizeProjectImportPayload } from '../normalize-project-import-payload';

describe('normalizeProjectImportPayload', () => {
    it('accepts apiVersion "1"', () => {
        const payload = createValidProjectImportApiResponse('laravel');

        const result = normalizeProjectImportPayload(payload, 'laravel');

        expect(result.framework).toBe('laravel');
        expect(result.diagram.name).toBe('Imported Diagram');
        expect(result.diagnostics).toEqual([]);
    });

    it('rejects missing apiVersion', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        delete (payload.data as { apiVersion?: string }).apiVersion;

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            UnsupportedProjectImportApiVersionError
        );
    });

    it('rejects numeric apiVersion', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        (payload.data as { apiVersion: unknown }).apiVersion = 1;

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            UnsupportedProjectImportApiVersionError
        );
    });

    it('rejects apiVersion "2"', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        (payload.data as { apiVersion: string }).apiVersion = '2';

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            UnsupportedProjectImportApiVersionError
        );
    });

    it('rejects malformed data wrapper', () => {
        expect(() =>
            normalizeProjectImportPayload({ data: null }, 'laravel')
        ).toThrow(MalformedProjectImportPayloadError);
    });

    it('rejects unknown versions before diagram normalization', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        (payload.data as { apiVersion: string }).apiVersion = 'preview';

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            UnsupportedProjectImportApiVersionError
        );
    });

    it('rejects missing diagram payloads', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        delete (payload.data as { diagram?: unknown }).diagram;

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            MalformedProjectImportPayloadError
        );
    });

    it('rejects malformed diagram payloads', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        payload.data.diagram = [] as unknown as typeof payload.data.diagram;

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            MalformedProjectImportPayloadError
        );
    });

    it('normalizes warning diagnostics and optional paths', () => {
        const payload = createValidProjectImportApiResponse('django');
        payload.data.diagnostics = [
            {
                severity: 'warning',
                code: 'unsupported_operation',
                message: 'Skipped unsupported migration operation.',
                path: 'app/migrations/0001_initial.py',
            },
        ];

        const result = normalizeProjectImportPayload(payload, 'django');

        expect(result.diagnostics).toEqual([
            {
                severity: 'warning',
                code: 'unsupported_operation',
                message: 'Skipped unsupported migration operation.',
                path: 'app/migrations/0001_initial.py',
            },
        ]);
    });

    it('rejects invalid diagnostics', () => {
        const payload = createValidProjectImportApiResponse('django');
        payload.data.diagnostics = [
            { severity: 'warning' },
        ] as unknown as typeof payload.data.diagnostics;

        expect(() => normalizeProjectImportPayload(payload, 'django')).toThrow(
            MalformedProjectImportPayloadError
        );
    });

    it('rejects framework mismatches', () => {
        const payload = createValidProjectImportApiResponse('django');

        expect(() => normalizeProjectImportPayload(payload, 'laravel')).toThrow(
            InconsistentProjectImportFrameworkError
        );
    });

    it('rejects unknown frameworks in the payload', () => {
        const payload = createValidProjectImportApiResponse('laravel');
        (payload.data as { framework: string }).framework = 'symfony';

        expect(() =>
            normalizeProjectImportPayload(payload, 'symfony' as 'laravel')
        ).toThrow(MalformedProjectImportPayloadError);
    });

    it('never exposes project source content in normalization errors', () => {
        const payload = {
            data: {
                apiVersion: '1',
                framework: 'laravel',
                diagram: FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE,
                diagnostics: [],
            },
        };

        try {
            normalizeProjectImportPayload(payload, 'laravel');
        } catch (error) {
            expect(JSON.stringify(error)).not.toContain(
                FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE
            );
        }
    });
});
