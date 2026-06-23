/**
 * Unified SQL Validator
 * Delegates to appropriate dialect validators based on database type
 */

import { DatabaseType } from '@/lib/domain/database-type';
import type {
    ValidationResult,
    ValidationError,
    ValidationWarning,
} from './validators/postgresql-validator';

// Re-export types for backward compatibility
export type { ValidationResult, ValidationError, ValidationWarning };

/**
 * Validate SQL based on the database type
 * @param sql - The SQL string to validate
 * @param databaseType - The target database type
 * @returns ValidationResult with errors, warnings, and optional fixed SQL
 */
export async function validateSQL(
    sql: string,
    databaseType: DatabaseType
): Promise<ValidationResult> {
    switch (databaseType) {
        case DatabaseType.POSTGRESQL:
        case DatabaseType.COCKROACHDB: {
            const { validatePostgreSQLDialect } =
                await import('./validators/postgresql-validator');
            return validatePostgreSQLDialect(sql);
        }

        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB: {
            const { validateMySQLDialect } =
                await import('./validators/mysql-validator');
            return validateMySQLDialect(sql);
        }

        case DatabaseType.SQL_SERVER: {
            const { validateSQLServerDialect } =
                await import('./validators/sqlserver-validator');
            return validateSQLServerDialect(sql);
        }

        case DatabaseType.SQLITE: {
            const { validateSQLiteDialect } =
                await import('./validators/sqlite-validator');
            return validateSQLiteDialect(sql);
        }

        case DatabaseType.ORACLE: {
            const { validateOracleDialect } =
                await import('./validators/oracle-validator');
            return validateOracleDialect(sql);
        }

        default:
            return {
                isValid: false,
                errors: [
                    {
                        line: 1,
                        message: `Unsupported database type: ${databaseType}`,
                        type: 'unsupported',
                    },
                ],
                warnings: [],
            };
    }
}
