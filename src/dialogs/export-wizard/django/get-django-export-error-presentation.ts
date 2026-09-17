import type { TFunction } from 'i18next';
import type { DjangoExportError } from '@/lib/api/django-export-types';
import {
    KNOWN_DJANGO_EXPORT_ERROR_CODES,
    type KnownDjangoExportErrorCode,
} from './django-export-note-codes';

const I18N_PREFIX = 'export_wizard.django.result_step.errors';

const ERRORS_REQUIRING_PATH: ReadonlySet<KnownDjangoExportErrorCode> = new Set([
    'unsupported_structural_field',
    'mysql_catalog_collision',
    'mariadb_catalog_collision',
]);

export const getDjangoExportErrorPresentation = (
    error: Pick<DjangoExportError, 'code' | 'message' | 'path'>,
    t: TFunction
): string => {
    if (
        !KNOWN_DJANGO_EXPORT_ERROR_CODES.includes(
            error.code as KnownDjangoExportErrorCode
        )
    ) {
        return error.message;
    }

    const code = error.code as KnownDjangoExportErrorCode;
    const interpolations =
        typeof error.path === 'string' && error.path.length > 0
            ? { path: error.path }
            : null;

    if (ERRORS_REQUIRING_PATH.has(code) && interpolations === null) {
        return error.message;
    }

    const translated = t(`${I18N_PREFIX}.${code}`, interpolations ?? {});

    if (
        translated === `${I18N_PREFIX}.${code}` ||
        translated.trim().length === 0
    ) {
        return error.message;
    }

    return translated;
};
