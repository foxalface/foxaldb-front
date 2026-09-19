import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'Đã bỏ qua view «{{path}}».',
    keyless_table_skipped:
        'Đã bỏ qua bảng «{{path}}» vì nó không có cột nào có thể biểu diễn an toàn.',
    keyless_table:
        'Bảng «{{path}}» không có khóa chính và được xuất dưới dạng bảng Drizzle gốc mà không bịa ra id.',
    schema_ignored_sqlite:
        'SQLite không dùng schema «{{schema}}»; bảng «{{path}}» được xuất không có bộ định danh schema.',
    mysql_catalog_omitted:
        'Catalog MySQL «{{catalog}}» bị bỏ qua; Drizzle dùng tên bảng không định danh và một kết nối cơ sở dữ liệu duy nhất.',
    mysql_multiple_catalogs_ignored:
        'Xuất MySQL bỏ qua {{count}} catalog và phát tên bảng không định danh vì tên vật lý vẫn duy nhất.',
    mariadb_catalog_omitted:
        'Catalog MariaDB «{{catalog}}» bị bỏ qua; Drizzle dùng tên bảng không định danh và một kết nối cơ sở dữ liệu duy nhất.',
    mariadb_multiple_catalogs_ignored:
        'Xuất MariaDB bỏ qua {{count}} catalog và phát tên bảng không định danh vì tên vật lý vẫn duy nhất.',
    mariadb_mysql_dialect_adapted:
        'MariaDB được xuất bằng API MySQL của Drizzle (dialect «{{dialect}}»). Drizzle 0.45 không có dialect MariaDB hạng nhất.',
    postgres_schema_qualified:
        'Schema PostgreSQL «{{schema}}» được xuất bằng pgSchema().',
    uuid_as_text:
        'Trường UUID «{{path}}» được xuất dưới dạng text vì cơ sở dữ liệu này không có kiểu UUID gốc trong Drizzle 0.45.',
    increment_omitted:
        'Tự tăng trên «{{path}}» đã bị bỏ qua vì không thể biểu diễn an toàn.',
    set_null_omitted:
        'ON DELETE SET NULL đã bị bỏ qua trên «{{path}}» vì một cột khóa ngoại là NOT NULL.',
    sqlite_boolean_integer:
        'Trường boolean «{{path}}» được xuất dưới dạng integer({ mode: "boolean" }) vì SQLite không có kiểu boolean gốc.',
    sqlite_json_text:
        'Trường JSON «{{path}}» được xuất dưới dạng text({ mode: "json" }) vì SQLite lưu JSON dưới dạng TEXT.',
    table_name_adjusted: {
        table: 'Bảng «{{path}}» được xuất dưới dạng hằng TypeScript {{tsName}}. Tên bảng vật lý được giữ nguyên.',
        pgEnum: 'Enum PostgreSQL «{{path}}» được xuất dưới dạng hằng TypeScript {{tsName}}. Tên enum vật lý được giữ nguyên.',
        pgSchema:
            'Schema PostgreSQL «{{path}}» được xuất dưới dạng hằng TypeScript {{tsName}}.',
    },
    table_name_collision:
        'Hằng bảng «{{tsName}}» cho «{{path}}» được cấp phát để tránh định danh TypeScript trùng lặp.',
    column_name_adjusted:
        'Cột «{{path}}» được xuất dưới dạng thuộc tính TypeScript {{tsName}}. Tên cột vật lý được giữ nguyên.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Khóa ngoại phức hợp «{{path}}» đã bị bỏ qua vì danh sách cột nguồn và đích không cùng hiện diện.',
        composite_fk_arity_mismatch:
            'Khóa ngoại phức hợp «{{path}}» đã bị bỏ qua vì số cột nguồn và đích khác nhau.',
        label_only:
            'Quan hệ nhiều-nhiều «{{path}}» đã bị bỏ qua vì không xác định được bảng nối vật lý từ nhãn.',
        table_not_exported:
            'Quan hệ «{{path}}» đã bị bỏ qua vì một bảng được tham chiếu không được xuất.',
        unresolved_member:
            'Quan hệ «{{path}}» đã bị bỏ qua vì một trường được tham chiếu không được xuất.',
    },
    index_omitted: {
        unsupported_method:
            'Chỉ mục «{{path}}» đã bị bỏ qua vì kiểu «{{indexType}}» không được xuất.',
        field_not_exported:
            'Chỉ mục «{{path}}» đã bị bỏ qua vì một trường được tham chiếu không được xuất.',
    },
    comment_omitted: {
        table: 'Ghi chú bảng trên «{{path}}» bị bỏ qua vì Drizzle 0.45 không có API ghi chú có cấu trúc mà bộ xuất này dùng.',
        column: 'Ghi chú cột trên «{{path}}» bị bỏ qua vì Drizzle 0.45 không có API ghi chú có cấu trúc mà bộ xuất này dùng.',
    },
    check_omitted: {
        table: 'Ràng buộc CHECK trên «{{path}}» bị bỏ qua vì SQL thô không được chèn vào TypeScript được tạo.',
        column: 'CHECK trên «{{path}}» bị bỏ qua vì SQL thô không được chèn vào TypeScript được tạo.',
    },
    set_degraded: {
        set_as_text:
            'SET của trường «{{path}}» được xuất dưới dạng text; kiểu SET gốc không được tạo.',
    },
    enum_degraded: {
        ts_enum_only:
            'Enum của trường «{{path}}» được xuất dưới dạng text({ enum: [...] }); SQLite không có ràng buộc enum vật lý.',
        unsupported_enum:
            'Enum của trường «{{path}}» được xuất dưới dạng text vì không thể biểu diễn thành enum Drizzle gốc.',
        unknown_values:
            'Enum của trường «{{path}}» được xuất dưới dạng text vì thiếu giá trị enum.',
    },
    type_omitted: {
        array: 'Trường mảng trên «{{path}}» bị bỏ khỏi xuất Drizzle.',
        unsupported:
            'Trường trên «{{path}}» đã bị bỏ qua vì kiểu của nó không thể biểu diễn.',
        unimplemented_database:
            'Ánh xạ kiểu chưa được triển khai cho kiểu cơ sở dữ liệu «{{databaseType}}».',
    },
    type_degraded: {
        binary_as_bytea:
            'Kiểu nhị phân của trường «{{path}}» được xuất dưới dạng bytea().',
    },
    default_omitted: {
        unsupported_type:
            'Giá trị mặc định trên «{{path}}» đã bị bỏ qua (kiểu mặc định không được hỗ trợ).',
        current_timestamp_non_datetime:
            'Giá trị mặc định trên «{{path}}» đã bị bỏ qua (CURRENT_TIMESTAMP trên trường không phải datetime).',
        sql_expression:
            'Giá trị mặc định trên «{{path}}» đã bị bỏ qua (biểu thức SQL không được hỗ trợ: {{expression}}).',
        unclear:
            'Giá trị mặc định trên «{{path}}» đã bị bỏ qua (giá trị mặc định không rõ: {{expression}}).',
        boolean_on_non_boolean:
            'Giá trị mặc định trên «{{path}}» đã bị bỏ qua (mặc định boolean trên trường không boolean).',
        numeric_on_non_numeric:
            'Giá trị mặc định trên «{{path}}» đã bị bỏ qua (mặc định số trên trường không phải số).',
    },
};
