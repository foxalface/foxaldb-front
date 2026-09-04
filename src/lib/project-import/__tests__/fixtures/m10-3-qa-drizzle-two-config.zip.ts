import {
    FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
    FLEXIBLE_DRIZZLE_CONFIG,
    FLEXIBLE_DRIZZLE_INITIAL_SQL,
    FLEXIBLE_DRIZZLE_JOURNAL,
} from './flexible-layout-fixtures';
import { createTestZipFile } from './build-test-zip';

/** Manual QA fixture: Drizzle api + admin configs */
export const createDrizzleTwoConfigQaZip = () =>
    createTestZipFile(
        {
            'package.json': '{"dependencies":{"drizzle-orm":"^0.30.0"}}',
            'api/drizzle.config.ts': FLEXIBLE_DRIZZLE_CONFIG,
            'api/drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
            'api/drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
            'admin/drizzle.config.ts': FLEXIBLE_DRIZZLE_CONFIG,
            'admin/drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
            'admin/drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
        },
        'foxaldb-qa-drizzle-two-config.zip'
    );
