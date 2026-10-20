import { describe, expect, it } from 'vitest';
import { PROJECT_IMPORT_BACKEND_ERROR_CODES } from '../project-import-backend-error-codes';

/** Mirrors backend/tests/Unit/Support/ProjectImport/ProjectImportErrorCodesTest.php */
const EXPECTED_BACKEND_CODES = [
    'unsafe_path',
    'duplicate_path',
    'disallowed_framework_file',
    'missing_framework_evidence',
    'bundle_too_many_files',
    'bundle_file_too_large',
    'bundle_total_too_large',
    'project_import_parse_failed',
    'project_parser_unavailable',
];

describe('PROJECT_IMPORT_BACKEND_ERROR_CODES', () => {
    it('matches the backend production error inventory', () => {
        expect([...PROJECT_IMPORT_BACKEND_ERROR_CODES]).toEqual(
            EXPECTED_BACKEND_CODES
        );
    });
});
