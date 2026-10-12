import type { Diagram } from '@/lib/domain/diagram';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import {
    CHANGE_TYPES,
    ENTITY_CATEGORIES,
    type ChangeType,
    type EntityCategory,
} from './diff-types';

const CONTENT_HASH = /^[a-f0-9]{64}$/;

export interface SchemaMergeApplySummary {
    selected: number;
    categories: Record<EntityCategory, number>;
    types: Record<ChangeType, number>;
}

/**
 * M4 Apply success body.
 *
 * `content` is the authoritative stored diagram. Operation bodies are not
 * part of the response the client applies locally.
 */
export interface SchemaMergeApplyResponse {
    resultContentHash: string;
    updatedAt: string | null;
    content: Diagram;
    appliedOperationIds: string[];
    summary: SchemaMergeApplySummary;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0;

const decodeSummary = (value: unknown): SchemaMergeApplySummary | null => {
    if (!isRecord(value) || !isCount(value.selected)) {
        return null;
    }

    if (!isRecord(value.categories) || !isRecord(value.types)) {
        return null;
    }

    const categories = {} as Record<EntityCategory, number>;

    for (const category of ENTITY_CATEGORIES) {
        if (!isCount(value.categories[category])) {
            return null;
        }

        categories[category] = value.categories[category];
    }

    const types = {} as Record<ChangeType, number>;

    for (const changeType of CHANGE_TYPES) {
        if (!isCount(value.types[changeType])) {
            return null;
        }

        types[changeType] = value.types[changeType];
    }

    return {
        selected: value.selected,
        categories,
        types,
    };
};

const decodeContent = (
    content: unknown,
    diagramId: string,
    updatedAt: string | null
): Diagram | null => {
    if (!isRecord(content) || typeof content.databaseType !== 'string') {
        return null;
    }

    if (
        (content.tables !== undefined && !Array.isArray(content.tables)) ||
        (content.relationships !== undefined &&
            !Array.isArray(content.relationships)) ||
        (content.dependencies !== undefined &&
            !Array.isArray(content.dependencies)) ||
        (content.areas !== undefined && !Array.isArray(content.areas)) ||
        (content.customTypes !== undefined &&
            !Array.isArray(content.customTypes)) ||
        (content.notes !== undefined && !Array.isArray(content.notes))
    ) {
        return null;
    }

    const diagram = normalizeDiagramFromApi(
        {
            id: diagramId,
            content,
            ...(updatedAt ? { updatedAt } : {}),
        },
        diagramId
    );

    if (diagram.id.length === 0 || diagram.databaseType.length === 0) {
        return null;
    }

    return diagram;
};

export const decodeSchemaMergeApplyResponse = (
    value: unknown,
    diagramId: string
): SchemaMergeApplyResponse | null => {
    if (!isRecord(value) || typeof value.resultContentHash !== 'string') {
        return null;
    }

    if (!CONTENT_HASH.test(value.resultContentHash)) {
        return null;
    }

    if (value.updatedAt !== null && typeof value.updatedAt !== 'string') {
        return null;
    }

    if (!Array.isArray(value.appliedOperationIds)) {
        return null;
    }

    if (
        value.appliedOperationIds.some(
            (id) => typeof id !== 'string' || id.length === 0
        )
    ) {
        return null;
    }

    const summary = decodeSummary(value.summary);
    const content = decodeContent(value.content, diagramId, value.updatedAt);

    if (!summary || !content) {
        return null;
    }

    return {
        resultContentHash: value.resultContentHash,
        updatedAt: value.updatedAt,
        content,
        appliedOperationIds: [...value.appliedOperationIds],
        summary,
    };
};
