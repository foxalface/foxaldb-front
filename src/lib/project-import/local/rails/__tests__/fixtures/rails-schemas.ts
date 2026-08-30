export const USERS_POSTS_SCHEMA = `ActiveRecord::Schema[8.0].define(version: 2025_01_01_000000) do
  create_table "users", force: :cascade do |t|
    t.string "email", null: false, limit: 255
    t.timestamps null: false
  end

  create_table "posts", force: :cascade do |t|
    t.string "title", null: false, limit: 200
    t.bigint "user_id", null: false
    t.boolean "published", default: false, null: false
    t.timestamps null: false
  end

  add_index "posts", ["user_id"], name: "index_posts_on_user_id"
  add_foreign_key "posts", "users", column: "user_id", on_delete: :cascade
end`;

export const IMPLICIT_ID_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "widgets", force: :cascade do |t|
    t.string "name", null: false
  end
end`;

export const NO_IMPLICIT_ID_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "sessions", id: false, force: :cascade do |t|
    t.string "token", null: false, primary_key: true
  end
end`;

export const CUSTOM_PRIMARY_KEY_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "legacy_users", primary_key: "legacy_id", force: :cascade do |t|
    t.bigint "legacy_id", null: false
    t.string "email"
  end
end`;

export const SCALAR_TYPES_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "samples", force: :cascade do |t|
    t.string "code", limit: 12
    t.text "body"
    t.integer "count"
    t.bigint "big_count"
    t.float "ratio"
    t.decimal "amount", precision: 12, scale: 4, default: "0.0"
    t.boolean "active"
    t.date "started_on"
    t.datetime "started_at"
    t.binary "payload"
    t.json "metadata"
    t.jsonb "details"
    t.uuid "external_id"
  end
end`;

export const COMPOSITE_INDEX_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "memberships", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "user_id", null: false
    t.index ["tenant_id", "user_id"], name: "index_memberships_on_tenant_id_and_user_id", unique: true
  end
end`;

export const MULTILINE_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "articles", force: :cascade do |t|
    t.string "title",
      null: false,
      comment: "contains do/end in comment # end"
  end
end`;

export const MALFORMED_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "broken", force: :cascade do |t|
    t.string "name"
`;

export const UNKNOWN_HELPER_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "extras", force: :cascade do |t|
    t.unknown_helper "value"
    t.string "name"
  end
end`;

export const REFERENCES_SCHEMA = `ActiveRecord::Schema.define(version: 1) do
  create_table "comments", force: :cascade do |t|
    t.references :post, null: false, foreign_key: true
    t.text "body"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title"
  end
end`;

import { FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE } from '../../rails-constants';

export const SENTINEL_SCHEMA = `# ${FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE}\n${USERS_POSTS_SCHEMA}`;
