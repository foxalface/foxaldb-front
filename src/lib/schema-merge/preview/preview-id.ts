/**
 * Deterministic 32-bit FNV-1a hash rendered as lowercase hex (no dependencies).
 */
const fnv1a32 = (input: string): string => {
    let hash = 0x811c9dc5;

    for (let index = 0; index < input.length; index++) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(16).padStart(8, '0');
};

export const previewTableId = (semanticKey: string): string =>
    `merge-preview-table-${fnv1a32(semanticKey)}`;

export const previewFieldId = (semanticKey: string): string =>
    `merge-preview-field-${fnv1a32(semanticKey)}`;

export const previewRelationshipId = (semanticKey: string): string =>
    `merge-preview-relationship-${fnv1a32(semanticKey)}`;
