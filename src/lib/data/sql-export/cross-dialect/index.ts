/**
 * Cross-dialect SQL export module.
 * Provides deterministic conversion between different database dialects.
 */

// Re-export types
export type {
    TypeMapping,
    TypeMappingTable,
    IndexTypeMapping,
    IndexTypeMappingTable,
} from './types';

// Re-export PostgreSQL exporters
export { exportPostgreSQLToMySQL } from './postgresql/to-mysql';
export { exportPostgreSQLToMSSQL } from './postgresql/to-mssql';

// Re-export unsupported features detection
export {
    detectUnsupportedFeatures,
    formatWarningsHeader,
    getFieldInlineComment,
    getIndexInlineComment,
} from './unsupported-features';
export type {
    UnsupportedFeature,
    UnsupportedFeatureType,
} from './unsupported-features';

export {
    hasCrossDialectSupport,
    getSupportedTargetDialects,
} from './cross-dialect-support';
