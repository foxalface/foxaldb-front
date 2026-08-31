export const DRIZZLE_JOURNAL = JSON.stringify({
    version: '7',
    dialect: 'postgresql',
    entries: [
        {
            idx: 0,
            version: '7',
            when: 1,
            tag: '0000_init',
            breakpoints: true,
        },
        {
            idx: 1,
            version: '7',
            when: 2,
            tag: '0001_add_bio',
            breakpoints: true,
        },
    ],
});

export const DRIZZLE_INIT_SQL = `
CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" varchar(255) NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "title" varchar(200) NOT NULL
);

ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
`;

export const DRIZZLE_ADD_BIO_SQL = `
ALTER TABLE "users" ADD COLUMN "bio" text;
`;

export const DRIZZLE_MYSQL_INIT_SQL = `
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);
`;

export const DRIZZLE_SENTINEL_SQL = `
CREATE TABLE secret_probe (
    id INT PRIMARY KEY
);
`;

export const FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE =
    'FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE';

export const DRIZZLE_QA_CUMULATIVE_JOURNAL = JSON.stringify({
    version: '7',
    dialect: 'mysql',
    entries: [
        {
            idx: 0,
            version: '7',
            when: 1,
            tag: '0000_initial',
            breakpoints: true,
        },
        {
            idx: 1,
            version: '7',
            when: 2,
            tag: '0001_add_sku',
            breakpoints: true,
        },
    ],
});

export const DRIZZLE_QA_CUMULATIVE_INITIAL_SQL = `
CREATE TABLE \`products\` (
  \`id\` bigint NOT NULL AUTO_INCREMENT,
  \`name\` varchar(120) NOT NULL,
  PRIMARY KEY (\`id\`)
);
`;

export const DRIZZLE_QA_CUMULATIVE_ADD_SKU_SQL = `
ALTER TABLE \`products\`
ADD COLUMN \`sku\` varchar(32) NOT NULL;

CREATE UNIQUE INDEX \`products_sku_unique\`
ON \`products\` (\`sku\`);
`;
