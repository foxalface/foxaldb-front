import type { TFunction } from 'i18next';
import type { DrizzleExportError } from '@/lib/api/drizzle-export-types';
import {
    KNOWN_DRIZZLE_EXPORT_ERROR_CODES,
    type KnownDrizzleExportErrorCode,
} from './drizzle-export-note-codes';

const I18N_PREFIX = 'export_wizard.drizzle.result_step.errors';
const GENERIC_ERROR_KEY = 'export_wizard.drizzle.result_step.error_semantic';

export const getDrizzleExportErrorPresentation = (
    error: Pick<DrizzleExportError, 'code' | 'message' | 'path'>,
    t: TFunction
): string => {
    if (
        !KNOWN_DRIZZLE_EXPORT_ERROR_CODES.includes(
            error.code as KnownDrizzleExportErrorCode
        )
    ) {
        return t(GENERIC_ERROR_KEY);
    }

    const interpolations =
        typeof error.path === 'string' && error.path.length > 0
            ? { path: error.path }
            : {};

    const translated = t(`${I18N_PREFIX}.${error.code}`, interpolations);

    if (
        translated === `${I18N_PREFIX}.${error.code}` ||
        translated.trim().length === 0
    ) {
        return t(GENERIC_ERROR_KEY);
    }

    return translated;
};
