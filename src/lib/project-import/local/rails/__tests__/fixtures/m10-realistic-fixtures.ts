export const QA_RAILS_SCHEMA = `ActiveRecord::Schema[8.0].define(version: 2026_01_01_000000) do
  create_table "users", force: :cascade do |t|
    t.string "email", limit: 255, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", limit: 200, null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  add_foreign_key "posts", "users", column: "user_id", on_delete: :cascade
end`;

export const QA_DRIZZLE_SQL = `CREATE TABLE \`users\` (
  \`id\` bigint NOT NULL AUTO_INCREMENT,
  \`email\` varchar(255) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`users_email_unique\` (\`email\`)
);

CREATE TABLE \`posts\` (
  \`id\` bigint NOT NULL AUTO_INCREMENT,
  \`user_id\` bigint NOT NULL,
  \`title\` varchar(200) NOT NULL,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`posts_user_fk\`
    FOREIGN KEY (\`user_id\`)
    REFERENCES \`users\` (\`id\`)
    ON DELETE CASCADE
);`;
