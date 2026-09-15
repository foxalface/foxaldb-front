import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'Đã bỏ qua view "{{path}}".',
    schema_ignored_sqlite:
        'SQLite không dùng schema "{{schema}}"; bảng "{{path}}" được xuất không có bộ định danh schema.',
    mysql_catalog_omitted:
        'Catalog MySQL "{{catalog}}" đã bị bỏ qua; Rails dùng database đang kết nối và tên bảng không định danh.',
    mysql_multiple_catalogs_ignored:
        'Xuất MySQL bỏ qua {{count}} catalog và phát ra tên bảng không định danh vì tên vật lý vẫn duy nhất.',
    mariadb_catalog_omitted:
        'Catalog MariaDB "{{catalog}}" đã bị bỏ qua; Rails dùng database đang kết nối và tên bảng không định danh.',
    mariadb_multiple_catalogs_ignored:
        'Xuất MariaDB bỏ qua {{count}} catalog và phát ra tên bảng không định danh vì tên vật lý vẫn duy nhất.',
    composite_fk_unsupported:
        'Khóa ngoại composite "{{path}}" không được xuất; Rails V1 chỉ phát ra khóa ngoại một cột an toàn.',
    keyless_relationship_skipped:
        'Quan hệ "{{path}}" đã bị bỏ qua vì bảng chính không hỗ trợ ngữ nghĩa khóa ngoại.',
    many_to_many_skipped:
        'Quan hệ nhiều-nhiều "{{path}}" đã bị bỏ qua; không thể suy ra phía khóa ngoại đơn từ nhãn.',
    keyless_model:
        'Bảng "{{path}}" không có primary key. Model đặt self.primary_key = nil; khả năng lưu trữ Active Record có thể bị giới hạn.',
    one_to_one_degraded_non_unique_fk:
        'Quan hệ một-một trên "{{path}}" được xuất dưới dạng has_many vì khóa ngoại không duy nhất.',
    many_to_many_through_skipped:
        'has_many :through không được tạo cho bảng join "{{path}}" vì tên association không rõ ràng.',
    model_name_adjusted:
        'Lớp model cho bảng "{{path}}" được gán là {{className}}.',
    model_name_collision:
        'Lớp model {{className}} cho bảng "{{path}}" được gán để tránh hằng số trùng lặp.',
    on_update_omitted:
        'ON UPDATE "{{action}}" không được thể hiện trong schema.rb add_foreign_key Rails 8.1 cho "{{path}}".',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL đã bị bỏ qua trên "{{path}}" vì cột khóa ngoại không nullable.',
        update: 'ON UPDATE SET NULL đã bị bỏ qua trên "{{path}}" vì cột khóa ngoại không nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to trên "{{path}}" được gán là {{associationName}} để tránh xung đột tên.',
        inverse:
            'Association ngược trên "{{path}}" được gán là {{associationName}} để tránh xung đột tên.',
    },
    relationship_skipped: {
        table_not_exported:
            'Quan hệ "{{path}}" đã bị bỏ qua vì một bảng không được xuất.',
        unresolved_field_ids:
            'Quan hệ "{{path}}" đã bị bỏ qua vì không thể phân giải ID trường khóa ngoại.',
        referenced_column_not_exported:
            'Quan hệ "{{path}}" đã bị bỏ qua vì một cột được tham chiếu không được xuất.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" đã bị bỏ qua vì kiểu "{{indexType}}" không được xuất trong schema.rb Rails.',
        missing_field:
            'Index "{{path}}" đã bị bỏ qua vì trường được tham chiếu bị thiếu.',
        field_not_exported:
            'Index "{{path}}" đã bị bỏ qua vì trường được tham chiếu không được xuất.',
    },
    comment_omitted: {
        table: 'Chú thích bảng trên "{{path}}" bị bỏ qua vì SQLite không lưu trữ chú thích.',
        column: 'Chú thích cột trên "{{path}}" bị bỏ qua vì SQLite không lưu trữ chú thích.',
    },
    check_omitted: {
        table: 'Ràng buộc check rỗng trên "{{path}}" đã bị bỏ qua.',
        column: 'Check rỗng trên "{{path}}" đã bị bỏ qua.',
    },
    set_degraded: {
        sqlite_as_string:
            'Trường set trên "{{path}}" được xuất dưới dạng string cho SQLite.',
        mysql_family_as_string:
            'Trường set trên "{{path}}" được xuất dưới dạng string; DSL SET gốc không được phát ra.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Trường enum trên "{{path}}" được xuất dưới dạng string cho SQLite.',
        pg_type_values_missing:
            'Enum PostgreSQL "{{path}}" không được khai báo vì thiếu giá trị chuẩn.',
        pg_field_values_missing:
            'Trường "{{path}}" enum PostgreSQL được xuất dưới dạng string vì thiếu giá trị enum chuẩn.',
        pg_field_named_values_missing:
            'Trường "{{path}}" enum PostgreSQL "{{enumName}}" được xuất dưới dạng string vì thiếu giá trị enum.',
        mysql_family_as_string:
            'Trường enum trên "{{path}}" được xuất dưới dạng string; DSL enum/set gốc không được phát ra.',
    },
    type_omitted: {
        array: 'Trường array trên "{{path}}" không được thể hiện trong schema.rb Rails.',
        spatial:
            'Trường spatial trên "{{path}}" không được thể hiện trong schema.rb Rails.',
        unsupported:
            'Trường trên "{{path}}" đã bị bỏ qua vì kiểu của nó không thể được thể hiện.',
        unimplemented_database:
            'Ánh xạ kiểu chưa được triển khai cho kiểu database "{{databaseType}}".',
    },
    type_degraded: {
        serial_no_sequence:
            'Trường serial không phải primary key trên "{{path}}" được xuất dưới dạng integer thông thường không có sequence.',
        jsonb_as_json: 'Trường "{{path}}" jsonb được xuất dưới dạng json.',
        uuid_as_string:
            'Trường "{{path}}" uuid được xuất dưới dạng string(36).',
        null_as_text:
            'Trường "{{path}}" với lớp lưu trữ null được xuất dưới dạng text.',
        money_as_decimal:
            'Trường "{{path}}" money được xuất dưới dạng decimal.',
        year_as_integer: 'Trường "{{path}}" year được xuất dưới dạng integer.',
        bit_as_boolean: 'Trường "{{path}}" bit được xuất dưới dạng boolean.',
        type_as_string:
            'Trường "{{path}}" kiểu "{{sourceType}}" được xuất dưới dạng {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (biểu thức SQL giống lambda: {{expression}}).',
        sql_expression:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (biểu thức SQL không được hỗ trợ: {{expression}}).',
        unclear:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (giá trị mặc định không rõ ràng: {{expression}}).',
        current_timestamp_non_datetime:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (CURRENT_TIMESTAMP trên trường không phải datetime).',
        uuid_function_non_pg:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (giá trị mặc định hàm UUID trên trường UUID không phải PostgreSQL).',
        boolean_on_non_boolean:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (giá trị mặc định boolean trên trường không phải boolean).',
        numeric_on_non_numeric:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (giá trị mặc định số trên trường không phải số).',
        unsupported_type:
            'Giá trị mặc định trên "{{path}}" đã bị bỏ qua (kiểu giá trị mặc định không được hỗ trợ).',
    },
};
