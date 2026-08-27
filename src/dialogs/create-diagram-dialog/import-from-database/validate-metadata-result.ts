import {
    fixMetadataJson,
    isStringMetadataJson,
} from '@/lib/data/import-metadata/utils';
import { DatabaseType } from '@/lib/domain/database-type';
import { SSMS_TRUNCATION_LENGTH } from './constants';

export type MetadataValidationState =
    | 'empty'
    | 'waiting'
    | 'valid'
    | 'repairable'
    | 'invalid'
    | 'truncated';

export interface MetadataValidationResult {
    state: MetadataValidationState;
    canContinue: boolean;
    normalizedContent: string | null;
}

export const validateMetadataResult = (
    content: string,
    {
        databaseType,
        repairAttempts,
    }: {
        databaseType: DatabaseType;
        repairAttempts: number;
    }
): MetadataValidationResult => {
    const trimmed = content.trim();

    if (!trimmed) {
        return {
            state: 'empty',
            canContinue: false,
            normalizedContent: null,
        };
    }

    if (
        databaseType === DatabaseType.SQL_SERVER &&
        trimmed.length === SSMS_TRUNCATION_LENGTH
    ) {
        return {
            state: 'truncated',
            canContinue: false,
            normalizedContent: null,
        };
    }

    if (isStringMetadataJson(trimmed)) {
        return {
            state: 'valid',
            canContinue: true,
            normalizedContent: trimmed,
        };
    }

    const fixed = fixMetadataJson(trimmed);
    if (fixed !== trimmed && isStringMetadataJson(fixed)) {
        return {
            state: 'valid',
            canContinue: true,
            normalizedContent: fixed,
        };
    }

    if (trimmed.includes('{') && trimmed.includes('}')) {
        return {
            state: repairAttempts > 0 ? 'invalid' : 'repairable',
            canContinue: false,
            normalizedContent: null,
        };
    }

    return {
        state: 'waiting',
        canContinue: false,
        normalizedContent: null,
    };
};

export const repairMetadataResult = (content: string): string | null => {
    const fixed = fixMetadataJson(content.trim());

    if (isStringMetadataJson(fixed)) {
        return fixed;
    }

    return null;
};
