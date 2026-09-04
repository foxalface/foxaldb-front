import {
    LARAVEL_CREATE_POSTS_MIGRATION,
    LARAVEL_CREATE_USERS_MIGRATION,
} from './flexible-layout-fixtures';
import { createTestZipFile } from './build-test-zip';

/** Manual QA fixture: Laravel root + catalog + tenant migration groups */
export const createLaravelMultiDbQaZip = () =>
    createTestZipFile(
        {
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/0001_create_admin_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/catalog/0002_create_categories.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'database/migrations/tenant/0002_create_orders.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        },
        'foxaldb-qa-laravel-multi-db.zip'
    );
